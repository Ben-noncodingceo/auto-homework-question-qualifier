// AI Provider types
export type AIProvider = 'deepseek' | 'doubao' | 'tongyi';

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  temperature: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Document types
export interface Question {
  question_number: string;
  content: string;
  subject?: string;
  analysis?: string;
  knowledge_tags: string[];
  ability_tags: string[];
  difficulty?: number;
}

export interface ParsedDocument {
  questions: Question[];
  total_count: number;
}

// Request/Response types
export interface AnalyzeRequest {
  file: File;
  config: AIModelConfig;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: ParsedDocument;
  error?: string;
}

// Environment bindings
export interface Env {
  // Secrets
  DEEPSEEK_API_KEY: string;
  DOUBAO_API_KEY: string;
  TONGYI_API_KEY: string;

  // Variables
  ALLOWED_ORIGINS: string;

  // Bindings (optional)
  AI?: any;
  UPLOADS?: R2Bucket;
  CACHE?: KVNamespace;
}

// Available models for each provider
export const AVAILABLE_MODELS = {
  deepseek: [
    { id: 'deepseek-chat', name: 'DeepSeek Chat' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder' }
  ],
  doubao: [
    { id: 'doubao-pro-32k', name: 'Doubao Pro 32K' },
    { id: 'doubao-lite-32k', name: 'Doubao Lite 32K' },
    { id: 'doubao-pro-128k', name: 'Doubao Pro 128K' }
  ],
  tongyi: [
    { id: 'qwen-turbo', name: 'Qwen Turbo' },
    { id: 'qwen-plus', name: 'Qwen Plus' },
    { id: 'qwen-max', name: 'Qwen Max' }
  ]
} as const;
