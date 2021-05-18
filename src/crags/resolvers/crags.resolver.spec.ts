import { Test, TestingModule } from '@nestjs/testing';
import { CragsResolver } from './crags.resolver';
import { CragsService } from '../services/crags.service';
import {
  MockType,
  serviceMockFactory,
  interceptorMockFactory,
} from '../../../test/unit/helpers';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';

describe('CragsResolver', () => {
  let resolver: CragsResolver;
  let cragsServiceMock: MockType<CragsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CragsResolver,
        { provide: CragsService, useFactory: serviceMockFactory },
      ],
    })
      .overrideInterceptor(AuditInterceptor)
      .useFactory({
        factory: interceptorMockFactory,
      })
      .compile();

    resolver = module.get<CragsResolver>(CragsResolver);

    cragsServiceMock = module.get(CragsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
