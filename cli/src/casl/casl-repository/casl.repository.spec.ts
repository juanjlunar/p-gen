import { Test, TestingModule } from '@nestjs/testing';
import { CaslRepository } from './casl.repository';

describe('CaslRepository', () => {
  let service: CaslRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaslRepository],
    }).compile();

    service = module.get<CaslRepository>(CaslRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
