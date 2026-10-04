import { Injectable, NestMiddleware } from '@nestjs/common';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@vivivu/shared';
import type { NextFunction, Request, Response } from 'express';

interface RequestWithLocale extends Request {
  locale?: Locale;
}

/**
 * Chot ngon ngu cho request tu header `Accept-Language`.
 *
 * Client da chon ngon ngu trong UI nen header la nguon chinh; `?locale=` trong
 * query duoc day vao khi can tra du lieu cho ca mot danh sach. Luon fallback ve
 * `DEFAULT_LOCALE` vi noi dung trong DB la da duong `vi` | `en`.
 */
@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(request: RequestWithLocale, _response: Response, next: NextFunction): void {
    request.locale = this.resolve(request);
    next();
  }

  private resolve(request: RequestWithLocale): Locale {
    const fromQuery = request.query['locale'];
    if (typeof fromQuery === 'string' && isLocale(fromQuery)) return fromQuery;

    const header = request.header('accept-language');
    if (header) {
      // Lay danh sách ngôn ngữ theo thứ tự ưu tiên client khai báo.
      const ranked = header
        .split(',')
        .map((part) => {
          const [tag = '', q = 'q=1'] = part.trim().split(';');
          return { tag: tag.toLowerCase(), quality: Number.parseFloat(q.replace('q=', '')) || 0 };
        })
        .sort((a, b) => b.quality - a.quality);

      const match = ranked.find(({ tag }) => isLocale(tag.split('-')[0] ?? ''));
      const primary = match?.tag.split('-')[0];
      if (primary && isLocale(primary)) return primary;
    }

    return DEFAULT_LOCALE;
  }
}
