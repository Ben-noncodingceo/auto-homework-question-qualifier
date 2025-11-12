"""DOCX to LaTeX converter"""
from docx import Document
import re


class DOCXConverter:
    """Convert DOCX files to LaTeX format"""

    def __init__(self):
        self.latex_content = ""

    def convert(self, docx_path: str) -> str:
        """
        Convert DOCX file to LaTeX

        Args:
            docx_path: Path to the DOCX file

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
            doc = Document(docx_path)

            for para in doc.paragraphs:
                text = para.text.strip()

                if not text:
                    latex_lines.append(r"")
                    continue

                # Escape special LaTeX characters
                text = self._escape_latex(text)

                # Detect question headers
                if self._is_question_header(text):
                    latex_lines.append(r"")
                    latex_lines.append(r"\section*{" + text + r"}")
                    latex_lines.append(r"")
                else:
                    # Check for bold text (heading style)
                    if para.runs and para.runs[0].bold:
                        latex_lines.append(r"\textbf{" + text + r"}")
                    else:
                        latex_lines.append(text)
                    latex_lines.append(r"")

            # Process tables if any
            for table in doc.tables:
                latex_lines.append(r"")
                latex_lines.append(r"\begin{tabular}{" + "l" * len(table.columns) + r"}")
                latex_lines.append(r"\hline")

                for row in table.rows:
                    cells = [self._escape_latex(cell.text.strip()) for cell in row.cells]
                    latex_lines.append(" & ".join(cells) + r" \\")
                    latex_lines.append(r"\hline")

                latex_lines.append(r"\end{tabular}")
                latex_lines.append(r"")

        except Exception as e:
            raise Exception(f"Failed to convert DOCX: {str(e)}")

        latex_lines.append(r"\end{document}")
        self.latex_content = '\n'.join(latex_lines)
        return self.latex_content

    def _escape_latex(self, text: str) -> str:
        """Escape special LaTeX characters"""
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
