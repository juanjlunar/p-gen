import { AxiosError } from 'axios';
import { Injectable } from '@nestjs/common';
import type { FetchHasuraMetadataResult, GetHasuraMetadataArgs } from './types';
import { NotFoundError } from '../common/errors/not-found.error';
import { UnauthorizedError } from '../common/errors/unauthenticated.error';
import { IHasuraRepository } from './ihasura-repository.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HasuraConnectionError } from '../common/errors/hasura-connection.error';

@Injectable()
export class HasuraRepository implements IHasuraRepository {
  constructor(private readonly httpService: HttpService) {}

  async getHasuraMetadata(
    args: GetHasuraMetadataArgs,
  ): Promise<FetchHasuraMetadataResult> {
    const { hasuraAdminSecret, hasuraEndpointUrl } = args;

    try {
      const request = this.httpService.post<FetchHasuraMetadataResult>(
        hasuraEndpointUrl,
        {
          type: 'export_metadata',
          version: 2,
          args: {},
        },
        {
          headers: {
            'x-hasura-admin-secret': hasuraAdminSecret,
            'Content-Type': 'application/json',
          },
          url: hasuraEndpointUrl,
        },
      );

      const result = await firstValueFrom(request);

      return result.data;
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;

      if (error.code === 'ECONNREFUSED') {
        throw new HasuraConnectionError(hasuraEndpointUrl);
      }

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
