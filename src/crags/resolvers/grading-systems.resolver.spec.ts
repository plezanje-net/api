import { Test, TestingModule } from '@nestjs/testing';
import { GradingSystemsResolver } from './grading-systems.resolver';

describe('GradingSystemsResolver', () => {
  let resolver: GradingSystemsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradingSystemsResolver],
    }).compile();

    resolver = module.get<GradingSystemsResolver>(GradingSystemsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
