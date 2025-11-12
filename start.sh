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

# Check dependencies
echo "检查依赖包..."
python3 -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "正在安装依赖包..."
    pip3 install -r requirements.txt
fi

echo "✓ 依赖包已就绪"
echo ""
echo "启动 Web 服务器..."
echo "访问地址: http://localhost:5000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "========================================"
echo ""

python3 app.py
