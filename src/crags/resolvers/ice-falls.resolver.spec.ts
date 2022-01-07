import { Test, TestingModule } from '@nestjs/testing';
import { IceFallsResolver } from './ice-falls.resolver';

describe('IceFallsResolver', () => {
  let resolver: IceFallsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IceFallsResolver],
    }).compile();

    resolver = module.get<IceFallsResolver>(IceFallsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
