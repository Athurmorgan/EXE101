import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Paginated } from '../dto/paginated.dto';

/**
 * Boc moi ket qua thanh `{ data, meta }`.
 *
 * Controller chi tra ve du lieu thuan; client luon doc `payload.data`.
 * Danh sach phan trang da co san `meta` nen duoc giu nguyen, tranh boc hai lan.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    // Response cua @Res() da do controller tu ghi — khong boc lai.
    if (context.getType() !== 'http') return next.handle();

    return next.handle().pipe(
      map((data) => {
        if (isPaginated(data)) return data;
        return { data: data ?? null };
      }),
    );
  }
}

function isPaginated<T>(value: unknown): value is Paginated<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as Paginated<T>).data) &&
    typeof (value as Paginated<T>).meta === 'object' &&
    (value as Paginated<T>).meta !== null
  );
}
