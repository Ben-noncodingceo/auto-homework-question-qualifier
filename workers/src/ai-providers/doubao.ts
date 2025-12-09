import { BaseAIProvider } from './base';
import { AIMessage, AIResponse } from '../types';

/**
 * Doubao (豆包) AI Provider - ByteDance Volcengine
 * API Documentation: https://www.volcengine.com/docs/82379/1099475
 */
export class DoubaoProvider extends BaseAIProvider {
  constructor(apiKey: string) {
    // Doubao uses Volcengine ARK API endpoint
    super(apiKey, 'https://ark.cn-beijing.volces.com/api/v3');
  }

  async callAPI(
    messages: AIMessage[],
    model: string = 'doubao-pro-32k',
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

  // Override fetchAPI to use custom headers for Doubao
  protected async fetchAPI(url: string, body: any): Promise<any> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Doubao API call failed: ${response.status} ${error}`);
    }

    return response.json();
  }
}
