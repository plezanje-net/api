import { Test, TestingModule } from '@nestjs/testing';
import { RoutesResolver } from './routes.resolver';
import {
  MockType,
  serviceMockFactory,
  interceptorMockFactory,
  filterMockFactory,
} from '../../../test/unit/helpers';
import { RoutesService } from '../services/routes.service';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';

describe('RoutesResolver', () => {
  let resolver: RoutesResolver;
  let routesServiceMock: MockType<RoutesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesResolver,
        { provide: RoutesService, useFactory: serviceMockFactory },
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

    resolver = module.get<RoutesResolver>(RoutesResolver);

    routesServiceMock = module.get(RoutesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
