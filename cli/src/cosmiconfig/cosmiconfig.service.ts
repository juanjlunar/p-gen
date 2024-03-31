import { Injectable } from '@nestjs/common';
import {
  type PublicExplorer,
  cosmiconfig,
  type CosmiconfigResult,
} from 'cosmiconfig';
import { Config } from '../common/types';
import { UtilsService } from '../utils/utils.service';
import { CONFIG_FILE_NAME } from '../common/constants';
import { LoadOrCreateOptions } from './types';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CosmiconfigService {
  private readonly publicExplorer: PublicExplorer;

  constructor(
    private readonly utilsService: UtilsService,
    private readonly loggerService: LoggerService,
  ) {
    this.publicExplorer = cosmiconfig('p-gen');
  }

  async load(filePath: string): Promise<Config | null> {
    const result = await this.publicExplorer.load(filePath);

    return result?.config as Config | null;
  }

  async loadOrCreate(options = {} as LoadOrCreateOptions): Promise<Config> {
    const { loggerContext } = options;

    if (loggerContext) {
      this.loggerService.setContext(loggerContext);
    }

    const { config: loadedFile } = (await this.searchWithoutCache()) ?? {};

    if (loadedFile) {
      this.loggerService.log(`${CONFIG_FILE_NAME} found`);

      return loadedFile;
    }

    this.loggerService.log('No Config file found.');

    this.loggerService.log(
      `Creating a ${CONFIG_FILE_NAME} in the current working directory...`,
    );

    await this.utilsService.createConfigFile();

    const { config: createdConfig } = (await this.searchWithoutCache()) ?? {};

    return createdConfig;
  }

  async searchWithoutCache(searchFrom?: string): Promise<CosmiconfigResult> {
    this.publicExplorer.clearSearchCache();

    this.publicExplorer.clearCaches();

    return this.publicExplorer.search(searchFrom);
  }
}
