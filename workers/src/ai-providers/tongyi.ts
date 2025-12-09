import { BaseAIProvider } from './base';
import { AIMessage, AIResponse } from '../types';

/**
 * Tongyi (通义千问) AI Provider - Alibaba Cloud
 * API Documentation: https://help.aliyun.com/zh/dashscope/developer-reference/api-details
 */
export class TongyiProvider extends BaseAIProvider {
  constructor(apiKey: string) {
    super(apiKey, 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation');
  }

  async callAPI(
    messages: AIMessage[],
    model: string = 'qwen-turbo',
    temperature: number = 0.3,
    maxTokens: number = 4000
  ): Promise<AIResponse> {
    // Tongyi uses a different request format
    const requestBody = {
      model,
      input: {
        messages: messages
      },
      parameters: {
        temperature,
        max_tokens: maxTokens,
        result_format: 'message'
      }
    };

    const data = await this.fetchAPI(this.baseURL, requestBody);

    return {
      content: data.output.choices[0].message.content,
      usage: data.usage
    };
  }

  // Override fetchAPI to use X-DashScope-APIKey header
  protected async fetchAPI(url: string, body: any): Promise<any> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DashScope-APIKey': this.apiKey
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tongyi API call failed: ${response.status} ${error}`);
    }

    return response.json();
  }
}
