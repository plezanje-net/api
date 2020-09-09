import { Test, TestingModule } from '@nestjs/testing';
import { AreasResolver } from './areas.resolver';
import { MockType, serviceMockFactory, interceptorMockFactory } from '../../../test/unit/helpers';
import { AreasService } from '../services/areas.service';
import { AuditInterceptor } from '../../audit/interceptors/audit.interceptor';

describe('AreasResolver', () => {
  let resolver: AreasResolver;
  let areasServiceMock: MockType<AreasService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AreasResolver,
        { provide: AreasService, useFactory: serviceMockFactory },
      ],
    })
    .overrideInterceptor(AuditInterceptor).useFactory({
      factory: interceptorMockFactory
    }).compile();

    resolver = module.get<AreasResolver>(AreasResolver);
    
    areasServiceMock = module.get(AreasService)
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
