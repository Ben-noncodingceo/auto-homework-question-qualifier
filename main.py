#!/usr/bin/env python3
"""
Auto Homework Question Qualifier
Main application for converting PDF/DOCX to LaTeX and analyzing question difficulty
"""
import os
import sys
import json
import argparse
from pathlib import Path
from dotenv import load_dotenv

from src.converters.pdf_converter import PDFConverter
from src.converters.docx_converter import DOCXConverter
from src.preview.latex_preview import LaTeXPreview
from src.parser.question_parser import QuestionParser
from src.analyzer.difficulty_analyzer import DifficultyAnalyzer


def main():
    """Main application entry point"""
    # Load environment variables
    load_dotenv()

    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='Convert PDF/DOCX to LaTeX and analyze question difficulty'
    )
    parser.add_argument(
        'input_file',
        help='Input file (PDF or DOCX)'
    )
    parser.add_argument(
        '-o', '--output-dir',
        default='output',
        help='Output directory (default: output)'
    )
    parser.add_argument(
        '--no-preview',
        action='store_true',
        help='Skip LaTeX preview generation'
    )
    parser.add_argument(
        '--no-analysis',
        action='store_true',
        help='Skip difficulty analysis'
    )
    parser.add_argument(
        '--api-provider',
        choices=['openai', 'deepseek'],
        help='API provider for analysis (default: from .env)'
    )
    parser.add_argument(
        '--api-key',
        help='API key (default: from .env)'
    )

    args = parser.parse_args()

    # Validate input file
    input_file = Path(args.input_file)
    if not input_file.exists():
        print(f"Error: Input file '{input_file}' not found")
        sys.exit(1)

    # Determine file type
    file_ext = input_file.suffix.lower()
    if file_ext not in ['.pdf', '.docx']:
        print(f"Error: Unsupported file type '{file_ext}'. Only .pdf and .docx are supported.")
        sys.exit(1)

    print(f"Processing file: {input_file}")
    print(f"Output directory: {args.output_dir}")
    print()

    # Step 1: Convert to LaTeX
    print("=" * 60)
    print("STEP 1: Converting to LaTeX")
    print("=" * 60)

    latex_content = None

    if file_ext == '.pdf':
        print("Using PDF converter...")
        converter = PDFConverter()
        latex_content = converter.convert(str(input_file))
    else:  # .docx
        print("Using DOCX converter...")
        converter = DOCXConverter()
        latex_content = converter.convert(str(input_file))

    print(f"✓ Conversion complete")
    print()

    # Step 2: Save and preview LaTeX
    print("=" * 60)
    print("STEP 2: Generating LaTeX Preview")
    print("=" * 60)

    preview = LaTeXPreview(output_dir=args.output_dir)

    # Save LaTeX file
    tex_file = preview.save_latex(latex_content, output_name="output")
    print(f"✓ LaTeX saved to: {tex_file}")

    # Generate PDF preview (if not disabled)
    if not args.no_preview:
        try:
            pdf_file = preview.generate_pdf(latex_content, output_name="preview")
            print(f"✓ Preview PDF generated: {pdf_file}")
        except Exception as e:
            print(f"⚠ Preview generation failed: {str(e)}")
            print(f"  LaTeX file is still available at: {tex_file}")
    else:
        print("⊘ Preview generation skipped")

    print()

    # Step 3: Parse questions
    print("=" * 60)
    print("STEP 3: Parsing Questions")
    print("=" * 60)

    parser_obj = QuestionParser()
    questions = parser_obj.parse(latex_content)

    print(f"✓ Found {len(questions)} question(s)")

    for q in questions:
        print(f"  - Question {q['number']}: {len(q['content'])} characters")

    print()

    # Step 4: Analyze difficulty (if not disabled)
    if not args.no_analysis:
        print("=" * 60)
        print("STEP 4: Analyzing Question Difficulty")
        print("=" * 60)

        # Check API configuration
        api_provider = args.api_provider or os.getenv('API_PROVIDER', 'deepseek')
        api_key = args.api_key or (
            os.getenv('DEEPSEEK_API_KEY') if api_provider == 'deepseek'
            else os.getenv('OPENAI_API_KEY')
        )

        if not api_key:
            print(f"⚠ Warning: No API key configured for {api_provider}")
            print("  Please set up your .env file with API credentials")
            print("  See .env.example for reference")
            print()
            print("Skipping analysis...")
        else:
            print(f"Using API provider: {api_provider}")

            analyzer = DifficultyAnalyzer(api_provider=api_provider, api_key=api_key)
            results = analyzer.analyze_questions(questions)

            print()
            print("✓ Analysis complete")
            print()

            # Display results
            print("=" * 60)
            print("RESULTS")
            print("=" * 60)
            print()

            for result in results:
                print(f"Question {result['question_number']}:")
                print(f"  Difficulty: {result['difficulty']}/5")
                print(f"  Keywords: {', '.join(result['keywords'])}")
                print()

            # Save results to JSON
            results_file = os.path.join(args.output_dir, 'analysis_results.json')
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)

            print(f"✓ Results saved to: {results_file}")
            print()

    else:
        print("=" * 60)
        print("STEP 4: Analysis Skipped")
        print("=" * 60)
        print()

    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Input file: {input_file}")
    print(f"Questions found: {len(questions)}")
    print(f"LaTeX output: {tex_file}")
    if not args.no_preview:
        print(f"Preview PDF: {os.path.join(args.output_dir, 'preview.pdf')}")
    if not args.no_analysis and api_key:
        print(f"Analysis results: {os.path.join(args.output_dir, 'analysis_results.json')}")
    print()
    print("✓ Processing complete!")


if __name__ == '__main__':
    main()
