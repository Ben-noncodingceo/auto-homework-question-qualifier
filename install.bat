@echo off
REM Installation script for Windows

echo ==========================================
echo Auto Homework Question Qualifier
echo 安装脚本 (Windows)
echo ==========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] 错误: 未找到 Python
    echo 请先安装 Python 3.7 或更高版本
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [√] 找到 Python
python --version
echo.

echo 正在安装 Python 依赖包...
echo.

echo 1. 升级 pip...
python -m pip install --upgrade pip
echo.

echo 2. 安装项目依赖...
python -m pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo.
    echo [X] 依赖安装失败
    echo 请检查网络连接或手动运行: python -m pip install -r requirements.txt
    pause
    exit /b 1
)

echo.
echo [√] 依赖安装成功！
echo.

REM Check if .env file exists
if not exist ".env" (
    echo 3. 创建配置文件...
    copy .env.example .env >nul
    echo [√] 已创建 .env 文件（从 .env.example 复制）
    echo.
    echo [!] 重要提示:
    echo     请编辑 .env 文件，添加你的 API 密钥
    echo     使用记事本打开: notepad .env
    echo.
) else (
    echo [√] .env 文件已存在
    echo.
)

REM Create output directory
if not exist "output" (
    mkdir output
    echo [√] 创建输出目录: output\
    echo.
)

echo ==========================================
echo 安装完成！
echo ==========================================
echo.
echo 下一步:
echo 1. 配置 API 密钥: 编辑 .env 文件 (notepad .env)
echo 2. 运行程序: python main.py ^<your_file.pdf^>
echo.
echo 示例:
echo   python main.py homework.pdf
echo   python main.py questions.docx
echo.
echo 查看帮助:
echo   python main.py --help
echo.
echo 可选: 安装 LaTeX 以启用 PDF 预览
echo   下载地址: https://miktex.org/download
echo.
pause
