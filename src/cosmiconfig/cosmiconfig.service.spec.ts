import { Test, TestingModule } from '@nestjs/testing';
import { CosmiconfigService } from './cosmiconfig.service';

describe('CosmiconfigService', () => {
  let service: CosmiconfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CosmiconfigService],
    }).compile();

    service = module.get<CosmiconfigService>(CosmiconfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
