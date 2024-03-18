import axios, { AxiosRequestConfig, type AxiosResponse } from "axios";
import { Inject } from "typedi";
import { MODULE_OPTIONS_TOKEN } from "./injection-tokens.constant";
import type { HttpModuleOptions } from "./types";
import { Injectable } from "../core/decorators/injectable.decorator";

@Injectable()
export class HttpService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: HttpModuleOptions
  ) {}

  async post<T = unknown, R = AxiosResponse<T>, D = unknown>(data: D, config: AxiosRequestConfig<D>) {
    const { url } = config;

    const result = await axios.post<T, R, D>(url ?? this.options.url, data, config);

    return result;
  }
}