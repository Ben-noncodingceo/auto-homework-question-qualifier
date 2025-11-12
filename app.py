#!/usr/bin/env python3
"""
Flask Web Application for Auto Homework Question Qualifier
"""
import os
import json
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from pathlib import Path

from src.ai_processor import AIProcessor


app = Flask(__name__, template_folder='templates', static_folder='static')

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

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


@app.route('/api/process', methods=['POST'])
def process_pdf():
    """Process PDF file: convert to LaTeX and analyze questions"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': '没有上传文件'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': '未选择文件'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': '只支持 PDF 格式文件'}), 400

        # Get API configuration
        api_provider = request.form.get('api_provider', 'deepseek')
        api_key = request.form.get('api_key', '').strip()

        if not api_key:
            return jsonify({'error': '请提供 API 密钥'}), 400

        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Process PDF with AI
        processor = AIProcessor(api_provider=api_provider, api_key=api_key)

        latex_code, question_analysis = processor.process_pdf(file_path)

        # Save LaTeX file
        latex_filename = Path(filename).stem + '.tex'
        latex_path = os.path.join(app.config['OUTPUT_FOLDER'], latex_filename)

        with open(latex_path, 'w', encoding='utf-8') as f:
            f.write(latex_code)

        # Save analysis results
        results_filename = Path(filename).stem + '_analysis.json'
        results_path = os.path.join(app.config['OUTPUT_FOLDER'], results_filename)

        with open(results_path, 'w', encoding='utf-8') as f:
            json.dump(question_analysis, f, ensure_ascii=False, indent=2)

        return jsonify({
            'success': True,
            'latex_code': latex_code,
            'latex_filename': latex_filename,
            'question_analysis': question_analysis,
            'question_count': len(question_analysis)
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
    import sys

    # Try different ports if 5000 is occupied
    ports_to_try = [5000, 5001, 5002, 8000, 8080]

    print("=" * 60)
    print("作业题目质量评估系统 - Web 界面")
    print("=" * 60)
    print()
    print("功能说明:")
    print("- 支持 10MB 以内的 PDF 文件")
    print("- 自动转换为 LaTeX 代码")
    print("- AI 评估题目难度（0-5分）")
    print("- 提供 5 个知识点标签")
    print("- 自动识别大题和小题")
    print()

    # Find an available port
    port = 5000
    for test_port in ports_to_try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', test_port))
        sock.close()

        if result != 0:  # Port is available
            port = test_port
            break

    print(f"服务器启动中...")
    print(f"访问地址: http://localhost:{port}")
    print()
    print("按 Ctrl+C 停止服务器")
    print("=" * 60)
    print()

    try:
        app.run(host='0.0.0.0', port=port, debug=True)
    except OSError as e:
        if "Address already in use" in str(e):
            print()
            print("=" * 60)
            print("错误: 所有端口都被占用")
            print("=" * 60)
            print()
            print("解决方案:")
            print("1. macOS 用户: 关闭 AirPlay Receiver")
            print("   系统设置 -> 通用 -> 隔空播放与接力 -> 关闭")
            print()
            print("2. 手动指定端口运行:")
            print("   python3 app.py --port 8888")
            print()
            sys.exit(1)
        else:
            raise
