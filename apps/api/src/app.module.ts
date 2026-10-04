import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LocaleMiddleware } from './common/middleware/locale.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { HealthController } from './common/controllers/health.controller';
import { RedisService } from './common/services/redis.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // `isGlobal` de moi module deu doc duoc bien moi truong ma khong import lai.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    PrismaModule,
    // `AuditModule` `@Global` nen phai import o day mot lan duy nhat.
    AuditModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [
    RedisService,
    // Thu tu: filter -> interceptor -> guard.
    // Guard phai sau interceptor de loi 401/403 cung qua interceptor.
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Mac dinh "phai dang nhap"; route `@Public()` duoc mo.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      // `requestId` gan truoc moi thu de moi loi deu co dinh danh de tra ve client.
      .apply(RequestIdMiddleware, LocaleMiddleware)
      .forRoutes('*');
  }
}
