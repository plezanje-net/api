import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { MailService } from './mail.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly mailService: MailService,
    private configService: ConfigService,
  ) {}

  public async accountConfirmation(user: User): Promise<boolean> {
    return this.mailService
      .send({
        to: user.email,
        subject: 'Aktivacija računa',
        template: 'account-confirmation',
        templateParams: {
          user: user,
          url:
            this.configService.get('WEB_URL') +
            'aktivacija/' +
            user.id +
            '/' +
            user.confirmationToken,
        },
      })
      .then(() => true)
      .catch(e => {
        console.log(e);
        return false;
      });
  }

  public async passwordRecovery(user: User): Promise<boolean> {
    return this.mailService
      .send({
        to: user.email,
        subject: 'Povezava za spremembo gesla',
        template: 'password-recovery',
        templateParams: {
          user: user,
          url:
            this.configService.get('WEB_URL') +
            'menjava-gesla/' +
            user.id +
            '/' +
            user.passwordToken,
        },
      })
      .then(() => true)
      .catch(() => false);
  }
}
