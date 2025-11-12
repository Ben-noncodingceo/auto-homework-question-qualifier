#!/bin/bash
# Quick start script for the web application

echo "========================================"
echo "作业题目质量评估系统 - Web 版"
echo "========================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 未安装"
    exit 1
fi

echo "✓ Python 已安装"

# Install dependencies
echo "检查并安装依赖包..."
pip3 install --quiet Flask PyPDF2 python-docx requests 2>/dev/null || pip3 install --ignore-installed Flask PyPDF2 python-docx requests

if [ $? -eq 0 ]; then
    echo "✓ 依赖包已就绪"
else
    echo "❌ 依赖安装失败，请手动运行："
    echo "   pip3 install Flask PyPDF2 python-docx requests"
    exit 1
fi

echo ""
echo "启动 Web 服务器..."
echo "访问地址: http://localhost:5000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "========================================"
echo ""

python3 app.py
