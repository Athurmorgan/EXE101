import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Ket noi Redis dung chung cho ca API va Python AI service.
 *
 * Redis chi phuc vu cache va rate limit — khong phai noi luu trang thai
 * bat buoc. Neu Redis down thi API van chay, chi mat cache.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) {
      this.logger.warn('REDIS_URL chua duoc cau hinh — bo qua cache');
      return;
    }

    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      // Backoff cap toi da de khong spam log khi Redis tam thoi khong pho.
      retryStrategy: (times: number): number => Math.min(times * 200, 5_000),
    });

    this.client.on('error', (error: Error): void => {
      this.logger.warn(`Redis loi: ${error.message}`);
    });
    this.client.on('ready', () => {
      this.logger.log('Redis sẵn sàng');
    });

    void this.client.connect().catch((error: unknown): void => {
      this.logger.warn(`Khong ket noi duoc Redis: ${(error as Error).message}`);
    });
  }

  onModuleDestroy(): void {
    this.client?.disconnect();
    this.client = null;
  }

  /** Client goc. Tra null khi Redis khong khai bao trong moi truong. */
  getClient(): Redis | null {
    return this.client?.status === 'ready' ? this.client : null;
  }

  async get(key: string): Promise<string | null> {
    return this.client?.get(key) ?? null;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client?.set(key, value, 'EX', ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client?.del(...keys);
  }
}
