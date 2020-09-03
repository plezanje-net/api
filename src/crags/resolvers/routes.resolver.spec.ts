import { Test, TestingModule } from '@nestjs/testing';
import { RoutesResolver } from './routes.resolver';

describe('RoutesResolver', () => {
  let resolver: RoutesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoutesResolver],
    }).compile();

    resolver = module.get<RoutesResolver>(RoutesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
