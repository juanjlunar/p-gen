import { Inject } from '@nestjs/common';
import { CONFIG_OPTIONS_TOKEN } from '../constants/injection-tokens.constant';

export function InjectConfigOptions() {
  return Inject(CONFIG_OPTIONS_TOKEN);
}
