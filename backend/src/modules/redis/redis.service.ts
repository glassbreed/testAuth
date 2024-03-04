import { Injectable } from '@nestjs/common/decorators';
import { Redis } from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from 'src/constants';

@Injectable()
export class RedisService {
  client: Redis;
  constructor() {
    this.client = new Redis(REDIS_PORT, REDIS_HOST);
    this.client.on('error', (err) => {
      console.log('Redis error: ', err);
    });
  }

  async set(
    key: string,
    value: string | number | Buffer,
    expiresIn?: number
  ) {
    await this.client.set(key, value);
    const multi = this.client.multi();

    multi['set'](key, value);
    if (expiresIn) multi.expire(key, expiresIn);

    await multi.exec();
  }

  async get(key: string | Buffer) {
    const result = await this.client.get(key);

    return result;
  }

  async delete(key: string | Buffer) {
    await this.client.del(key);
  }
}
