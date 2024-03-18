import { type Constructable, Container as TypeDIContainer } from "typedi";
import type { ClassConstructor, ContainerSetArgs } from "../types";
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config({
  path: '.env'
});

export class Container {
  static set<T = unknown>(args: ContainerSetArgs<T>): void {
    const moduleName = (args.id as ClassConstructor)?.name ?? args.id;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${chalk.cyan('[PG]:')} ${chalk.green(moduleName)} dependency initialized`);
    }

    // TODO: Log in the provider registration here.
    TypeDIContainer.set(args);
  };

  static get<T>(type: Constructable<T> | string): T {
    return TypeDIContainer.get(type as string);
  }
}