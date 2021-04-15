import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesResolver } from './activities.resolver';

describe('ActivitiesResolver', () => {
  let resolver: ActivitiesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivitiesResolver],
    }).compile();

    resolver = module.get<ActivitiesResolver>(ActivitiesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
