import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { REFRESH_COOKIE } from './modules/auth/auth.controller';

/** Tien to dung chung: `/api/v1/auth`, `/api/v1/places`... */
const API_PREFIX = 'api/v1';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());

  // Danh sach origin doc tu env; rong = cho phep moi origin (dev qua Vite proxy).
  const origins = config
    .get<string>('CORS_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length > 0 ? origins : true,
    credentials: true, // Bat buoc de gui cookie refresh.
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix(API_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      // Bat khoa `password` va `passwordHash` khoi payload dua len log.
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const isProduction = config.get<string>('NODE_ENV') === 'production';

  const swaggerConfig = new DocumentBuilder()
    .setTitle('vivivu API')
    .setDescription(
      'REST API cho nen tang du lich Viet Nam danh cho khach nuoc ngoi tu tuc. ' +
        'Response luon boc trong `{ data, meta }`; loi tra ve `{ statusCode, code, message }`.',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addCookieAuth(REFRESH_COOKIE)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    // `sync:api` doc JSON o day de sinh type cho frontend.
    jsonDocumentUrl: 'api/docs-json',
  });

  // Bien moi truong luon la chuoi; phai tu parse de `PORT=3000` thanh number.
  const port = Number.parseInt(config.get<string>('PORT', '3000'), 10) || 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`vivivu API: http://localhost:${port}/${API_PREFIX}`);
  logger.log(`Swagger:      http://localhost:${port}/api/docs`);
  if (!isProduction) logger.log(`Chay o che do: ${config.get<string>('NODE_ENV', 'development')}`);
}

void bootstrap();
