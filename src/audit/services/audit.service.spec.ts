import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory, MockType } from '../../../test/unit/helpers';
import { Audit } from '../entities/audit.entity';
import { Repository } from 'typeorm';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepositoryMock: MockType<Repository<Audit>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(Audit), useFactory: repositoryMockFactory },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    
    auditRepositoryMock = module.get(getRepositoryToken(Audit))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
