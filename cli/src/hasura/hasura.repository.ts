import { AxiosError } from 'axios';
import { Injectable } from '@nestjs/common';
import type {
  CreateSelectPermissionArgs,
  DropSelectPermissionArgs,
  FetchHasuraMetadataResult,
  GetHasuraMetadataArgs,
  HasuraMetadataSuccess,
} from './types';
import { NotFoundError } from '../common/errors/not-found.error';
import { UnauthorizedError } from '../common/errors/unauthenticated.error';
import { IHasuraRepository } from './ihasura-repository.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map, retry } from 'rxjs';
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
        },
      );

      // Retry 3 times in case the Hasura container is swill booting up.
      const result = await firstValueFrom(
        request.pipe(
          map((value) => value),
          retry({
            count: 5,
            delay: 500,
          }),
        ),
      );

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

  async createSelectPermission(permissionArgs: CreateSelectPermissionArgs) {
    const {
      headers: { hasuraAdminSecret, hasuraEndpointUrl },
      source = 'default',
      ...restArgs
    } = permissionArgs;

    try {
      const request = this.httpService.post<HasuraMetadataSuccess>(
        hasuraEndpointUrl,
        {
          type: 'pg_create_select_permission',
          version: 1,
          args: {
            ...restArgs,
            source,
          },
        },
        {
          headers: {
            'x-hasura-admin-secret': hasuraAdminSecret,
            'Content-Type': 'application/json',
          },
        },
      );

      // Retry 3 times in case the Hasura container is swill booting up.
      const result = await firstValueFrom(
        request.pipe(
          map((value) => value),
          retry({
            count: 5,
            delay: 500,
          }),
        ),
      );

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

  async dropPermission(
    args: DropSelectPermissionArgs,
  ): Promise<HasuraMetadataSuccess> {
    const {
      headers: { hasuraAdminSecret, hasuraEndpointUrl },
      source = 'default',
      type,
      ...restArgs
    } = args;

    try {
      const request = this.httpService.post<HasuraMetadataSuccess>(
        hasuraEndpointUrl,
        {
          type,
          version: 1,
          args: {
            ...restArgs,
            source,
          },
        },
        {
          headers: {
            'x-hasura-admin-secret': hasuraAdminSecret,
            'Content-Type': 'application/json',
          },
        },
      );

      // Retry 3 times in case the Hasura container is swill booting up.
      const result = await firstValueFrom(
        request.pipe(
          map((value) => value),
          retry({
            count: 5,
            delay: 500,
          }),
        ),
      );

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
