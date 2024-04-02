import set from 'lodash/set';
import { AnyObject } from '../../common/types';
import { arrayLogicalOperators, arrayOperators } from '../constants';
import { Injectable } from '@nestjs/common';
import { unflatten, flatten } from 'flat';

@Injectable()
export class CaslPermissionTransformer {
  /**
   * Transform a Hasura permission into a Casl-compatible one.
   *
   */
  caslify(hasuraPermission: AnyObject) {
    const flattened = flatten({
      ...hasuraPermission,
    }) as AnyObject;

    const existsTransformed = this.formatExistsMatchers(flattened);

    const stackerOperatorsTransformed =
      this.formatStackerOperators(existsTransformed);

    const transformed = this.formatPermission(stackerOperatorsTransformed);

    const withFormattedArrays = this.formatArrayProperties(transformed);

    return withFormattedArrays;
  }

  /**
   * Unflatten array properties.
   *
   */
  private formatArrayProperties(flattened: AnyObject): AnyObject {
    const transformed = {} as AnyObject;

    Object.entries(flattened).forEach(([key, value]) => {
      const mainKey = this.nextOperatorRecursive(
        key,
        (currentKey) => !isNaN(+currentKey),
      );

      if (!mainKey) {
        return;
      }

      const bridgePath = this.getBridgePath(key, mainKey);

      if (!bridgePath) {
        return;
      }

      const unflattenedValue = unflatten(value);

      const resolvedValue = { [bridgePath]: unflattenedValue };

      set(transformed, mainKey, resolvedValue);
    });

    return !Object.keys(transformed).length ? flattened : transformed;
  }

  /**
   * Moves the nested $and or $or operators up to the root of the permissions object as the Casl package does not support those operators nested in the object.
   *
   */
  private formatStackerOperators(flattened: AnyObject): AnyObject {
    const transformed: AnyObject = {};

    Object.entries(flattened).forEach(([key, value]) => {
      const reg = new RegExp(/(\$and|\$or)\.[\d]\./g);

      const matches = key.match(reg)?.join('') ?? '';

      const newPath = matches + key.replace(reg, '');

      transformed[newPath] = value;
    });

    return transformed;
  }

  /**
   * Determine if the property is a matcher but not an array type one. ($and, $or)
   *
   */
  private isNonArrayMatcher(property: string): boolean {
    return (
      property.startsWith('$') &&
      !arrayLogicalOperators[property as keyof typeof arrayLogicalOperators] // TODO: Improve this type.
    );
  }

  /**
   * Format the _exists operators to a Casl-compatible format.
   *
   */
  private formatExistsMatchers(flattened: AnyObject): AnyObject {
    const transformed: AnyObject = {};

    let currentTable: string | null = null;

    Object.entries(flattened).forEach(([key, value]) => {
      const [, lastPath] = key.split('_exists.');

      if (!lastPath) {
        transformed[key] = value;

        return;
      }

      if (lastPath === '_table.schema') {
        return;
      }

      if (lastPath === '_table.name') {
        currentTable = value;

        return;
      }

      const transformedKey = key.replace(
        '_exists._where',
        `_exists.${currentTable}`,
      );

      transformed[transformedKey] = value;
    });

    return !Object.keys(transformed).length ? flattened : transformed;
  }

  /**
   * Unflatten the permission object into a Casl-compatible conditions object.
   *
   */
  private formatPermission(flattened: AnyObject): AnyObject {
    const transformed: AnyObject = {};

    const acc: AnyObject = {};

    Object.entries(flattened).forEach(([key, value]) => {
      this.flattenRecursive(key, value, this.isNonArrayMatcher, {
        temporalAccumulator: acc,
        transformed,
      });
    });

    return transformed;
  }

  /**
   * Flatten the object until it matches the casl format.
   * @example { key: { $eq: value } }
   * @example { key.subkey: { $eq: value } }
   * @example { $and: [ {key.subkey: { $eq: value }} ]
   * @example { $and: [ {key.subkey: { $int: [value] }} ]
   *
   */
  private flattenRecursive(
    key: string,
    rawValue: AnyObject,
    nextKeyResolver: (rawPath: string) => boolean,
    options: FlattenRecursiveOptions,
  ): void {
    const { temporalAccumulator, transformed } = options;

    const mainKey = this.nextOperatorRecursive(key, nextKeyResolver);

    if (!mainKey) {
      return;
    }

    const mainKeyParts = mainKey.split('.');

    const currentPath = this.getCurrentPath(mainKeyParts);

    const currentKey = mainKeyParts.pop() as string;

    delete temporalAccumulator[key];

    const formattedValue = this.formatFinalArrayOperator(
      currentKey,
      rawValue,
      transformed[currentPath],
    );

    const newObjectValue = {
      [currentKey]: formattedValue ?? rawValue,
    };

    temporalAccumulator[currentPath] = newObjectValue;

    transformed[currentPath] = newObjectValue;

    this.flattenRecursive(currentPath, newObjectValue, nextKeyResolver, {
      temporalAccumulator,
      transformed,
    });
  }

  /**
   * Format the final nested operator when the value is an array.
   * Example: $in, $nin
   *
   */
  private formatFinalArrayOperator(
    currentKey: string,
    newValue: AnyObject,
    currentKeyValue: AnyObject | undefined,
  ) {
    const isArrayOperator = currentKey in arrayOperators;

    if (!isArrayOperator) {
      return currentKeyValue;
    }

    const value = currentKeyValue?.[currentKey];

    return Array.isArray(value) ? [...value, newValue] : [newValue];
  }

  /**
   * Get the next operator
   *
   */
  private nextOperatorRecursive(
    key: string,
    condition: (currentKey: string) => boolean,
  ): string | null {
    const parts = key.split('.');

    const lastKeyPath = parts.slice(0, -1).join('.');

    const lastKey = parts.pop()?.trim();

    if (!parts.length || lastKeyPath === '' || !lastKey) {
      return null;
    }

    if (condition(lastKey)) {
      return key;
    }

    return this.nextOperatorRecursive(lastKeyPath, condition);
  }

  /**
   * Remove the last part and return a delimited string.
   *
   */
  private getCurrentPath(parts: string[]): string {
    return parts.slice(0, -1).join('.');
  }

  /**
   * Remove the primaryKey remaining characters after the mainKey string.
   *
   */
  private getBridgePath(primaryKey: string, mainKey: string): string | null {
    const [, croppedPath = null] = primaryKey.split(`${mainKey}.`);

    return croppedPath;
  }
}

type FlattenRecursiveOptions = {
  temporalAccumulator: AnyObject;
  transformed: AnyObject;
};
