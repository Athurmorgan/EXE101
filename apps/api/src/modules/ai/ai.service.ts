import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoundRobinRotator } from './gemini-rotation';
import type { GenerateItineraryDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly rotator: RoundRobinRotator;

  constructor(private readonly config: ConfigService) {
    const keys = [
      this.config.get<string>('GEMINI_API_KEY_1') ?? '',
      this.config.get<string>('GEMINI_API_KEY_2') ?? '',
    ];
    this.rotator = new RoundRobinRotator(keys);
    this.logger.log(`Gemini Round-Robin: ${this.rotator.size} key(s) configured`);
  }

  async generate5Options(dto: GenerateItineraryDto): Promise<AiItineraryOptions> {
    const days = this.calculateDays(dto.startDate, dto.endDate);
    const prompt = this.buildPrompt(dto, days);

    for (let attempt = 0; attempt < this.rotator.size; attempt++) {
      const key = this.rotator.getActiveKey();
      try {
        const result = await this.callGemini(key, prompt);
        return this.parseResponse(result, days);
      } catch (err) {
        this.logger.warn(`Gemini key #${this.rotator.getActiveIndex()} failed: ${(err as Error).message}. Rotating.`);
        this.rotator.rotate();
      }
    }

    this.logger.error('All Gemini keys failed. Using fallback.');
    return this.fallbackOptions(dto, days);
  }

  private buildPrompt(dto: GenerateItineraryDto, days: number): string {
    const styles = dto.styles?.join(', ') ?? 'general sightseeing';
    return `Ban la AI travel planner cho Vivivu. Sinh 5 PHUONG AN lich trinh KHAC NHAU cho ${days} ngay tai Viet Nam.
- Khu vuc: ${dto.regionId}
- Ngay: ${dto.startDate} -> ${dto.endDate}
- So nguoi: ${dto.travelers ?? 2}
- Phong cach: ${styles}
- An uong: ${dto.dietary ?? 'khong kieng'}
- Ngan sach: ${dto.budgetVnd ? dto.budgetVnd.toLocaleString('vi-VN') + ' VND' : 'linh hoat'}

Tra loi JSON:
{"options":[{"optionNumber":1,"title":"...","description":"...","estimatedCost":1500000,"days":[{"dayNumber":1,"stops":[{"name":"...","lat":21.0285,"lng":105.8542,"address":"...","category":"restaurant","mealType":null,"stopType":"visit","scheduledTime":"09:00","estimatedDurationMin":60,"estimatedCost":0,"travelTimeFromPrevMin":0}]}]}]}`;
  }

  private async callGemini(apiKey: string, prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorBody.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini response rong');
    return text;
  }

  private parseResponse(text: string, _days: number): AiItineraryOptions {
    const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(cleaned) as AiItineraryOptions;
    if (!parsed.options || parsed.options.length !== 5) {
      throw new Error('Gemini tra khong dung 5 options');
    }
    return parsed;
  }

  private fallbackOptions(_dto: GenerateItineraryDto, _days: number): AiItineraryOptions {
    const styles = ['Cultural', 'Foodie', 'Adventure', 'Relaxation', 'Family'];
    const options: AiItineraryOption[] = [];
    for (let i = 1; i <= 5; i++) {
      options.push({
        optionNumber: i,
        title: `${styles[i - 1]} (fallback)`,
        description: 'AI tam thoi khong kha dung',
        estimatedCost: 1500000,
        days: [{
          dayNumber: 1,
          stops: [{
            name: `Dia diem mau ${i}`,
            lat: 21.0285 + (i * 0.01),
            lng: 105.8542,
            category: 'attraction',
            stopType: 'visit',
            scheduledTime: '09:00',
            estimatedDurationMin: 60,
            estimatedCost: 0,
            travelTimeFromPrevMin: 0,
          }],
        }],
      });
    }
    return { options };
  }

  private calculateDays(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.ceil((e.getTime() - s.getTime() / (1000 * 60 * 60 * 24)) + 1));
  }
}

export interface AiStop {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  category: string;
  mealType?: string | null;
  stopType: 'meal' | 'visit';
  scheduledTime: string;
  estimatedDurationMin: number;
  estimatedCost: number;
  travelTimeFromPrevMin: number;
  notes?: string;
}

export interface AiDay {
  dayNumber: number;
  stops: AiStop[];
}

export interface AiItineraryOption {
  optionNumber: number;
  title: string;
  description: string;
  estimatedCost: number;
  days: AiDay[];
}

export interface AiItineraryOptions {
  options: AiItineraryOption[];
}
