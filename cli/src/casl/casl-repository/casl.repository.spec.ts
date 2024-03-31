import { Test, TestingModule } from '@nestjs/testing';
import { CaslRepository } from './casl.repository';
import { KNEX_INJECTION_TOKEN } from '../../knex/constants/injection-tokens.constant';
import { createKnexMock } from '__mocks__/knex.mock';

describe('CaslRepository', () => {
  let service: CaslRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: KNEX_INJECTION_TOKEN,
          useValue: createKnexMock(),
        },
        CaslRepository,
      ],
    }).compile();

    service = module.get<CaslRepository>(CaslRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
