"""AI-powered PDF processor for LaTeX conversion and question analysis"""
import json
import requests
import PyPDF2
from typing import Dict, List, Tuple


class AIProcessor:
    """Process PDF files using AI models for LaTeX conversion and analysis"""

    def __init__(self, api_provider: str = 'deepseek', api_key: str = None):
        """
        Initialize the AI processor

        Args:
            api_provider: 'openai' or 'deepseek'
            api_key: API key
        """
        self.api_provider = api_provider
        self.api_key = api_key

        # Set API endpoint and model based on provider
        if self.api_provider == 'deepseek':
            self.api_base = 'https://api.deepseek.com/v1/chat/completions'
            self.model = 'deepseek-chat'
        else:  # openai
            self.api_base = 'https://api.openai.com/v1/chat/completions'
            self.model = 'gpt-3.5-turbo'

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text content from PDF file

        Args:
            pdf_path: Path to PDF file

        Returns:
            Extracted text content
        """
        text_content = []

        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)

                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        text_content.append(text)

        except Exception as e:
            raise Exception(f"Failed to extract PDF text: {str(e)}")

        return '\n\n'.join(text_content)

    def convert_to_latex(self, pdf_text: str) -> str:
        """
        Convert PDF text to LaTeX using AI

        Args:
            pdf_text: Extracted PDF text

        Returns:
            LaTeX code
        """
        prompt = f"""请将以下文档内容转换为LaTeX格式。

文档内容：
{pdf_text}

要求：
1. 生成完整的LaTeX文档，包括文档类和必要的包
2. 保持原有的结构和格式
3. 题目编号要清晰标记（使用\\section*或明确的编号）
4. 数学公式使用LaTeX数学环境
5. 直接返回LaTeX代码，不要添加额外说明

请生成LaTeX代码："""

        try:
            response = self._call_api(prompt, max_tokens=4000)

            # Clean up response
            latex_code = response.strip()

            # Remove markdown code blocks if present
            if '```latex' in latex_code:
                latex_code = latex_code.split('```latex')[1].split('```')[0].strip()
            elif '```' in latex_code:
                latex_code = latex_code.split('```')[1].split('```')[0].strip()

            return latex_code

        except Exception as e:
            raise Exception(f"Failed to convert to LaTeX: {str(e)}")

    def analyze_questions(self, pdf_text: str) -> List[Dict]:
        """
        Analyze questions from PDF text

        Args:
            pdf_text: Extracted PDF text

        Returns:
            List of question analysis results
        """
        prompt = f"""请分析以下文档中的题目，仅对大题进行分析，忽略小题。

文档内容：
{pdf_text}

要求：
1. 识别所有大题（如：1. 2. 3. 或 一、二、三、等）
2. 忽略小题（如：(1) (2) (a) (b) 等）
3. 对每道大题评估：
   - difficulty: 难度评分（0-5分，0最简单，5最难，保留1位小数）
   - keywords: 恰好5个知识点标签（中文）

难度评分标准：
- 0-1分：基础概念，直接应用
- 1-2分：简单应用，需要理解基本概念
- 2-3分：中等难度，需要综合运用
- 3-4分：较难，需要深入分析
- 4-5分：非常难，需要创新思维

返回JSON格式：
{{
    "questions": [
        {{
            "question_number": "1",
            "difficulty": 2.5,
            "keywords": ["知识点1", "知识点2", "知识点3", "知识点4", "知识点5"]
        }}
    ]
}}

请直接返回JSON，不要包含其他说明文字。"""

        try:
            response = self._call_api(prompt, max_tokens=2000)

            # Parse JSON response
            analysis = self._parse_analysis_response(response)

            return analysis

        except Exception as e:
            raise Exception(f"Failed to analyze questions: {str(e)}")

    def process_pdf(self, pdf_path: str) -> Tuple[str, List[Dict]]:
        """
        Complete PDF processing: convert to LaTeX and analyze questions

        Args:
            pdf_path: Path to PDF file

        Returns:
            Tuple of (latex_code, question_analysis)
        """
        # Step 1: Extract text from PDF
        print("Extracting text from PDF...")
        pdf_text = self.extract_text_from_pdf(pdf_path)

        if not pdf_text.strip():
            raise Exception("No text content found in PDF")

        # Step 2: Convert to LaTeX
        print("Converting to LaTeX...")
        latex_code = self.convert_to_latex(pdf_text)

        # Step 3: Analyze questions
        print("Analyzing questions...")
        question_analysis = self.analyze_questions(pdf_text)

        return latex_code, question_analysis

    def _call_api(self, prompt: str, max_tokens: int = 2000) -> str:
        """
        Call AI API

        Args:
            prompt: User prompt
            max_tokens: Maximum tokens to generate

        Returns:
            API response content
        """
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }

        data = {
            'model': self.model,
            'messages': [
                {
                    'role': 'system',
                    'content': '你是一个专业的教育专家，擅长LaTeX排版和题目分析。'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': 0.3,
            'max_tokens': max_tokens
        }

        response = requests.post(self.api_base, headers=headers, json=data, timeout=60)
        response.raise_for_status()

        result = response.json()
        content = result['choices'][0]['message']['content'].strip()

        return content

    def _parse_analysis_response(self, response: str) -> List[Dict]:
        """
        Parse AI analysis response

        Args:
            response: AI response string

        Returns:
            List of question analysis
        """
        try:
            # Try to extract JSON from response
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

            questions = data.get('questions', [])

            # Validate and normalize data
            normalized_questions = []
            for q in questions:
                # Ensure difficulty is in range 0-5 with 1 decimal place
                difficulty = float(q.get('difficulty', 2.5))
                difficulty = max(0.0, min(5.0, difficulty))
                difficulty = round(difficulty, 1)

                # Ensure exactly 5 keywords
                keywords = q.get('keywords', [])
                if isinstance(keywords, str):
                    keywords = [keywords]

                # Pad or trim to exactly 5 keywords
                while len(keywords) < 5:
                    keywords.append('通用')
                keywords = keywords[:5]

                normalized_questions.append({
                    'question_number': str(q.get('question_number', '')),
                    'difficulty': difficulty,
                    'keywords': keywords
                })

            return normalized_questions

        except (json.JSONDecodeError, ValueError, KeyError) as e:
            print(f"Warning: Failed to parse response - {str(e)}")
            print(f"Response was: {response}")

            # Return empty list if parsing fails
            return []
