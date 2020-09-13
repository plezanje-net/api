import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { MailService } from './mail.service';

@Injectable()
export class NotificationService {
    constructor(private readonly mailService: MailService) { }

    public accountConfirmation(user: User): void {
        this.mailService.send({
            to: user.email,
            subject: 'Aktivacija računa',
            template: 'account-confirmation',
            templateParams: {
                user: user
            }
        });
    }
}
