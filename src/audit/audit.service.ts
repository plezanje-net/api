import { Injectable, Scope, Inject } from '@nestjs/common';
import { Audit } from './entities/audit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(Audit)
        private auditRepository: Repository<Audit>
    ) { }

    create(data: any): Promise<Audit> {
        const audit = new Audit

        this.auditRepository.merge(audit, data);

        return this.auditRepository.save(audit)
    }
}
