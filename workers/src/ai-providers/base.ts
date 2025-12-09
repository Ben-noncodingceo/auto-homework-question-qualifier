import { AIMessage, AIResponse } from '../types';

export abstract class BaseAIProvider {
  protected apiKey: string;
  protected baseURL: string;

  constructor(apiKey: string, baseURL: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  abstract callAPI(
    messages: AIMessage[],
    model: string,
    temperature: number,
    maxTokens?: number
  ): Promise<AIResponse>;

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
      throw new Error(`API call failed: ${response.status} ${error}`);
    }

    return response.json();
  }
}
