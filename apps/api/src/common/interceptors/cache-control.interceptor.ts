import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';

/**
 * Gan header `Cache-Control` cho cac endpoint public, du lieu it doi.
 *
 * Mapping `path + method` -> `max-age` (giay). Chi ap dung khi response chua co
 * header `Cache-Control` (de tranh override tu controller/guard).
 *
 * Khong cache:
 *   - POST / PUT / PATCH / DELETE: mac dinh response thay doi nen khong cache.
 *   - Cac route khong nam trong mapping.
 *
 * Loi ich:
 *   - Browser/CDN co the cache, giam request that xuong server.
 *   - Giam tai Postgres/Redis khi user refresh lien tuc.
 */
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  /** Map `<METHOD> <path pattern>` -> `Cache-Control` value. */
  private static readonly RULES: ReadonlyArray<{ method: string; pattern: RegExp; value: string }> = [
    { method: 'GET', pattern: /^\/api\/v1\/regions\/cities\/?$/, value: 'public, max-age=300' },
    { method: 'GET', pattern: /^\/api\/v1\/regions\/?$/, value: 'public, max-age=60' },
    { method: 'GET', pattern: /^\/api\/v1\/regions\/[0-9a-f-]+\/?$/, value: 'public, max-age=300' },
    { method: 'GET', pattern: /^\/api\/v1\/regions\/[0-9a-f-]+\/children\/?$/, value: 'public, max-age=300' },
    { method: 'GET', pattern: /^\/api\/v1\/places\/?(\?.*)?$/, value: 'public, max-age=30' },
    { method: 'GET', pattern: /^\/api\/v1\/places\/[0-9a-f-]+\/?$/, value: 'public, max-age=60' },
    { method: 'GET', pattern: /^\/api\/v1\/health\/?$/, value: 'public, max-age=10' },
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    // Neu header da duoc set (vd error filter, controller) thi khong override.
    if (response.getHeader('Cache-Control')) return next.handle();

    const match = CacheControlInterceptor.RULES.find(
      (rule) => rule.method === request.method && rule.pattern.test(request.path),
    );
    if (match) response.setHeader('Cache-Control', match.value);

    return next.handle();
  }
}
