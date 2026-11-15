import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
// Import gia tri (khong `import type`): ValidationPipe can class luc runtime.
import { GenerateItineraryDto } from './dto/ai.dto';

@Controller('ai/itinerary')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() body: GenerateItineraryDto) {
    return this.aiService.generate5Options(body);
  }
}
