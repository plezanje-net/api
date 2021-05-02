import { Test, TestingModule } from '@nestjs/testing';
import { ActivityRoutesResolver } from './activity-routes.resolver';

describe('ActivityRoutesResolver', () => {
  let resolver: ActivityRoutesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityRoutesResolver],
    }).compile();

    resolver = module.get<ActivityRoutesResolver>(ActivityRoutesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
