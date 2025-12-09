import { BaseAIProvider } from './base';
import { AIMessage, AIResponse } from '../types';

export class DeepSeekProvider extends BaseAIProvider {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.deepseek.com/v1');
  }

  async callAPI(
    messages: AIMessage[],
    model: string = 'deepseek-chat',
    temperature: number = 0.3,
    maxTokens: number = 4000
  ): Promise<AIResponse> {
    const data = await this.fetchAPI(`${this.baseURL}/chat/completions`, {
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    });

    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }
}
