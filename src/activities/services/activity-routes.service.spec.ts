import { Test, TestingModule } from '@nestjs/testing';
import { ActivityRoutesService } from './activity-routes.service';

describe('ActivityRoutesService', () => {
  let service: ActivityRoutesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityRoutesService],
    }).compile();

    service = module.get<ActivityRoutesService>(ActivityRoutesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
