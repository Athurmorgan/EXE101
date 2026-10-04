import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { AppException, ErrorCode } from '../errors/app.exception';

/** Shape tra ve cho moi loi — frontend chi can doc mot kieu duy nhat. */
interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
  path: string;
  timestamp: string;
}

/** Loi duoc gan `requestId` o `RequestIdMiddleware` de tra ve client. */
interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * Bat moi loi chay qua day va tra ve dung mot format.
 *
 * Ba nhom loi duoc xu ly rieng:
 *   1. `AppException` — loi nghiep vu, co `code` rieng
 *   2. `HttpException` — loi do NestJS/guard nem ra
 *   3. `Prisma.PrismaClientKnownRequestError` — loi duoc dich sang HTTP
 *
 * Moi truong hop khac deu an thanh `Internal server error` va ghi log server-side,
 * khong loi chi tiet ra ngoai de tranh lo thong tin.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const mapped = this.map(exception);

    // 5xx la loi may chu, giu log de doi va con soat. 4xx la loi nguoi dung.
    if (mapped.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${mapped.statusCode} [${mapped.code}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} -> ${mapped.statusCode} [${mapped.code}]`,
      );
    }

    const body: ErrorResponse = {
      statusCode: mapped.statusCode,
      code: mapped.code,
      message: mapped.message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    if (mapped.details !== undefined) body.details = mapped.details;
    if (request.requestId) body.requestId = request.requestId;

    response.status(mapped.statusCode).json(body);
  }

  private map(exception: unknown): {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof AppException) {
      return {
        statusCode: exception.status,
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      return { ...this.fromHttpException(exception), details: exception.getResponse() };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
    };
  }

  private fromHttpException(exception: HttpException): {
    statusCode: number;
    code: string;
    message: string;
  } {
    const status = exception.getStatus();
    const response = exception.getResponse();

    // `getResponse()` tra string khi nem `new HttpException('text', code)`,
    // va object `{ message, error, statusCode }` khi nem bang class chuyen biet.
    if (typeof response === 'string') {
      return { statusCode: status, code: this.codeFromStatus(status), message: response };
    }

    const payload = response as { message?: string | string[]; error?: string };
    const raw = payload.message ?? payload.error ?? exception.message;
    return {
      statusCode: status,
      code: this.codeFromStatus(status),
      message: Array.isArray(raw) ? raw.join('; ') : raw,
    };
  }

  /** Doi ma loi Prisma sang HTTP tuong ung. */
  private fromPrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    const target = (exception.meta as { target?: string[] | string } | undefined)?.target;
    const field = Array.isArray(target) ? target.join(', ') : target;

    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          code: field === 'email' ? ErrorCode.EMAIL_ALREADY_EXISTS : ErrorCode.CONFLICT,
          message: field
            ? `A record with this ${field} already exists`
            : 'A record with these values already exists',
          details: { field },
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.NOT_FOUND,
          message: 'Record not found',
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Related record does not exist',
          details: { field },
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Database error',
        };
    }
  }

  private codeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_FAILED;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMITED;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }
}