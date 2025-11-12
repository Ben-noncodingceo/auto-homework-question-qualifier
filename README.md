# Auto Homework Question Qualifier

自动作业题目质量评估系统 - 将PDF/DOCX格式的题目转换为LaTeX，并使用AI模型评估题目难度和知识点标签。

## ✨ 功能特性

- 🌐 **Web 界面**: 友好的浏览器界面，无需命令行操作
- 📄 **文件转换**: 支持PDF和DOCX格式文件转换为LaTeX
- 🤖 **AI分析**: 使用DeepSeek或ChatGPT API评估题目难度（1-5分制）
- 🏷️ **知识点标签**: 自动提取3-5个关键知识点标签
- 📊 **批量处理**: 自动识别文件中的多个题目，分别评估
- 🚀 **轻量级**: 最小化依赖，仅需 4 个 Python 包

## 📦 系统要求

- Python 3.7+
- 仅需 4 个依赖包（Flask, PyPDF2, python-docx, requests）

## 🚀 快速开始（30秒启动）

### 方法一：一键启动（推荐）

**Linux/macOS:**
```bash
cd auto-homework-question-qualifier
./start.sh
```

**Windows:**
```batch
cd auto-homework-question-qualifier
start.bat
```

脚本会自动检查并安装依赖，然后启动 Web 服务器。

### 方法二：手动启动

```bash
# 1. 安装依赖（只需要 4 个包）
pip3 install Flask PyPDF2 python-docx requests

# 2. 启动服务器
python3 app.py
```

### 访问应用

打开浏览器访问：**http://localhost:5000**

## 📖 使用指南

### Web 界面使用步骤

1. **上传文件**
   - 点击上传区域或拖拽 PDF/DOCX 文件
   - 支持的格式：PDF、DOCX
   - 最大文件大小：16MB

2. **转换 LaTeX**
   - 点击"转换为 LaTeX"按钮
   - 系统会自动识别文件中的题目
   - 显示 LaTeX 预览

3. **AI 难度分析**
   - 选择 API 提供商（DeepSeek 或 OpenAI）
   - 输入你的 API 密钥
   - 点击"开始分析"

4. **查看结果**
   - 每道题目显示难度评分（1-5星）
   - 显示 3-5 个知识点关键词标签
   - 结果以卡片形式展示

### 获取 API 密钥

**DeepSeek（推荐，性价比高）:**
1. 访问 https://platform.deepseek.com/
2. 注册账号并获取 API 密钥

**OpenAI:**
1. 访问 https://platform.openai.com/
2. 注册账号并获取 API 密钥

## 📋 安装详解

### 依赖包说明

本项目只需要 4 个轻量级 Python 包：

```
Flask        # Web 框架
PyPDF2       # PDF 文本提取
python-docx  # DOCX 文件处理
requests     # HTTP 请求
```

### 完整安装步骤

```bash
# 1. 克隆或下载项目
git clone <repository-url>
cd auto-homework-question-qualifier

# 2. 安装依赖
pip3 install -r requirements.txt

# 3. 启动应用
python3 app.py
```

### 使用安装脚本

**Linux/macOS:**
```bash
./install.sh
```

**Windows:**
```batch
install.bat
```

## 🎯 难度评分标准

- **⭐ 1分**: 基础概念，直接应用
- **⭐⭐ 2分**: 简单应用，需要理解基本概念
- **⭐⭐⭐ 3分**: 中等难度，需要综合运用多个知识点
- **⭐⭐⭐⭐ 4分**: 较难，需要深入理解和分析
- **⭐⭐⭐⭐⭐ 5分**: 非常难，需要创新思维和综合能力

## 📐 支持的题目格式

程序会自动识别以下格式的题目编号：

- `1.` 或 `1、`
- `问题1` 或 `题1`
- `Question 1` 或 `Problem 1`
- `(1)` 或 `[1]`

## 🗂️ 项目结构

