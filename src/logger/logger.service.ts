import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import * as chalk from 'chalk';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class LoggerService extends ConsoleLogger {
  log(message: unknown, context?: string): void {
    const currentContext = context ?? this.context;

    let logMessage = `${chalk.green('[LOG]')}`;

    if (currentContext) {
      logMessage += ` ${chalk.yellowBright(`[${context ?? this.context}]`)}`;
    }

    logMessage += ` ${chalk.green(message)}`;

    console.log(logMessage);
  }

  error(message: unknown, context?: string): void {
    console.log(chalk.red(this.format('DEBUG', message, context)));
  }

  warn(message: unknown, context?: string): void {
    console.log(chalk.yellowBright(this.format('WARN', message, context)));
  }

  debug(message: unknown, context?: string): void {
    console.log(chalk.hex('#d88fff')(this.format('DEBUG', message, context)));
  }

  private format(
    logType: 'LOG' | 'DEBUG' | 'ERROR' | 'WARN',
    message: unknown,
    context?: string,
  ) {
    const resolvedContext = context ?? this.context;

    if (resolvedContext) {
      return `[${logType}] [${resolvedContext}] ${message}`;
    }

    return `[${logType}] ${message}`;
  }
}
