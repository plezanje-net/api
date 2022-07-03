import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { MailOptions } from '../interfaces/mail-options.interface';
import { readFileSync } from 'fs';

import { compile } from 'handlebars';

@Injectable()
export class MailService {
  transporter: Mail;

  constructor(configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST'),
      port: configService.get('SMTP_PORT'),
      // secure: true,
      secure: false,
      auth: {
        user: configService.get('SMTP_USERNAME'),
        pass: configService.get('SMTP_PASSWORD'),
      },
    });
  }

  send(options: MailOptions): Promise<SentMessageInfo> {
    return this.transporter.sendMail({
      from: options.from
        ? options.from
        : '"Plezanje.net" <noreply@plezanje.net>',
      to: options.to,
      subject: options.subject,
      text: this.render('plain', options.template, options.templateParams),
      html: this.render('html', options.template, options.templateParams),
    });
  }

  render(type: string, templateName: string, params: any = {}): string {
    const template = compile(
      readFileSync(
        __dirname + '/../templates/' + templateName + '.' + type + '.hbs',
      ).toString(),
    );

    if (type == 'plain') {
      return template(params);
    }

    const layout = compile(
      readFileSync(__dirname + '/../templates/layout.html.hbs').toString(),
    );

    return layout({
      content: template(params),
    });
  }
}
