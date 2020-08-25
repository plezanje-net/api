import { Injectable } from '@nestjs/common';
import { Audit } from '../entities/audit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditInput } from '../interfaces/audit-input.interface';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(Audit)
        private auditRepository: Repository<Audit>
    ) { }

    create(data: AuditInput): Promise<Audit> {
        const audit = new Audit

        this.auditRepository.merge(audit, data);

        return this.auditRepository.save(audit)
    }
}
