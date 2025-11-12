"""PDF to LaTeX converter"""
import pdfplumber
from typing import Optional


class PDFConverter:
    """Convert PDF files to LaTeX format"""

    def __init__(self):
        self.latex_content = ""

    def convert(self, pdf_path: str) -> str:
        """
        Convert PDF file to LaTeX

        Args:
            pdf_path: Path to the PDF file

        Returns:
            LaTeX content as string
        """
        latex_lines = [
            r"\documentclass{article}",
            r"\usepackage[utf8]{inputenc}",
            r"\usepackage{amsmath}",
            r"\usepackage{amssymb}",
            r"\usepackage{geometry}",
            r"\geometry{a4paper, margin=1in}",
            r"",
            r"\begin{document}",
            r""
        ]

        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    # Extract text from page
                    text = page.extract_text()

                    if text:
                        # Add page header
                        if page_num > 1:
                            latex_lines.append(r"\newpage")
                            latex_lines.append(r"")

                        # Process text line by line
                        lines = text.split('\n')
                        for line in lines:
                            line = line.strip()
                            if line:
                                # Escape special LaTeX characters
                                line = self._escape_latex(line)

                                # Detect question numbers (e.g., "1.", "问题1:", "Question 1:")
                                if self._is_question_header(line):
                                    latex_lines.append(r"")
                                    latex_lines.append(r"\section*{" + line + r"}")
                                    latex_lines.append(r"")
                                else:
                                    latex_lines.append(line)
                                    latex_lines.append(r"")

        except Exception as e:
            raise Exception(f"Failed to convert PDF: {str(e)}")

        latex_lines.append(r"\end{document}")
        self.latex_content = '\n'.join(latex_lines)
        return self.latex_content

    def _escape_latex(self, text: str) -> str:
        """Escape special LaTeX characters"""
        # Special characters that need escaping in LaTeX
        special_chars = {
            '&': r'\&',
            '%': r'\%',
            '$': r'\$',
            '#': r'\#',
            '_': r'\_',
            '{': r'\{',
            '}': r'\}',
            '~': r'\textasciitilde{}',
            '^': r'\textasciicircum{}',
            '\\': r'\textbackslash{}',
        }

        for char, escaped in special_chars.items():
            text = text.replace(char, escaped)

        return text

    def _is_question_header(self, line: str) -> bool:
        """Detect if a line is a question header"""
        import re

        # Patterns for question headers
        patterns = [
            r'^\d+[.、]',  # 1. or 1、
            r'^[问题题]\s*\d+',  # 问题1 or 题1
            r'^Question\s+\d+',  # Question 1
            r'^Problem\s+\d+',  # Problem 1
            r'^\(\d+\)',  # (1)
            r'^\[\d+\]',  # [1]
        ]

        for pattern in patterns:
            if re.match(pattern, line, re.IGNORECASE):
                return True

        return False

    def save_latex(self, output_path: str) -> None:
        """Save LaTeX content to file"""
        if not self.latex_content:
            raise Exception("No LaTeX content to save. Please run convert() first.")

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(self.latex_content)
