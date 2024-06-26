#!/usr/bin/env node

import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';
import figlet from 'figlet';
import { Logger } from '@nestjs/common';
import chalk from 'chalk';

async function bootstrap() {
  console.log(figlet.textSync('P-GEN CLI'));

  await CommandFactory.run(AppModule, {
    logger: process.env.NODE_ENV === 'development' ? new Logger() : undefined,
    abortOnError: false,
  });
}
bootstrap().catch((err) => {
  console.log(chalk.red(err));
});