```
auto-homework-question-qualifier/
├── app.py                      # Flask Web 应用
├── start.sh                    # Linux/macOS 启动脚本
├── start.bat                   # Windows 启动脚本
├── requirements.txt            # Python 依赖（仅 4 个）
├── templates/
│   └── index.html             # Web 前端界面
├── src/
│   ├── converters/            # 文件转换模块
│   │   ├── pdf_converter.py   # PDF转LaTeX
│   │   └── docx_converter.py  # DOCX转LaTeX
│   ├── parser/                # 解析模块
│   │   └── question_parser.py # 题目解析器
│   └── analyzer/              # 分析模块
│       └── difficulty_analyzer.py # 难度分析器
├── uploads/                   # 上传文件目录（自动创建）
└── output/                    # 输出文件目录（自动创建）
```

## 🔧 故障排查

### 问题: ModuleNotFoundError

**解决方案:**
```bash
# 安装所有依赖
pip3 install -r requirements.txt

# 或者单独安装
pip3 install Flask PyPDF2 python-docx requests
```

### 问题: 无法访问 Web 界面

**检查项:**
1. 确认服务器已启动：控制台应显示 "Running on http://0.0.0.0:5000"
2. 浏览器访问：http://localhost:5000
3. 检查防火墙设置

### 问题: API 调用失败

**解决方案:**
1. 检查 API 密钥是否正确
2. 确认网络连接正常
3. 验证 API 余额是否充足

### 问题: 文件上传失败

**解决方案:**
1. 检查文件大小（需小于 16MB）
2. 确认文件格式（PDF 或 DOCX）
3. 查看控制台错误信息

## 💡 使用技巧

### 1. 批量处理
Web 界面支持一次上传包含多个题目的文件，系统会自动识别并分析所有题目。

### 2. LaTeX 导出
转换后的 LaTeX 文件保存在 `output/` 目录，可以直接下载使用。

### 3. 节省 API 费用
- 使用 DeepSeek API（比 OpenAI 便宜很多）
- 先转换 LaTeX 查看题目，再决定是否分析
- 可以只上传需要分析的题目

### 4. 离线使用
如果不需要 AI 分析，可以只使用文件转换功能，无需 API 密钥。

## 🌟 特色功能

### 最小化依赖
相比之前的版本，我们精简了依赖包：

**之前**: 8个包（包括 pdfplumber, openai, Pillow, pylatexenc 等）
**现在**: 4个包（Flask, PyPDF2, python-docx, requests）

### Web 界面优势
- ✅ 无需命令行知识
- ✅ 可视化操作流程
- ✅ 实时预览和反馈
- ✅ 美观的卡片式结果展示
- ✅ 支持拖拽上传

### API 集成简化
- 不再需要 OpenAI 官方包
- 直接使用 HTTP 请求
- 支持多种 AI 提供商
- 更容易扩展和调试

## 📸 界面预览

Web 界面包含四个步骤：

1. **上传文件**: 拖拽或点击上传 PDF/DOCX
2. **LaTeX 预览**: 查看转换后的 LaTeX 代码
3. **AI 分析**: 配置 API 并开始分析
4. **结果展示**: 查看每道题的难度和关键词

## 🔐 隐私说明

- 所有文件在本地处理
- 仅题目内容会发送到 AI API 进行分析
- 不会存储或上传你的 API 密钥
- 上传的文件保存在本地 `uploads/` 目录

## 📝 示例工作流程

```bash
# 1. 启动服务器
./start.sh

# 2. 打开浏览器
# 访问 http://localhost:5000

# 3. 上传文件
# 拖拽你的 homework.pdf 到上传区域

# 4. 转换 LaTeX
# 点击"转换为 LaTeX"按钮

# 5. AI 分析
# 输入 API 密钥，点击"开始分析"

# 6. 查看结果
# 每道题显示难度和知识点标签
```

## 🛠️ 开发说明

### 启动开发服务器

```bash
python3 app.py
```

服务器会在 http://localhost:5000 启动，并开启调试模式。

### API 端点

- `GET /` - 主页
- `POST /api/upload` - 文件上传
- `POST /api/convert` - LaTeX 转换
- `POST /api/analyze` - AI 难度分析
- `GET /api/download/<filename>` - 文件下载

## 🤝 贡献

欢迎提交问题和 Pull Request！

## 📄 许可证

MIT License

## 📧 联系方式

如有问题或建议，请提交 Issue。

---

**提示**: 首次使用建议先阅读"快速开始"部分，30秒即可启动应用！
