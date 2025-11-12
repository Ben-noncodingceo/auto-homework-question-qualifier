#!/bin/bash
# Installation script for Auto Homework Question Qualifier

echo "=========================================="
echo "Auto Homework Question Qualifier"
echo "安装脚本"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python 3"
    echo "请先安装 Python 3.7 或更高版本"
    exit 1
fi

# Display Python version
PYTHON_VERSION=$(python3 --version)
echo "✓ 找到 $PYTHON_VERSION"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ 错误: 未找到 pip3"
    echo "请先安装 pip3"
    exit 1
fi

echo "正在安装 Python 依赖包..."
echo ""

# Upgrade pip
echo "1. 升级 pip..."
pip3 install --upgrade pip

echo ""
echo "2. 安装项目依赖..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 依赖安装成功！"
    echo ""
else
    echo ""
    echo "❌ 依赖安装失败"
    echo "请检查网络连接或手动运行: pip3 install -r requirements.txt"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "3. 创建配置文件..."
    cp .env.example .env
    echo "✓ 已创建 .env 文件（从 .env.example 复制）"
    echo ""
    echo "⚠️  重要提示:"
    echo "   请编辑 .env 文件，添加你的 API 密钥"
    echo "   使用文本编辑器打开: nano .env 或 vim .env"
    echo ""
else
    echo "✓ .env 文件已存在"
    echo ""
fi

# Create output directory
if [ ! -d "output" ]; then
    mkdir -p output
    echo "✓ 创建输出目录: output/"
    echo ""
fi

echo "=========================================="
echo "安装完成！"
echo "=========================================="
echo ""
echo "下一步:"
echo "1. 配置 API 密钥: 编辑 .env 文件"
echo "2. 运行程序: python3 main.py <your_file.pdf>"
echo ""
echo "示例:"
echo "  python3 main.py homework.pdf"
echo "  python3 main.py questions.docx"
echo ""
echo "查看帮助:"
echo "  python3 main.py --help"
echo ""
echo "可选: 安装 LaTeX 以启用 PDF 预览"
echo "  macOS:   brew install --cask mactex"
echo "  Ubuntu:  sudo apt-get install texlive-latex-base"
echo ""
