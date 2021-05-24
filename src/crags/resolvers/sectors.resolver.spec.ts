import { Test, TestingModule } from '@nestjs/testing';
import { SectorsResolver } from './sectors.resolver';
import {
  repositoryMockFactory,
  MockType,
  serviceMockFactory,
  interceptorMockFactory,
  filterMockFactory,
} from '../../../test/unit/helpers';
import { SectorsService } from '../services/sectors.service';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';

describe('SectorsResolver', () => {
  let resolver: SectorsResolver;
  let sectorServiceMock: MockType<SectorsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectorsResolver,
        { provide: SectorsService, useFactory: serviceMockFactory },
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
      .compile();

    resolver = module.get<SectorsResolver>(SectorsResolver);

    sectorServiceMock = module.get(SectorsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
