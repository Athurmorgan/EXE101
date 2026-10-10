import { Module } from '@nestjs/common';
import { ShortlistController } from './shortlist.controller';
import { ShortlistService } from './shortlist.service';

@Module({
  controllers: [ShortlistController],
  providers: [ShortlistService],
  exports: [ShortlistService],
})
export class ShortlistModule {}
