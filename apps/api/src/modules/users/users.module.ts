import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  // `AuditService` den tu `AuditModule` (`@Global`) nen khong can import.
  exports: [UsersService],
})
export class UsersModule {}
