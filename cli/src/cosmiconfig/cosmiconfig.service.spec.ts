import { Test, TestingModule } from '@nestjs/testing';
import { CosmiconfigService } from './cosmiconfig.service';
import { LoggerService } from '../logger/logger.service';
import { createLoggerServiceMock } from '__mocks__/logger-service.mock';
import { UtilsService } from '../utils/utils.service';
import { createUtilsServiceMock } from '__mocks__/utils-service.mock';

describe('CosmiconfigService', () => {
  let service: CosmiconfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerService,
          useValue: createLoggerServiceMock(),
        },
        {
          provide: UtilsService,
          useValue: createUtilsServiceMock(),
        },
        CosmiconfigService,
      ],
    }).compile();

    service = module.get<CosmiconfigService>(CosmiconfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
