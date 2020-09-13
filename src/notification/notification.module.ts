import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationService } from './services/notification.service';
import { MailService } from './services/mail.service';

@Module({
    imports: [ConfigModule],
    providers: [NotificationService, MailService, ConfigService],
    exports: [NotificationService]
})
export class NotificationModule { }
