import { Injectable } from '@nestjs/common';
import type { PathLike } from 'fs';
import { access, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import type { Stream } from 'stream';
import { CaslPermission, PermissionsMappingByRole } from '../casl/types';
import { CONFIG_FILE_NAME } from '../common/constants';

@Injectable()
export class UtilsService {
  replaceHasuraSessionVars(
    conditions: Record<string, unknown>,
    replacements: Record<string, string>,
  ): Record<string, string> {
    let stringified = JSON.stringify(conditions);

    const replacementKeys = Object.keys(replacements);

    replacementKeys.forEach((replacementKey) => {
      const regex = new RegExp(`\\b${replacementKey}\\b`, 'ig');

      stringified = stringified.replaceAll(regex, () => {
        return replacements[replacementKey];
      });
    });

    return JSON.parse(stringified) as Record<string, string>;
  }

  async createConfigFile(): Promise<string> {
    const cwd = process.cwd();

    const stubFilePath = await readFile(
      join(__dirname, '../', 'cosmiconfig', 'stubs', 'p-gen-config.stub'),
      {
        encoding: 'utf-8',
      },
    );

    const filePath = join(cwd, CONFIG_FILE_NAME);

    await this.writeFile(filePath, stubFilePath);

    return filePath;
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
    const dirPath = dirname(filePath);

    const fileOrDirExists = await this.fileOrDirExists(dirPath);

    try {
      await mkdir(dirPath, { recursive: true });

      await writeFile(filePath, data);
    } catch (error) {
      const pathToRemove = !fileOrDirExists ? dirPath : filePath;

      await rm(pathToRemove, {
        recursive: true,
        force: true,
      });

      throw error;
    }
  }

  async fileOrDirExists(path: PathLike): Promise<boolean> {
    try {
      await access(path);

      return true;
    } catch (error) {
      return false;
    }
  }

  flatPermissionsMapping(
    permissions: PermissionsMappingByRole,
  ): CaslPermission[] {
    return Object.keys(permissions).reduce((acc, next) => {
      return [...acc, ...permissions[next]];
    }, [] as CaslPermission[]);
  }
}
