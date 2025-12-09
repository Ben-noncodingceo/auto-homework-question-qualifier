import { AIProviderFactory } from './ai-providers/factory';
import { DocumentParser } from './parsers/document-parser';
import { QuestionAnalyzer } from './services/question-analyzer';
import { Env, AIModelConfig, AVAILABLE_MODELS } from './types';

/**
 * Cloudflare Workers API for Homework Question Analysis
 */

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      // Route: GET /api/models - Get available models
      if (url.pathname === '/api/models' && request.method === 'GET') {
        return new Response(JSON.stringify(AVAILABLE_MODELS), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Route: GET /api/health - Health check
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return new Response(JSON.stringify({ status: 'ok', version: '2.0.0' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Route: POST /api/analyze - Analyze document
      if (url.pathname === '/api/analyze' && request.method === 'POST') {
        return await handleAnalyze(request, env, corsHeaders);
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error: any) {
      console.error('Error:', error);
      return new Response(
        JSON.stringify({
          error: error.message || 'Internal server error'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }
};

/**
 * Handle document analysis request
 */
async function handleAnalyze(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const formData = await request.formData();

    // Get uploaded file
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Get AI configuration
    const configStr = formData.get('config') as string;
    if (!configStr) {
      throw new Error('No configuration provided');
    }

    const config: AIModelConfig = JSON.parse(configStr);

    // Validate configuration
    if (!config.provider || !config.model) {
      throw new Error('Invalid configuration: provider and model are required');
    }

    if (config.temperature < 0 || config.temperature > 2) {
      throw new Error('Invalid temperature: must be between 0 and 2');
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File too large (max 10MB)');
    }

    // Validate file type
    const filename = file.name.toLowerCase();
    if (!filename.endsWith('.pdf') && !filename.endsWith('.docx') && !filename.endsWith('.doc')) {
      throw new Error('Unsupported file format. Only PDF and Word documents are supported.');
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes)`);
    console.log(`Using ${config.provider} - ${config.model} (temp: ${config.temperature})`);

    // Step 1: Parse document (extract text and images)
    console.log('Parsing document...');
    const documentContent = await DocumentParser.parseDocument(file);

    console.log(`Extracted ${documentContent.text.length} characters and ${documentContent.images.length} images`);

    // Validate that we have some content
    if (!DocumentParser.validateContent(documentContent.text) && documentContent.images.length === 0) {
      throw new Error('No valid content found in document. Please ensure the PDF contains readable text or images.');
    }

    // Step 2: Create AI provider
    const aiProvider = AIProviderFactory.create(config.provider, env);

    // Step 3: Analyze questions with multimodal support
    console.log('Analyzing questions with AI...');
    if (documentContent.images.length > 0) {
      console.log(`📷 Using multimodal analysis (${documentContent.images.length} images)`);
    }

    const analyzer = new QuestionAnalyzer(aiProvider, config, documentContent);
    const questions = await analyzer.analyzeDocument();

    console.log(`✅ Analysis complete: ${questions.length} questions processed`);

    // Return results
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          questions,
          total_count: questions.length,
          document_length: documentContent.text.length,
          image_count: documentContent.images.length,
          has_multimodal: documentContent.images.length > 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Analysis error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to analyze document'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
