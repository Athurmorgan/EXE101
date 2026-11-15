import type { ConfigService } from '@nestjs/config';

/**
 * Lop mong goi LLM, tra ve text. Provider duoc chon theo bien moi truong:
 *   - ANTHROPIC_API_KEY          → Claude (ANTHROPIC_MODEL, mac dinh Haiku 4.5)
 *   - GEMINI_API_KEY_1.._N       → Gemini (GEMINI_MODEL, mac dinh 2.0 Flash)
 * Khong co key nao → danh sach rong, AiService dung heuristic.
 *
 * Moi provider chi can tra ve chuoi JSON; viec kiem tra noi dung do AiService lo.
 */
export interface LlmProvider {
  readonly name: string;
  complete(prompt: string): Promise<string>;
}

export function createProviders(config: ConfigService): LlmProvider[] {
  const providers: LlmProvider[] = [];

  const anthropicKey = config.get<string>('ANTHROPIC_API_KEY')?.trim();
  if (anthropicKey) {
    const model = config.get<string>('ANTHROPIC_MODEL')?.trim() || 'claude-haiku-4-5-20251001';
    providers.push(new AnthropicProvider(anthropicKey, model));
  }

  const geminiModel = config.get<string>('GEMINI_MODEL')?.trim() || 'gemini-2.0-flash';
  for (let i = 1; i <= 5; i++) {
    const key = config.get<string>(`GEMINI_API_KEY_${i}`)?.trim();
    if (key) providers.push(new GeminiProvider(key, geminiModel, i));
  }

  return providers;
}

class AnthropicProvider implements LlmProvider {
  readonly name: string;
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {
    this.name = `anthropic/${model}`;
  }

  async complete(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) throw new Error(`Anthropic ${response.status}: ${(await response.text()).slice(0, 200)}`);
    const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.find((c) => c.type === 'text')?.text;
    if (!text) throw new Error('Anthropic response rong');
    return text;
  }
}

class GeminiProvider implements LlmProvider {
  readonly name: string;
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    index: number,
  ) {
    this.name = `gemini/${model}#${index}`;
  }

  async complete(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096, responseMimeType: 'application/json' },
      }),
    });
    if (!response.ok) throw new Error(`Gemini ${response.status}: ${(await response.text()).slice(0, 200)}`);
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini response rong');
    return text;
  }
}

/** Lay object JSON dau tien trong text (model hay boc trong ```json ... ```). */
export function extractJson<T>(text: string): T {
  const cleaned = text.replace(/```json\s*|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('Khong tim thay JSON trong response');
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
