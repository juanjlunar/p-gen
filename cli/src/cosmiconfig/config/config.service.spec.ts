import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { CONFIG_OPTIONS_TOKEN } from '../constants/injection-tokens.constant';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CONFIG_OPTIONS_TOKEN,
          useValue: {
            test: 'option',
          },
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return the config object', () => {
      const result = service.getConfig();

      expect(result).toStrictEqual({
        test: 'option',
      });
    });
  });
});
