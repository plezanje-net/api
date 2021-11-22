import { Test, TestingModule } from '@nestjs/testing';
import { GradesServiceService } from './grades-service.service';

describe('GradesServiceService', () => {
  let service: GradesServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradesServiceService],
    }).compile();

    service = module.get<GradesServiceService>(GradesServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
