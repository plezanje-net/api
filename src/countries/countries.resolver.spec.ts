import { Test, TestingModule } from '@nestjs/testing';
import { CountriesResolver } from './countries.resolver';

describe('CountriesResolver', () => {
  let resolver: CountriesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CountriesResolver],
    }).compile();

    resolver = module.get<CountriesResolver>(CountriesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
