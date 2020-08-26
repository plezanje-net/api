import { Test, TestingModule } from '@nestjs/testing';
import { SectorsService } from './sectors.service';

describe('SectorsService', () => {
  let service: SectorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SectorsService],
    }).compile();

    service = module.get<SectorsService>(SectorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
