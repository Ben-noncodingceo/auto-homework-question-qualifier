import { DeepSeekProvider } from './deepseek';
import { DoubaoProvider } from './doubao';
import { TongyiProvider } from './tongyi';
import { BaseAIProvider } from './base';
import { AIProvider, Env } from '../types';

export class AIProviderFactory {
  static create(provider: AIProvider, env: Env): BaseAIProvider {
    switch (provider) {
      case 'deepseek':
        if (!env.DEEPSEEK_API_KEY) {
          throw new Error('DEEPSEEK_API_KEY not configured');
        }
        return new DeepSeekProvider(env.DEEPSEEK_API_KEY);

      case 'doubao':
        if (!env.DOUBAO_API_KEY) {
          throw new Error('DOUBAO_API_KEY not configured');
        }
        return new DoubaoProvider(env.DOUBAO_API_KEY);

      case 'tongyi':
        if (!env.TONGYI_API_KEY) {
          throw new Error('TONGYI_API_KEY not configured');
        }
        return new TongyiProvider(env.TONGYI_API_KEY);

      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }
}
