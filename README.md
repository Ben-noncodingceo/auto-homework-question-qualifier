# Auto Homework Question Qualifier

自动作业题目质量评估系统 - 将PDF/DOCX格式的题目转换为LaTeX，并使用AI模型评估题目难度和知识点标签。

## 功能特性

- 📄 **文件转换**: 支持PDF和DOCX格式文件转换为LaTeX
- 👁️ **预览功能**: 生成LaTeX的PDF预览
- 🤖 **AI分析**: 使用DeepSeek或ChatGPT API评估题目难度（1-5分制）
- 🏷️ **知识点标签**: 自动提取3-5个关键知识点标签
- 📊 **批量处理**: 自动识别文件中的多个题目，分别评估

## 系统要求

- Python 3.7+
- （可选）pdflatex - 用于生成PDF预览

## 快速开始（推荐）

### 方法一：自动安装（最简单）

**Linux/macOS:**
```bash
cd auto-homework-question-qualifier
./install.sh
```

**Windows:**
```batch
cd auto-homework-question-qualifier
install.bat
```

安装脚本会自动：
- 检查Python环境
- 安装所有依赖包
- 创建配置文件

### 方法二：使用快速启动脚本

```bash
python3 quick_start.py
```

这个脚本会检查所有依赖并自动安装缺失的包。

## 详细安装步骤

### 1. 下载项目

```bash
git clone <repository-url>
cd auto-homework-question-qualifier
```

或者直接下载ZIP文件并解压。

### 2. 安装Python依赖

**方法1 - 使用 pip3（推荐）:**
```bash
pip3 install -r requirements.txt
```

**方法2 - 使用 pip:**
```bash
pip install -r requirements.txt
```

**方法3 - 使用 python -m pip:**
```bash
python3 -m pip install -r requirements.txt
```

**如果遇到 "ModuleNotFoundError" 错误：**
这说明依赖包没有正确安装。请运行：
```bash
pip3 install python-dotenv PyPDF2 pdfplumber python-docx pylatexenc openai requests Pillow
```

### 3. （可选）安装LaTeX

如果需要生成PDF预览，请安装LaTeX：

**Ubuntu/Debian:**
```bash
sudo apt-get install texlive-latex-base texlive-fonts-recommended
```

**macOS:**
```bash
brew install --cask mactex
```

