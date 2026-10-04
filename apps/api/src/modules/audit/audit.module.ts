import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

/**
 * `@Global` vi nhieu module deu ghi audit (doi mat khau, xac thuc email,
 * quan tri tai khoan) — khong phai import lai o tung noi.
 */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
