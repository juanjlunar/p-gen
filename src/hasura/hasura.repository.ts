import { Injectable } from "../core/decorators/injectable.decorator";
import type { FetchHasuraMetadataResult, GetHasuraMetadataArgs } from "./types";
import { HttpService } from "../http/http.service";
import { UnauthorizedError } from "../core/errors/unauthenticated.error";
import { AxiosError } from "axios";
import { NotFoundError } from "../core/errors/not-found.error";

@Injectable()
export class HasuraRepository {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  async getHasuraMetadata(args: GetHasuraMetadataArgs): Promise<FetchHasuraMetadataResult> {
    const { hasuraAdminSecret, hasuraEndpointUrl } = args;

    try {
      const result = await this.httpService.post<FetchHasuraMetadataResult>({
        "type": "export_metadata",
        "version": 2,
        "args": {},
      }, {
        headers: {
          'x-hasura-admin-secret': hasuraAdminSecret,
          'Content-Type': 'application/json'
        },
        url: hasuraEndpointUrl,
      });

      return result.data;
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;

      if (error.response?.status === 401) {
        throw new UnauthorizedError();
      }

      if (error.response?.status === 404) {
        throw new NotFoundError();
      }

      throw new Error(error.response?.data?.error ?? 'Unknown error.');
    }
  }
}