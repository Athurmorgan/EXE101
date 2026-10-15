import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Global module chua `RedisService`.
 *
 * `@Global` de moi module deu lay duoc instance ma khong can import module
 * rieng — giam boilerplate.
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
