"""Difficulty analyzer using AI models"""
import os
import json
from typing import Dict, List
from openai import OpenAI


class DifficultyAnalyzer:
    """Analyze question difficulty using AI models (DeepSeek or ChatGPT)"""

    def __init__(self, api_provider: str = None, api_key: str = None):
        """
        Initialize the analyzer

        Args:
            api_provider: 'openai' or 'deepseek' (defaults to env var API_PROVIDER)
            api_key: API key (defaults to env var based on provider)
        """
        self.api_provider = api_provider or os.getenv('API_PROVIDER', 'deepseek')

        # Initialize OpenAI client (works for both OpenAI and DeepSeek)
        if self.api_provider == 'deepseek':
            self.api_key = api_key or os.getenv('DEEPSEEK_API_KEY')
            self.api_base = os.getenv('DEEPSEEK_API_BASE', 'https://api.deepseek.com/v1')
            self.model = os.getenv('DEEPSEEK_MODEL', 'deepseek-chat')

            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.api_base
            )
        else:  # openai
            self.api_key = api_key or os.getenv('OPENAI_API_KEY')
            self.model = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')

            self.client = OpenAI(api_key=self.api_key)

    def analyze_question(self, question_content: str) -> Dict:
        """
        Analyze a single question for difficulty and keywords

        Args:
            question_content: The question text

        Returns:
            Dictionary with 'difficulty' (1-5) and 'keywords' (list of 3-5 keywords)
        """
        prompt = self._create_analysis_prompt(question_content)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "你是一个专业的教育评估专家，擅长分析题目难度和知识点。请以JSON格式返回结果。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=500
            )

            result = response.choices[0].message.content.strip()

            # Parse JSON response
            analysis = self._parse_response(result)

            return analysis

        except Exception as e:
            print(f"Warning: API call failed - {str(e)}")
            # Return default values if API fails
            return {
                'difficulty': 3,
                'keywords': ['未知'],
                'error': str(e)
            }

    def analyze_questions(self, questions: List[Dict]) -> List[Dict]:
        """
        Analyze multiple questions

        Args:
            questions: List of question dictionaries with 'number' and 'content'

        Returns:
            List of analysis results with difficulty and keywords
        """
        results = []

        for question in questions:
            print(f"Analyzing question {question['number']}...")

            analysis = self.analyze_question(question['content'])

            results.append({
                'question_number': question['number'],
                'difficulty': analysis['difficulty'],
                'keywords': analysis['keywords']
            })

        return results

    def _create_analysis_prompt(self, question_content: str) -> str:
        """Create the prompt for the AI model"""
        return f"""请分析以下题目的难度和知识点：

题目内容：
{question_content}

请以JSON格式返回结果，包含以下字段：
1. difficulty: 难度评分（1-5分，1最简单，5最难）
2. keywords: 3-5个关键知识点标签（中文）

评分标准：
- 1分：基础概念，直接应用
- 2分：简单应用，需要理解基本概念
- 3分：中等难度，需要综合运用多个知识点
- 4分：较难，需要深入理解和分析
- 5分：非常难，需要创新思维和综合能力

返回格式示例：
{{
    "difficulty": 3,
    "keywords": ["函数", "导数", "极值"]
}}

请直接返回JSON，不要包含其他说明文字。"""

    def _parse_response(self, response: str) -> Dict:
        """Parse the AI model response"""
        try:
            # Try to extract JSON from response
            # Sometimes the model includes markdown code blocks
            if '```json' in response:
                json_start = response.index('```json') + 7
                json_end = response.rindex('```')
                response = response[json_start:json_end].strip()
            elif '```' in response:
                json_start = response.index('```') + 3
                json_end = response.rindex('```')
                response = response[json_start:json_end].strip()

            # Parse JSON
            data = json.loads(response)

            # Validate and extract fields
            difficulty = int(data.get('difficulty', 3))
            difficulty = max(1, min(5, difficulty))  # Ensure 1-5 range

            keywords = data.get('keywords', [])
            if isinstance(keywords, str):
                keywords = [keywords]

            # Ensure 3-5 keywords
            if len(keywords) < 3:
                keywords.extend(['通用'] * (3 - len(keywords)))
            keywords = keywords[:5]

            return {
                'difficulty': difficulty,
                'keywords': keywords
            }

        except (json.JSONDecodeError, ValueError, KeyError) as e:
            print(f"Warning: Failed to parse response - {str(e)}")
            print(f"Response was: {response}")

            # Return default values
            return {
                'difficulty': 3,
                'keywords': ['未知', '通用', '待分析']
            }
