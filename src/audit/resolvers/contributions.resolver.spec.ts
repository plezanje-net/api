import { Test, TestingModule } from '@nestjs/testing';
import { ContributionsResolver } from './contributions.resolver';

describe('ContributionsResolver', () => {
  let resolver: ContributionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContributionsResolver],
    }).compile();

    resolver = module.get<ContributionsResolver>(ContributionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
