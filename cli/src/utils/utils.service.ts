import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { CONFIG_FILE_NAME } from '../common/constants';
import type { Stream } from 'stream';
import { CaslPermission, PermissionsMappingByRole } from '../casl/types';

@Injectable()
export class UtilsService {
  replaceHasuraSessionVars(
    conditions: Record<string, unknown>,
    replacements: Record<string, string>,
  ): Record<string, string> {
    let stringified = JSON.stringify(conditions);

    const replacementKeys = Object.keys(replacements);

    replacementKeys.forEach((replacementKey) => {
      const regex = new RegExp(replacementKey, 'ig');

      stringified = stringified.replaceAll(regex, () => {
        return replacements[replacementKey];
      });
    });

    return JSON.parse(stringified) as Record<string, string>;
  }

  async createConfigFile(): Promise<string> {
    const cwd = process.cwd();

    const stubFilePath = await readFile(
      join(cwd, 'src', 'cosmiconfig', 'stubs', 'p-gen-config.stub'),
      {
        encoding: 'utf-8',
      },
    );

    const fielPath = join(cwd, CONFIG_FILE_NAME);

    await this.writeFile(fielPath, stubFilePath);

    return fielPath;
  }

  async writeFile(
    filePath: string,
    data:
      | string
      | NodeJS.ArrayBufferView
      | Iterable<string | NodeJS.ArrayBufferView>
      | AsyncIterable<string | NodeJS.ArrayBufferView>
      | Stream,
  ): Promise<void> {
    await writeFile(filePath, data);
  }

  flatPermissionsMapping(
    permissions: PermissionsMappingByRole,
  ): CaslPermission[] {
    return Object.keys(permissions).reduce((acc, next) => {
      return [...acc, ...permissions[next]];
    }, [] as CaslPermission[]);
  }
}
