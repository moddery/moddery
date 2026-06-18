import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    const result = await this.health.readiness();
    if (result.status !== 'ready') {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }
}
