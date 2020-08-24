import { Test, TestingModule } from '@nestjs/testing';
import { CragsService } from './crags.service';

describe('CragsService', () => {
  let service: CragsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CragsService],
    }).compile();

    service = module.get<CragsService>(CragsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
