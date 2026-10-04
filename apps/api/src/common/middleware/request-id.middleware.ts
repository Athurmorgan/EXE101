import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * Gan `requestId` cho moi request de doi chieu giua log server va bao cao loi
 * tu client. Neu client gui san `X-Request-Id` (vd: gateway) thi giu nguyên.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: RequestWithId, response: Response, next: NextFunction): void {
    const incoming = request.header('x-request-id');
    const requestId = incoming && incoming.length <= 64 ? incoming : randomUUID();

    request.requestId = requestId;
    response.setHeader('X-Request-Id', requestId);
    next();
  }
}
