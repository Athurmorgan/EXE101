import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * `@Global()` vi `PrismaService` duoc dung o gia nhi module nao cung duoc —
 * khong lam phai import `PrismaModule` lai o tung noi.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
