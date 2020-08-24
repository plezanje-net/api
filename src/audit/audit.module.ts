import { Module } from '@nestjs/common';
import { Audit } from './entities/audit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditSubscriber } from './audit.subscriber';
import { AuthModule } from 'src/auth/auth.module';
import { AuditInterceptor } from './audit.interceptor';

@Module({
    imports: [TypeOrmModule.forFeature([Audit]), AuthModule],
    providers: [AuditService, AuditSubscriber, AuditInterceptor],
    exports: [AuditService]
})
export class AuditModule { }
