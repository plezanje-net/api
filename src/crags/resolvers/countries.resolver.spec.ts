import { Test, TestingModule } from '@nestjs/testing';
import { CountriesResolver } from './countries.resolver';
import { CountriesService } from '../services/countries.service';
import { CragsService } from '../services/crags.service';
import {
  MockType,
  serviceMockFactory,
  interceptorMockFactory,
  filterMockFactory,
} from '../../../test/unit/helpers';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';
import { ConflictFilter } from '../filters/conflict.filter';

describe('CountriesResolver', () => {
  let resolver: CountriesResolver;
  let countriesServiceMock: MockType<CountriesService>;
  let cragsServiceMock: MockType<CragsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesResolver,
        { provide: CountriesService, useFactory: serviceMockFactory },
        { provide: CragsService, useFactory: serviceMockFactory },
      ],
    })
      .overrideInterceptor(AuditInterceptor)
      .useFactory({
        factory: interceptorMockFactory,
      })
      .overrideFilter(NotFoundFilter)
      .useFactory({
        factory: filterMockFactory,
      })
      .overrideFilter(ConflictFilter)
      .useFactory({
        factory: filterMockFactory,
      })
      .compile();

    resolver = module.get<CountriesResolver>(CountriesResolver);

    countriesServiceMock = module.get(CountriesService);
    cragsServiceMock = module.get(CragsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
