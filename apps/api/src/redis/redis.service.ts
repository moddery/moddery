import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { type Redis } from 'ioredis';

import { REDIS_CLIENT } from './redis.constants.js';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async ping(): Promise<void> {
    await this.client.ping();
  }

  async getJson<TValue>(key: string): Promise<TValue | undefined> {
    const raw = await this.client.get(key);

    if (raw === null) return undefined;

    return JSON.parse(raw) as TValue;
  }

  async setJson(
    key: string,
    value: unknown,
    options: { ttlSeconds?: number } = {},
  ): Promise<void> {
    const payload = JSON.stringify(value);

    if (options.ttlSeconds === undefined) {
      await this.client.set(key, payload);
      return;
    }

    await this.client.set(key, payload, 'EX', options.ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
