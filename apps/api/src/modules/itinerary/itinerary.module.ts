import { Module } from '@nestjs/common';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';
import { AiModule } from '../ai/ai.module';

@Module({
  controllers: [ItineraryController],
  providers: [ItineraryService],
  imports: [AiModule],
  exports: [ItineraryService],
})
export class ItineraryModule {}
