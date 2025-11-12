#!/usr/bin/env python3
"""
Flask Web Application for Auto Homework Question Qualifier
"""
import os
import json
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from pathlib import Path

from src.converters.pdf_converter import PDFConverter
from src.converters.docx_converter import DOCXConverter
from src.parser.question_parser import QuestionParser
from src.analyzer.difficulty_analyzer import DifficultyAnalyzer


app = Flask(__name__, template_folder='templates', static_folder='static')

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create directories
Path(UPLOAD_FOLDER).mkdir(exist_ok=True)
Path(OUTPUT_FOLDER).mkdir(exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': '没有文件'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': '未选择文件'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': '不支持的文件格式，请上传 PDF 或 DOCX 文件'}), 400

        # Save file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        return jsonify({
            'success': True,
            'filename': filename,
            'file_path': file_path
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/convert', methods=['POST'])
def convert_to_latex():
    """Convert uploaded file to LaTeX"""
    try:
        data = request.get_json()
        file_path = data.get('file_path')

        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': '文件不存在'}), 400

        # Determine file type
        file_ext = Path(file_path).suffix.lower()

        # Convert to LaTeX
        if file_ext == '.pdf':
            converter = PDFConverter()
            latex_content = converter.convert(file_path)
        elif file_ext == '.docx':
            converter = DOCXConverter()
            latex_content = converter.convert(file_path)
        else:
            return jsonify({'error': '不支持的文件格式'}), 400

        # Save LaTeX file
        output_filename = Path(file_path).stem + '.tex'
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(latex_content)

        # Parse questions
        parser = QuestionParser()
        questions = parser.parse(latex_content)

        return jsonify({
            'success': True,
            'latex_content': latex_content,
            'output_path': output_path,
            'question_count': len(questions),
            'questions': questions
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_questions():
    """Analyze questions for difficulty and keywords"""
    try:
        data = request.get_json()
        questions = data.get('questions', [])
        api_provider = data.get('api_provider', 'deepseek')
        api_key = data.get('api_key', '')

        if not api_key:
            return jsonify({'error': '请提供 API 密钥'}), 400

        if not questions:
            return jsonify({'error': '没有题目需要分析'}), 400

        # Initialize analyzer
        analyzer = DifficultyAnalyzer(api_provider=api_provider, api_key=api_key)

        # Analyze questions
        results = analyzer.analyze_questions(questions)

        return jsonify({
            'success': True,
            'results': results
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download/<filename>')
def download_file(filename):
    """Download output file"""
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename, as_attachment=True)


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    print("=" * 60)
    print("Auto Homework Question Qualifier - Web Interface")
    print("=" * 60)
    print()
    print("服务器启动中...")
    print("访问地址: http://localhost:5000")
    print()
    print("按 Ctrl+C 停止服务器")
    print("=" * 60)

    app.run(host='0.0.0.0', port=5000, debug=True)
