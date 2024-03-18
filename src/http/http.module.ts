import { Module } from "../core/decorators/module.decorator";
import { HttpService } from "./http.service";
import type { HttpModuleOptions } from "./types";
import type { DynamicModule } from "src/core/types";
import { MODULE_OPTIONS_TOKEN } from "./injection-tokens.constant";

@Module({})
export class HttpModule {
  static register(options: HttpModuleOptions): DynamicModule {
    return {
      module: HttpModule,
      providers: [
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
        HttpService,
      ]
    }
  }
}