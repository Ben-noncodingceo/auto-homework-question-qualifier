import { BaseAIProvider } from '../ai-providers/base';
import { Question, AIModelConfig } from '../types';

/**
 * Question Analyzer Service
 * Analyzes questions using AI to extract subject, analysis, and tags
 */
export class QuestionAnalyzer {
  private aiProvider: BaseAIProvider;
  private config: AIModelConfig;

  constructor(aiProvider: BaseAIProvider, config: AIModelConfig) {
    this.aiProvider = aiProvider;
    this.config = config;
  }

  /**
   * Identify and extract questions from document text
   */
  async identifyQuestions(documentText: string): Promise<string[]> {
    const prompt = `请识别以下文档中所有的大题编号，忽略小题。

文档内容：
${documentText}

要求：
1. 只识别大题编号（如：1. 2. 3. 或 一、二、三、等）
2. 忽略小题编号（如：(1) (2) (a) (b) 等）
3. 返回所有找到的大题编号

返回JSON格式：
{
  "question_numbers": ["1", "2", "3", "4", "5"]
}

请直接返回JSON，不要包含其他说明文字。`;

    const response = await this.aiProvider.callAPI(
      [
        {
          role: 'system',
          content: '你是一个专业的教育专家，擅长识别和分析题目。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      this.config.model,
      this.config.temperature,
      1000
    );

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0]);
      return data.question_numbers || [];
    } catch (error) {
      console.error('Failed to parse question numbers:', error);
      return [];
    }
  }

  /**
   * Analyze a batch of questions (max 5 per batch for better quality)
   */
  async analyzeQuestionBatch(
    documentText: string,
    questionNumbers: string[]
  ): Promise<Question[]> {
    const numbersStr = questionNumbers.join('、');

    const prompt = `请分析以下文档中编号为【${numbersStr}】的题目。

文档内容：
${documentText}

要求：
1. 只分析编号为【${numbersStr}】的大题
2. 忽略小题（如：(1) (2) (a) (b) 等）
3. 对每道大题分析：
   - subject: 题目所属学科（如：数学、物理、化学、语文、英语等）
   - analysis: 题目的完整解析（200-500字，包含解题思路、关键步骤、易错点）
   - knowledge_tags: 恰好5个知识点标签（精准描述该题考察的核心知识点）
   - ability_tags: 恰好5个能力标签（如：逻辑推理、计算能力、阅读理解、创新思维等）
   - difficulty: 难度评分（0-5分，0最简单，5最难，保留1位小数）

难度评分标准：
- 0-1分：基础概念，直接应用
- 1-2分：简单应用，需要理解基本概念
- 2-3分：中等难度，需要综合运用
- 3-4分：较难，需要深入分析
- 4-5分：非常难，需要创新思维

返回JSON格式：
{
  "questions": [
    {
      "question_number": "1",
      "subject": "数学",
      "analysis": "这道题考察了...",
      "knowledge_tags": ["知识点1", "知识点2", "知识点3", "知识点4", "知识点5"],
      "ability_tags": ["能力1", "能力2", "能力3", "能力4", "能力5"],
      "difficulty": 2.5
    }
  ]
}

请直接返回JSON，不要包含其他说明文字。`;

    const response = await this.aiProvider.callAPI(
      [
        {
          role: 'system',
          content: '你是一个专业的教育专家，擅长题目分析和教学评估。请仔细分析每道题目，提供准确、完整的解析。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      this.config.model,
      this.config.temperature,
      3000
    );

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0]);
      const questions = data.questions || [];

      // Validate and normalize data
      return questions.map((q: any) => this.normalizeQuestion(q));
    } catch (error) {
      console.error('Failed to parse question analysis:', error);
      return [];
    }
  }

  /**
   * Refine analysis for a single question (ensures completeness)
   */
  async refineQuestionAnalysis(question: Question, documentText: string): Promise<Question> {
    // If analysis is already complete and detailed, skip refinement
    if (question.analysis && question.analysis.length > 150) {
      return question;
    }

    const prompt = `请为以下题目提供更详细、完整的解析。

题目编号：${question.question_number}
当前解析：${question.analysis || '暂无'}

文档内容：
${documentText}

要求：
1. 提供200-500字的完整解析
2. 包含：解题思路、关键步骤、易错点、知识点应用
3. 语言清晰、逻辑严密

返回JSON格式：
{
  "analysis": "详细解析内容..."
}

请直接返回JSON，不要包含其他说明文字。`;

    try {
      const response = await this.aiProvider.callAPI(
        [
          {
            role: 'system',
            content: '你是一个专业的教育专家，擅长提供详细的题目解析。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        this.config.model,
        this.config.temperature,
        2000
      );

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        question.analysis = data.analysis || question.analysis;
      }
    } catch (error) {
      console.error('Failed to refine analysis:', error);
    }

    return question;
  }

  /**
   * Normalize and validate question data
   */
  private normalizeQuestion(q: any): Question {
    // Ensure difficulty is in range 0-5 with 1 decimal place
    let difficulty = parseFloat(q.difficulty || 2.5);
    difficulty = Math.max(0.0, Math.min(5.0, difficulty));
    difficulty = Math.round(difficulty * 10) / 10;

    // Ensure exactly 5 knowledge tags
    let knowledgeTags = Array.isArray(q.knowledge_tags) ? q.knowledge_tags : [];
    while (knowledgeTags.length < 5) {
      knowledgeTags.push('通用知识点');
    }
    knowledgeTags = knowledgeTags.slice(0, 5);

    // Ensure exactly 5 ability tags
    let abilityTags = Array.isArray(q.ability_tags) ? q.ability_tags : [];
    while (abilityTags.length < 5) {
      abilityTags.push('基础能力');
    }
    abilityTags = abilityTags.slice(0, 5);

    return {
      question_number: String(q.question_number || ''),
      content: String(q.content || ''),
      subject: String(q.subject || '未知'),
      analysis: String(q.analysis || ''),
      knowledge_tags: knowledgeTags,
      ability_tags: abilityTags,
      difficulty
    };
  }

  /**
   * Analyze complete document with multiple questions
   */
  async analyzeDocument(documentText: string): Promise<Question[]> {
    // Step 1: Identify all questions
    console.log('Identifying questions...');
    const questionNumbers = await this.identifyQuestions(documentText);

    if (questionNumbers.length === 0) {
      throw new Error('No questions found in document');
    }

    if (questionNumbers.length > 50) {
      throw new Error('Too many questions (max 50)');
    }

    console.log(`Found ${questionNumbers.length} questions`);

    // Step 2: Analyze questions in batches of 5
    const batchSize = 5;
    const allQuestions: Question[] = [];

    for (let i = 0; i < questionNumbers.length; i += batchSize) {
      const batch = questionNumbers.slice(i, Math.min(i + batchSize, questionNumbers.length));
      console.log(`Analyzing questions ${i + 1}-${i + batch.length}...`);

      const batchQuestions = await this.analyzeQuestionBatch(documentText, batch);
      allQuestions.push(...batchQuestions);

      // Small delay to avoid rate limiting
      if (i + batchSize < questionNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Step 3: Refine analyses for questions that need it
    console.log('Refining analyses...');
    const refinedQuestions = await Promise.all(
      allQuestions.map(q => this.refineQuestionAnalysis(q, documentText))
    );

    return refinedQuestions;
  }
}
