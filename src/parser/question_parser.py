"""Parse questions from LaTeX content"""
import re
from typing import List, Dict


class QuestionParser:
    """Extract individual questions from LaTeX content"""

    def __init__(self):
        self.questions = []

    def parse(self, latex_content: str) -> List[Dict[str, str]]:
        """
        Parse LaTeX content to extract individual questions

        Args:
            latex_content: LaTeX source code

        Returns:
            List of dictionaries containing question number and content
        """
        questions = []

        # Split by section markers
        sections = re.split(r'\\section\*\{([^}]+)\}', latex_content)

        # Process sections
        current_question = None
        for i, section in enumerate(sections):
            if i == 0:
                # Skip preamble
                continue

            if i % 2 == 1:
                # This is a section header (question number)
                current_question = {
                    'number': self._extract_question_number(section),
                    'header': section,
                    'content': ''
                }
            else:
                # This is section content
                if current_question:
                    # Clean content
                    content = self._clean_content(section)
                    current_question['content'] = content
                    questions.append(current_question)
                    current_question = None

        # If no sections found, try alternative parsing
        if not questions:
            questions = self._parse_without_sections(latex_content)

        self.questions = questions
        return questions

    def _extract_question_number(self, header: str) -> str:
        """Extract question number from header"""
        # Try to find a number in the header
        match = re.search(r'\d+', header)
        if match:
            return match.group(0)

        # If no number found, return the full header
        return header.strip()

    def _clean_content(self, content: str) -> str:
        """Clean LaTeX content for analysis"""
        # Remove extra whitespace
        content = re.sub(r'\n\s*\n', '\n\n', content)
        content = content.strip()

        # Remove some LaTeX commands but keep the content
        content = re.sub(r'\\textbf\{([^}]+)\}', r'\1', content)
        content = re.sub(r'\\textit\{([^}]+)\}', r'\1', content)

        return content

    def _parse_without_sections(self, latex_content: str) -> List[Dict[str, str]]:
        """
        Parse questions without section markers
        Look for common question patterns in the content
        """
        questions = []

        # Extract just the document body
        body_match = re.search(r'\\begin\{document\}(.*?)\\end\{document\}', latex_content, re.DOTALL)
        if not body_match:
            return questions

        body = body_match.group(1)

        # Split by question patterns
        patterns = [
            r'(?=\d+[.、])',  # 1. or 1、
            r'(?=[问题题]\s*\d+)',  # 问题1 or 题1
            r'(?=Question\s+\d+)',  # Question 1
            r'(?=Problem\s+\d+)',  # Problem 1
            r'(?=\(\d+\))',  # (1)
            r'(?=\[\d+\])',  # [1]
        ]

        parts = None
        for pattern in patterns:
            parts = re.split(pattern, body, flags=re.IGNORECASE)
            if len(parts) > 1:
                break

        if parts and len(parts) > 1:
            for i, part in enumerate(parts[1:], 1):  # Skip first empty part
                part = part.strip()
                if part:
                    # Extract question number from the beginning
                    first_line = part.split('\n')[0]
                    number = self._extract_question_number(first_line)

                    questions.append({
                        'number': number,
                        'header': first_line,
                        'content': self._clean_content(part)
                    })

        return questions

    def get_question_count(self) -> int:
        """Get the number of questions parsed"""
        return len(self.questions)
