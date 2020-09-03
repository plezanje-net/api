import { Test, TestingModule } from '@nestjs/testing';
import { AreasResolver } from './areas.resolver';

describe('AreasResolver', () => {
  let resolver: AreasResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AreasResolver],
    }).compile();

    resolver = module.get<AreasResolver>(AreasResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
