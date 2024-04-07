import { Injectable } from '@nestjs/common';
import { InjectConfigOptions } from '../decorators/inject-config-options.decorator';
import type { Config } from '../../common/types';

@Injectable()
export class ConfigService {
  constructor(@InjectConfigOptions() private readonly configOptions: Config) {}

  getConfig(): Config {
    return this.configOptions;
  }
}
