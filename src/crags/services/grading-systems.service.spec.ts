import { Test, TestingModule } from '@nestjs/testing';
import { GradingSystemsService } from './grading-systems.service';

describe('GradingSystemsService', () => {
  let service: GradingSystemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradingSystemsService],
    }).compile();

    service = module.get<GradingSystemsService>(GradingSystemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
