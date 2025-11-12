@echo off
REM Quick start script for Windows

echo ========================================
echo 作业题目质量评估系统 - Web 版
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Python 未安装
    pause
    exit /b 1
)

echo [√] Python 已安装

REM Install dependencies
echo 检查并安装依赖包...
python -m pip install --quiet Flask PyPDF2 python-docx requests >nul 2>&1
if %errorlevel% neq 0 (
    python -m pip install --ignore-installed Flask PyPDF2 python-docx requests
)

if %errorlevel% equ 0 (
    echo [√] 依赖包已就绪
) else (
    echo [X] 依赖安装失败，请手动运行：
    echo    python -m pip install Flask PyPDF2 python-docx requests
    pause
    exit /b 1
)

echo.
echo 启动 Web 服务器...
echo 访问地址: http://localhost:5000
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

python app.py
pause
