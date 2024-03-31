#!/usr/bin/env node

import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';
import figlet from 'figlet';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  console.log(figlet.textSync('P-GEN CLI'));

  await CommandFactory.run(AppModule, {
    logger: new Logger(),
    serviceErrorHandler: (err) => {
      console.log(`error: ${err.message}`);
    },
  });
}
bootstrap();
