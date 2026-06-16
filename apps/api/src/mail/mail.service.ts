import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Transporter } from 'nodemailer';

import { MAIL_TRANSPORT } from './mail.constants.js';
import { type SendEmailInput } from './mail.types.js';

@Injectable()
export class MailService {
  constructor(
    private readonly config: ConfigService,
    @Inject(MAIL_TRANSPORT) private readonly transport: Transporter,
  ) {}

  async send(input: SendEmailInput): Promise<void> {
    await this.transport.sendMail({
      from: this.config.getOrThrow<string>('mail.from'),
      html: input.html,
      subject: input.subject,
      text: input.text,
      to: input.to,
    });
  }
}
