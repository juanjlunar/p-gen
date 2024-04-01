import { Test, TestingModule } from '@nestjs/testing';
import { CaslGeneratorCommand } from './casl-generator-command';
import { CaslService } from './casl.service';
import { createCaslServiceMock } from '__mocks__/casl-service.mock';
import { CONFIG_OPTIONS_TOKEN } from '../cosmiconfig/constants/injection-tokens.constant';
import { UtilsService } from '../utils/utils.service';
import { createUtilsServiceMock } from '__mocks__/utils-service.mock';

describe('CaslRepository', () => {
  let service: CaslGeneratorCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CaslService,
          useValue: createCaslServiceMock(),
        },
        {
          provide: CONFIG_OPTIONS_TOKEN,
          useValue: {},
        },
        {
          provide: UtilsService,
          useValue: createUtilsServiceMock(),
        },
        CaslGeneratorCommand,
      ],
    }).compile();

    service = module.get<CaslGeneratorCommand>(CaslGeneratorCommand);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
