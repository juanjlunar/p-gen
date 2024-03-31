import get from 'lodash/get';

/**
 * Interpolate variables inside a JSON string.
 *
 */
export function JSONInterpolate<
  T extends Record<string, unknown> = Record<string, unknown>,
>(template: string, vars: Record<string, unknown>): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviver = (_key: string, rawValue: any) => {
    if (rawValue === null || rawValue[0] !== '$') {
      return rawValue;
    }

    const name = rawValue.slice(2, -1);

    const value = get(vars, name);

    if (typeof value === 'undefined') {
      throw new ReferenceError(`Variable ${name} is not defined`);
    }

    return value;
  };

  return JSON.parse(template, reviver);
}
