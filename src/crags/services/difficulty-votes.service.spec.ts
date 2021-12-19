import { Test, TestingModule } from '@nestjs/testing';
import { DifficultyVotesService } from './difficulty-votes.service';

describe('DifficultyVotesService', () => {
  let service: DifficultyVotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DifficultyVotesService],
    }).compile();

    service = module.get<DifficultyVotesService>(DifficultyVotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
