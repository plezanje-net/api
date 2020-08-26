import { Test, TestingModule } from '@nestjs/testing';
import { SectorsResolver } from './sectors.resolver';

describe('SectorsResolver', () => {
  let resolver: SectorsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SectorsResolver],
    }).compile();

    resolver = module.get<SectorsResolver>(SectorsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
