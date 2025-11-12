# 作业题目质量评估系统

AI 驱动的 PDF 转 LaTeX 与题目难度分析工具

## 🎉 两个版本可选

### ⭐ 纯前端版（推荐 - 零安装）

**`homework_analyzer.html`** - 双击即用，无需安装任何软件！

- ✅ **零安装**: 不需要 Python、Node.js 或任何软件
- ✅ **双击运行**: 直接在浏览器中打开 HTML 文件
- ✅ **跨平台**: Windows、macOS、Linux 全支持
- ✅ **便携**: 只有一个 HTML 文件（约 30KB）
- ✅ **安全**: 所有处理在浏览器本地完成

**使用方法：**
1. 双击 `homework_analyzer.html`
2. 上传 PDF，输入 API 密钥
3. 点击处理，查看结果！

---

### 🐍 Python 后端版（适合服务器部署）

**`app.py`** - 完整的 Flask Web 应用

- ✅ 适合多用户环境
- ✅ 可部署到服务器
- ✅ 更强大的后端处理

**需要：** Python 3.7+ 和 4 个依赖包

---

## ✨ 功能特色

- 🤖 **AI 驱动**: 使用 DeepSeek 或 ChatGPT API 完成所有处理
- 📄 **PDF 转 LaTeX**: 自动将 PDF 文档转换为 LaTeX 代码
- 📊 **智能分析**: 自动识别大题，忽略小题
- 🎯 **难度评估**: 0-5 分精确难度评分（保留一位小数）
- 🏷️ **知识点标签**: 每题自动提取 5 个关键知识点
- 🌐 **Web 界面**: 简洁美观的浏览器操作界面

## 🚀 快速开始

### 方法一：纯前端版（推荐 - 30秒）

```bash
# 1. 找到文件
homework_analyzer.html

# 2. 双击打开
# 或者拖拽到浏览器窗口

# 3. 开始使用！
```

**就这么简单！无需任何安装！**

### 方法二：Python 后端版（需要安装）

**一键启动：**

**Linux/macOS:**
```bash
./start.sh
```

**Windows:**
```batch
start.bat
```

### 方法二：手动启动

```bash
# 1. 安装依赖
pip3 install Flask PyPDF2 python-docx requests

# 2. 启动服务器
python3 app.py

# 3. 打开浏览器
# 访问 http://localhost:5000
```

## 📖 使用指南

### 1. 启动应用

运行 `./start.sh` (Linux/macOS) 或 `start.bat` (Windows)，或手动运行 `python3 app.py`

### 2. 打开浏览器

访问 `http://localhost:5000`

### 3. 上传 PDF 文件

- 点击或拖拽上传 PDF 文件
- 文件大小限制：10MB

### 4. 配置 API

- 选择 API 提供商（DeepSeek 推荐）
- 输入你的 API 密钥

### 5. 开始处理

点击"开始处理"按钮，等待 30-60 秒

### 6. 查看结果

- **LaTeX 代码**：完整的 LaTeX 文档
- **题目分析**：每道大题的难度和知识点

## 🔑 获取 API 密钥

### DeepSeek（推荐，性价比高）

1. 访问 https://platform.deepseek.com/
2. 注册账号
3. 创建 API 密钥
4. 费用低廉（约 ¥0.001/千tokens）

### OpenAI / ChatGPT

1. 访问 https://platform.openai.com/
2. 注册账号
3. 创建 API 密钥
4. 需要国际支付方式

## 📊 功能详解

### 1. PDF 转 LaTeX

系统使用 AI 模型将 PDF 内容转换为格式良好的 LaTeX 代码：

- 保持原有结构和格式
- 数学公式自动转换为 LaTeX 语法
- 题目编号清晰标记
- 生成完整可编译的 LaTeX 文档

### 2. 难度评估（0-5分）

**评分标准：**
- **0-1分**: 基础概念，直接应用
- **1-2分**: 简单应用，理解基本概念
- **2-3分**: 中等难度，综合运用知识点
- **3-4分**: 较难，需要深入分析
- **4-5分**: 非常难，需要创新思维

**特点：**
- 保留一位小数（如：2.5, 3.8）
- 更精确的难度区分
- 基于题目内容、知识点复杂度、解题思路等多维度评估

### 3. 知识点标签

每道题目自动提取 **5 个**知识点标签：

- 准确描述题目涉及的核心概念
- 便于题库分类和检索
- 帮助学生了解知识点分布

### 4. 大题识别

系统智能识别题目结构：

**识别为大题的格式：**
- `1.`, `2.`, `3.` ...
- `一、`, `二、`, `三、` ...
- `题1`, `题2` ...
- `Question 1`, `Problem 1` ...

**忽略的小题格式：**
- `(1)`, `(2)` ...
- `(a)`, `(b)` ...
- `①`, `②` ...
- `i.`, `ii.` ...

## 📁 项目结构

```
auto-homework-question-qualifier/
├── app.py                      # Flask Web 应用
├── start.sh                    # Linux/macOS 启动脚本
├── start.bat                   # Windows 启动脚本
├── requirements.txt            # 依赖包（仅 4 个）
├── templates/
│   └── index.html             # Web 前端界面
├── src/
│   └── ai_processor.py        # AI 处理核心模块
├── uploads/                   # 上传目录（自动创建）
└── output/                    # 输出目录（自动创建）
```

## 💡 使用技巧

### 1. 节省 API 费用

- 优先使用 DeepSeek（比 OpenAI 便宜 95%）
- 合并多个题目到一个 PDF
- 避免重复处理相同文件

### 2. 提高准确度

- PDF 文件尽量清晰，避免扫描件
- 题目编号使用标准格式
- 数学公式使用标准符号

### 3. 批量处理

- 可以上传包含多道题目的 PDF
- 系统自动识别并分别分析
- 结果统一展示

## 🔧 故障排查

### 问题: 依赖安装失败

```bash
# 升级 pip
pip3 install --upgrade pip

# 重新安装
pip3 install -r requirements.txt
```

### 问题: API 调用失败

**检查项：**
1. API 密钥是否正确
2. 网络连接是否正常
3. API 余额是否充足
4. API 限流是否触发

### 问题: PDF 处理失败

**可能原因：**
1. PDF 是扫描件（建议使用 OCR）
2. PDF 包含非文本内容
3. 文件损坏或加密

## 📄 许可证

MIT License

---

**提示**: 首次使用？只需运行 `./start.sh` 并访问 http://localhost:5000 即可！
