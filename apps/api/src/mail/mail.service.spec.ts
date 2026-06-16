import { ConfigService } from '@nestjs/config';
import { describe, expect, test } from 'bun:test';

import { MailService } from './mail.service.js';

describe(MailService.name, () => {
  test('sends mail through the configured transport', async () => {
    const sent: unknown[] = [];
    const transport = {
      sendMail: (message: unknown) => {
        sent.push(message);
        return Promise.resolve();
      },
    };
    const service = new MailService(
      new ConfigService({ mail: { from: 'noreply@moddery.local' } }),
      transport as never,
    );

    await service.send({
      subject: 'Welcome',
      text: 'Hello',
      to: 'user@example.com',
    });

    expect(sent).toHaveLength(1);
  });
});
