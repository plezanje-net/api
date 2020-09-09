import { AuditInterceptor } from './audit.interceptor';
import { TestingModule, Test } from '@nestjs/testing';
import { serviceMockFactory, MockType } from '../../../test/unit/helpers';
import { AuditService } from '../services/audit.service';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditServiceMock: MockType<AuditService>
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        { provide: AuditService, useFactory: serviceMockFactory },
      ],
    }).compile();

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    auditServiceMock = module.get(AuditService)
  });
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
