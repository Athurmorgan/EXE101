import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import type { GenerateItineraryDto } from './dto/ai.dto';

@Controller('ai/itinerary')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() body: GenerateItineraryDto) {
    return this.aiService.generate5Options(body);
  }
}
