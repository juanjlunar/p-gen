import { Inject } from '@nestjs/common';
import { KNEX_INJECTION_TOKEN } from '../constants/injection-tokens.constant';

export function InjectKnex() {
  return Inject(KNEX_INJECTION_TOKEN);
}