**Windows:**
下载并安装 [MiKTeX](https://miktex.org/download) 或 [TeX Live](https://www.tug.org/texlive/)

### 4. 配置API密钥

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置你的API密钥：

**使用DeepSeek（推荐）:**
```env
API_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

**使用OpenAI:**
```env
API_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

## 使用方法

### 基本用法

```bash
python main.py <input_file>
```

例如：
```bash
python main.py homework.pdf
python main.py questions.docx
```

### 高级选项

```bash
# 指定输出目录
python main.py homework.pdf -o my_output

# 跳过PDF预览生成
python main.py homework.pdf --no-preview

# 跳过难度分析（仅转换LaTeX）
python main.py homework.pdf --no-analysis

# 指定API提供商
python main.py homework.pdf --api-provider deepseek

# 通过命令行指定API密钥
python main.py homework.pdf --api-key sk-xxxxx
```

### 完整命令行选项

```
usage: main.py [-h] [-o OUTPUT_DIR] [--no-preview] [--no-analysis]
               [--api-provider {openai,deepseek}] [--api-key API_KEY]
               input_file

positional arguments:
  input_file            输入文件 (PDF 或 DOCX)

optional arguments:
  -h, --help            显示帮助信息
  -o OUTPUT_DIR, --output-dir OUTPUT_DIR
                        输出目录 (默认: output)
  --no-preview          跳过LaTeX预览生成
  --no-analysis         跳过难度分析
  --api-provider {openai,deepseek}
                        API提供商 (默认: 从.env读取)
  --api-key API_KEY     API密钥 (默认: 从.env读取)
```

## 输出文件

程序会在输出目录（默认为 `output/`）生成以下文件：

- `output.tex` - 转换后的LaTeX源文件
- `preview.pdf` - LaTeX的PDF预览（如果启用）
- `analysis_results.json` - 难度分析结果（JSON格式）

### 分析结果示例

```json
[
  {
    "question_number": "1",
    "difficulty": 3,
    "keywords": ["函数", "导数", "极值"]
  },
  {
    "question_number": "2",
    "difficulty": 4,
    "keywords": ["积分", "微分方程", "初值问题"]
  }
]
```

## 难度评分标准

- **1分**: 基础概念，直接应用
- **2分**: 简单应用，需要理解基本概念
- **3分**: 中等难度，需要综合运用多个知识点
- **4分**: 较难，需要深入理解和分析
- **5分**: 非常难，需要创新思维和综合能力

## 支持的题目格式

程序会自动识别以下格式的题目编号：

- `1.` 或 `1、`
- `问题1` 或 `题1`
- `Question 1` 或 `Problem 1`
- `(1)` 或 `[1]`

## 项目结构

```
auto-homework-question-qualifier/
├── main.py                     # 主程序入口
├── requirements.txt            # Python依赖
├── .env.example               # 环境变量模板
├── .gitignore                 # Git忽略文件
├── README.md                  # 项目文档
├── src/
│   ├── converters/            # 文件转换模块
│   │   ├── pdf_converter.py   # PDF转LaTeX
│   │   └── docx_converter.py  # DOCX转LaTeX
│   ├── preview/               # 预览模块
│   │   └── latex_preview.py   # LaTeX预览生成
│   ├── parser/                # 解析模块
│   │   └── question_parser.py # 题目解析器
│   └── analyzer/              # 分析模块
│       └── difficulty_analyzer.py # 难度分析器
└── output/                    # 输出目录（自动创建）
```

## 故障排查

### 问题: ModuleNotFoundError: No module named 'dotenv'

这是最常见的问题，说明Python依赖包没有正确安装。

**解决方案1 - 自动修复（推荐）:**
```bash
python3 quick_start.py
```

**解决方案2 - 手动安装:**
```bash
# 使用 pip3
pip3 install -r requirements.txt

# 或者直接安装所有包
pip3 install python-dotenv PyPDF2 pdfplumber python-docx pylatexenc openai requests Pillow
```

**解决方案3 - 检查Python版本:**
```bash
# 确保使用正确的Python版本
python3 --version  # 应该是 3.7+

# 使用对应的pip
python3 -m pip install -r requirements.txt
```

### 问题: PDF预览生成失败

**解决方案**: 确保已安装pdflatex，或使用 `--no-preview` 跳过预览生成

```bash
# 跳过预览
python3 main.py homework.pdf --no-preview
```

### 问题: API调用失败

**解决方案**:
1. 检查 `.env` 文件中的API密钥是否正确
2. 确认API服务可访问
3. 检查网络连接

### 问题: 题目识别不准确

**解决方案**:
1. 确保题目编号使用标准格式（见"支持的题目格式"）
2. 检查原始文件的格式是否清晰
3. 可以手动编辑生成的 `output.tex` 文件

## 示例工作流程

```bash
# 1. 准备题目文件 (homework.pdf)
# 2. 运行程序
python main.py homework.pdf

# 3. 查看结果
cat output/analysis_results.json

# 4. 查看LaTeX源文件
cat output/output.tex

# 5. 查看PDF预览
open output/preview.pdf  # macOS
xdg-open output/preview.pdf  # Linux
```

## 开发

### 运行测试

```bash
# 仅转换LaTeX，不调用API
python main.py test.pdf --no-analysis

# 完整测试
python main.py test.pdf
```

## 许可证

MIT License

## 贡献

欢迎提交问题和Pull Request！

## 联系方式

如有问题或建议，请提交Issue。
