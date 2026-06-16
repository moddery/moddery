import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

import { MAIL_TRANSPORT } from './mail.constants.js';
import { MailService } from './mail.service.js';

@Module({
  exports: [MailService],
  providers: [
    {
      provide: MAIL_TRANSPORT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Transporter =>
        createTransport({
          host: config.getOrThrow<string>('mail.smtpHost'),
          port: config.getOrThrow<number>('mail.smtpPort'),
          secure: false,
        }),
    },
    MailService,
  ],
})
export class MailModule {}
