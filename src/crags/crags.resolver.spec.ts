import { Test, TestingModule } from '@nestjs/testing';
import { CragsResolver } from './crags.resolver';

describe('CragsResolver', () => {
  let resolver: CragsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CragsResolver],
    }).compile();

    resolver = module.get<CragsResolver>(CragsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
