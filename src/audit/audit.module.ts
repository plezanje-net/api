import { Module, forwardRef } from '@nestjs/common';
import { Audit } from './entities/audit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './services/audit.service';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { AuthModule } from '../auth/auth.module';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
    imports: [TypeOrmModule.forFeature([Audit]), forwardRef(() => AuthModule)],
    providers: [AuditService, AuditSubscriber, AuditInterceptor],
    exports: [AuditService]
})
export class AuditModule { }
