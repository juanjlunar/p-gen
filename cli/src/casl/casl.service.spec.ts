import { Test, TestingModule } from '@nestjs/testing';
import { CaslService } from './casl.service';
import { IHasuraRepository } from '../hasura/ihasura-repository.interface';
import { createHasuraRepositoryMock } from '__mocks__/hasura-repository.mock';
import { UtilsService } from '../utils/utils.service';
import { createUtilsServiceMock } from '__mocks__/utils-service.mock';
import { LoggerService } from '../logger/logger.service';
import { createLoggerServiceMock } from '__mocks__/logger-service.mock';
import { createCaslPermissionTransformerMock } from '__mocks__/casl-permission-transformer.mock';
import { CaslPermissionTransformer } from './casl-permission-transformer/casl-permission-transformer';
import { HasuraService } from '../hasura/hasura.service';
import { createHasuraServiceMock } from '__mocks__/hasura-service.mock';
import { ConfigService } from '../cosmiconfig/config/config.service';
import { createConfigServiceMock } from '__mocks__/config-service.mock';

describe('CaslService', () => {
  let service: CaslService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IHasuraRepository,
          useValue: createHasuraRepositoryMock(),
        },
        {
          provide: UtilsService,
          useValue: createUtilsServiceMock(),
        },
        {
          provide: LoggerService,
          useValue: createLoggerServiceMock(),
        },
        {
          provide: ConfigService,
          useValue: createConfigServiceMock,
        },
        {
          provide: CaslPermissionTransformer,
          useValue: createCaslPermissionTransformerMock(),
        },
        {
          provide: HasuraService,
          useValue: createHasuraServiceMock(),
        },
        CaslService,
      ],
    }).compile();

    service = module.get<CaslService>(CaslService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
