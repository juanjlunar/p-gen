import { Test, TestingModule } from '@nestjs/testing';
import { CaslService } from './casl.service';
import { IHasuraRepository } from '../hasura/ihasura-repository.interface';
import { createHasuraRepositoryMock } from '__mocks__/hasura-repository.mock';
import { UtilsService } from '../utils/utils.service';
import { createUtilsServiceMock } from '__mocks__/utils-service.mock';
import { LoggerService } from '../logger/logger.service';
import { createLoggerServiceMock } from '__mocks__/logger-service.mock';
import { CONFIG_OPTIONS_TOKEN } from '../cosmiconfig/constants/injection-tokens.constant';
import { createCaslPermissionTransformerMock } from '__mocks__/casl-permission-transformer.mock';
import { CaslPermissionTransformer } from './casl-permission-transformer/casl-permission-transformer';

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
          provide: CONFIG_OPTIONS_TOKEN,
          useValue: {},
        },
        {
          provide: CaslPermissionTransformer,
          useValue: createCaslPermissionTransformerMock(),
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
