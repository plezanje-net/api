import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/typeorm';
import { MockType, serviceMockFactory } from '../../../test/unit/helpers';
import { AuditSubscriber } from './audit.subscriber';
import { AuditService } from '../services/audit.service';

describe('AuditSubscriber', () => {
  let subscriber: AuditSubscriber;
  let auditServiceMock: MockType<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditSubscriber,
        {
          provide: getConnectionToken(),
          useValue: {
            subscribers: [],
          },
        },
        { provide: AuditService, useFactory: serviceMockFactory },
      ],
    }).compile();

    subscriber = module.get<AuditSubscriber>(AuditSubscriber);

    auditServiceMock = module.get(AuditService);
  });

  it('should be defined', () => {
    expect(subscriber).toBeDefined();
  });
});
