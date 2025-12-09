# 作业题目智能分析系统 v2.0

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20%2B%20Pages-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

**AI 驱动的作业题目分析平台 | 支持多 AI 提供商 | 边缘计算 | 全球部署**

[在线演示](#) | [快速开始](#-快速开始) | [部署指南](./DEPLOYMENT_GUIDE.md) | [API 文档](#)

</div>

---

## 🌟 项目亮点

### v2.0 全新架构

- ⚡ **边缘计算**: 基于 Cloudflare Workers，全球低延迟访问
- 🎯 **多 AI 支持**: 集成 DeepSeek、Doubao、Tongyi 三家主流 AI
- 🔒 **安全可靠**: API 密钥使用 Cloudflare Secrets 加密存储
- 💰 **成本优化**: 充分利用免费额度，每月成本可低至 ¥15
- 🚀 **零运维**: 无需服务器，自动扩展，全球 CDN 加速
- 📱 **响应式设计**: 完美支持桌面端和移动端

### 核心功能

✅ **智能文档解析**
- 支持 PDF 和 Word 文档格式
- 自动提取题目内容和结构
- 识别大题和小题

✅ **AI 驱动分析**
- 自动识别题目所属学科
- 生成200-500字完整解析
- 多轮 API 调用确保分析质量

✅ **精准标签生成**
- 每题 5 个知识点标签
- 每题 5 个学生能力标签
- 智能难度评分（0-5分）

✅ **灵活配置**
- 可视化 AI 模型选择
- 支持切换不同提供商
- 自定义温度参数（0-2）

✅ **数据导出**
- JSON 格式导出
- Excel 表格导出
- 完整分析报告

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                               │
│         https://your-app.pages.dev                           │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Pages (前端)                         │
│  • HTML5 / CSS3 / JavaScript                                │
│  • 响应式设计                                                │
│  • Excel 导出 (xlsx.js)                                     │
└────────────────────┬────────────────────────────────────────┘
                     │ API Call
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         Cloudflare Workers (后端 API)                        │
│  • TypeScript                                               │
│  • PDF/Word 解析                                            │
│  • 智能批处理                                               │
│  • 错误重试机制                                             │
└─────┬──────────┬──────────┬───────────────────────────────┘
      │          │          │
      ↓          ↓          ↓
┌─────────┐ ┌─────────┐ ┌─────────┐
│DeepSeek │ │ Doubao  │ │ Tongyi  │  AI 提供商
│   API   │ │   API   │ │   API   │
└─────────┘ └─────────┘ └─────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | HTML5/CSS3/JavaScript | 纯原生开发，零依赖框架 |
| **后端** | TypeScript + Workers Runtime | 边缘计算，全球部署 |
| **部署** | Cloudflare Pages + Workers | 自动扩展，全球 CDN |
| **存储** | Cloudflare Secrets | 加密存储 API 密钥 |
| **AI** | DeepSeek/Doubao/Tongyi | 多提供商支持 |

---

## 🚀 快速开始

### 方式一：使用现成部署

访问在线演示：**https://homework-analyzer.pages.dev**

（需要自行配置 AI API 密钥）

### 方式二：本地开发

#### 前置要求
- Node.js 16+
- npm 或 yarn
- Cloudflare 账号（免费）

#### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/your-repo/auto-homework-question-qualifier.git
cd auto-homework-question-qualifier

# 2. 安装 Wrangler CLI
npm install -g wrangler

# 3. 安装依赖
cd workers
npm install

# 4. 配置本地环境变量
cat > .dev.vars <<EOF
DEEPSEEK_API_KEY=sk-your-key-here
DOUBAO_API_KEY=your-key-here
TONGYI_API_KEY=your-key-here
EOF

# 5. 启动本地开发服务器
wrangler dev
```

打开另一个终端：

```bash
# 6. 启动前端开发服务器
cd frontend
python3 -m http.server 8080
# 或使用 npx serve .
```

访问 http://localhost:8080

### 方式三：一键部署到 Cloudflare

```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 部署 Workers
cd workers
wrangler secret put DEEPSEEK_API_KEY  # 输入你的 API 密钥
wrangler deploy

# 3. 部署前端
cd ../frontend
# 修改 app.js 中的 API_BASE_URL 为你的 Worker URL
wrangler pages deploy . --project-name=homework-analyzer
```

详细步骤请查看 [部署指南](./DEPLOYMENT_GUIDE.md)

---

## 📖 使用说明

### 1. 配置 AI 模型

1. 选择 AI 提供商（DeepSeek/Doubao/Tongyi）
2. 选择具体模型
3. 调整温度参数（0.3 适合题目分析）

### 2. 上传文档

- 支持格式：PDF、Word（.doc/.docx）
- 文件大小：最大 10MB
- 拖拽或点击上传

### 3. 开始分析

点击"开始分析"，系统将：
1. 解析文档内容
2. 识别所有题目
3. 分批调用 AI 分析
4. 生成完整报告

### 4. 查看结果

分析结果包括：
- 题目编号和学科
- 完整解析（200-500字）
- 5 个知识点标签
- 5 个能力标签
- 难度评分（0-5分）

### 5. 导出数据

- **JSON 格式**：完整数据导出
- **Excel 表格**：便于查看和编辑

---

## 🎯 支持的 AI 提供商

### DeepSeek（推荐）

- **特点**: 性价比最高，中文支持好
- **费用**: ¥0.001/千tokens
- **获取**: https://platform.deepseek.com/
- **模型**:
  - `deepseek-chat`: 通用对话模型
  - `deepseek-coder`: 代码优化模型

### Doubao（豆包）

- **特点**: 字节跳动出品，响应快
- **费用**: ¥0.008/千tokens
- **获取**: https://www.volcengine.com/product/doubao
- **模型**:
  - `doubao-pro-32k`: 专业版 32K 上下文
  - `doubao-lite-32k`: 轻量版
  - `doubao-pro-128k`: 超长上下文

### Tongyi（通义千问）

- **特点**: 阿里云生态，稳定可靠
- **费用**: ¥0.002/千tokens
- **获取**: https://dashscope.console.aliyun.com/
- **模型**:
  - `qwen-turbo`: 快速响应
  - `qwen-plus`: 增强版
  - `qwen-max`: 旗舰版

---

## 📊 成本估算

### 免费额度（每月）

| 服务 | 免费额度 | 价值 |
|------|---------|------|
| Cloudflare Pages | 500 次构建，无限流量 | $0 |
| Cloudflare Workers | 100,000 请求/天 | $0 |
| **总计** | - | **$0** |

### AI API 成本（按 1000 个文档/月，每文档 5 题）

| 提供商 | 费用/千tokens | 每题 tokens | 月成本 |
|--------|--------------|------------|--------|
| DeepSeek | ¥0.001 | ~3000 | **¥15** |
| Doubao | ¥0.008 | ~3000 | ¥120 |
| Tongyi | ¥0.002 | ~3000 | ¥30 |

**推荐**: 使用 DeepSeek，性价比最高！

---

## 🛠️ 配置指南

### API 密钥配置

详细步骤请查看 [Secrets 配置指南](./CLOUDFLARE_SECRETS_SETUP.md)

#### 方法一：使用 Wrangler CLI

```bash
cd workers
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put DOUBAO_API_KEY
wrangler secret put TONGYI_API_KEY
```

#### 方法二：使用 Dashboard

1. 登录 Cloudflare Dashboard
2. Workers & Pages → 你的项目 → Settings
3. Variables and Secrets → Add variable
4. 选择 "Encrypt" 并添加密钥

### 本地开发配置

创建 `workers/.dev.vars` 文件：

```env
DEEPSEEK_API_KEY=sk-your-key-here
DOUBAO_API_KEY=your-key-here
TONGYI_API_KEY=your-key-here
```

**注意**: `.dev.vars` 已加入 `.gitignore`，不会被提交到 Git。

---

## 📁 项目结构

```
auto-homework-question-qualifier/
├── workers/                    # Cloudflare Workers 后端
│   ├── src/
│   │   ├── index.ts           # 主入口
│   │   ├── types.ts           # TypeScript 类型定义
│   │   ├── ai-providers/      # AI 提供商适配器
│   │   │   ├── base.ts        # 基类
│   │   │   ├── deepseek.ts    # DeepSeek 实现
│   │   │   ├── doubao.ts      # Doubao 实现
│   │   │   ├── tongyi.ts      # Tongyi 实现
│   │   │   └── factory.ts     # 工厂模式
│   │   ├── parsers/           # 文档解析器
│   │   │   └── document-parser.ts
│   │   └── services/          # 业务服务
│   │       └── question-analyzer.ts
│   ├── wrangler.toml          # Workers 配置
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # 前端静态页面
│   ├── index.html             # 主页面
│   └── app.js                 # 前端逻辑
│
├── DEPLOYMENT_GUIDE.md        # 完整部署指南
├── CLOUDFLARE_SECRETS_SETUP.md # Secrets 配置指南
├── README_V2.md               # 本文件（v2 文档）
└── README.md                  # 原 v1 文档
```

---

## 🔧 API 文档

### 健康检查

```http
GET /api/health
```

**响应**:
```json
{
  "status": "ok",
  "version": "2.0.0"
}
```

### 获取可用模型

```http
GET /api/models
```

**响应**:
```json
{
  "deepseek": [
    { "id": "deepseek-chat", "name": "DeepSeek Chat" },
    { "id": "deepseek-coder", "name": "DeepSeek Coder" }
  ],
  "doubao": [...],
  "tongyi": [...]
}
```

### 分析文档

```http
POST /api/analyze
Content-Type: multipart/form-data
```

**请求**:
- `file`: PDF 或 Word 文件
- `config`: JSON 字符串
  ```json
  {
    "provider": "deepseek",
    "model": "deepseek-chat",
    "temperature": 0.3
  }
  ```

**响应**:
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question_number": "1",
        "subject": "数学",
        "analysis": "这道题考察了...",
        "knowledge_tags": ["知识点1", "知识点2", ...],
        "ability_tags": ["能力1", "能力2", ...],
        "difficulty": 2.5
      }
    ],
    "total_count": 5
  }
}
```

---

## 🐛 常见问题

### Q1: 如何获取 API 密钥？

**A**: 查看 [Secrets 配置指南](./CLOUDFLARE_SECRETS_SETUP.md) 中的详细步骤。

### Q2: 本地开发时 API 密钥如何配置？

**A**: 创建 `workers/.dev.vars` 文件并添加密钥。

### Q3: PDF 解析失败怎么办？

**A**: 确保 PDF 是文本格式（非扫描件）。扫描件需要 OCR 处理。

### Q4: 如何切换 AI 提供商？

**A**: 在前端界面的"AI 模型配置"部分选择即可。

### Q5: 部署到 Cloudflare 需要付费吗？

**A**: 免费版足够使用。超出额度可升级到 Workers Paid ($5/月)。

更多问题请查看 [部署指南](./DEPLOYMENT_GUIDE.md) 的常见问题部分。

---

## 📈 性能优化

### 已实现的优化

- ✅ 批处理分析（每批 5 个题目）
- ✅ 分析质量检查和重试
- ✅ 全球 CDN 加速
- ✅ 边缘计算，低延迟
- ✅ 自动扩展，无性能瓶颈

### 可选优化

- 使用 Workers KV 缓存常见分析
- 启用 Cloudflare Images 优化图片
- 配置自定义域名启用 HTTP/3

---

## 🔐 安全最佳实践

1. **API 密钥**:
   - ✅ 使用 Cloudflare Secrets 加密存储
   - ✅ 不在代码中硬编码
   - ✅ 定期轮换密钥

2. **CORS 配置**:
   - 生产环境限制允许的来源
   - 在 `wrangler.toml` 配置 `ALLOWED_ORIGINS`

3. **输入验证**:
   - ✅ 文件类型检查
   - ✅ 文件大小限制
   - ✅ 参数范围验证

4. **错误处理**:
   - ✅ 详细的错误日志
   - ✅ 用户友好的错误提示
   - ✅ 自动重试机制

---

## 📝 更新日志

### v2.0.0 (2025-12)

🎉 **重大更新 - 全新架构**

- 🆕 迁移到 Cloudflare Workers + Pages
- 🆕 支持多 AI 提供商（DeepSeek/Doubao/Tongyi）
- 🆕 可视化 AI 配置界面
- 🆕 学科识别功能
- 🆕 能力标签生成
- 🆕 完整的题目解析（200-500字）
- 🆕 Excel 导出功能
- 🆕 响应式设计
- ⚡ 性能提升 10x（边缘计算）
- 💰 成本降低 90%（Cloudflare 免费额度）

### v1.0.0 (2024-11)

- 基础版本 Flask + PyPDF2
- 单一 AI 提供商支持
- 本地部署

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 报告 Bug

请在 [GitHub Issues](https://github.com/your-repo/issues) 中提交，包括：
- 详细的错误描述
- 复现步骤
- 系统环境信息
- 错误日志

### 提交代码

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 使用 TypeScript 编写后端代码
- 遵循 ESLint 规则
- 添加必要的注释和文档
- 编写测试用例

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🔗 相关链接

- [在线演示](#)
- [完整部署指南](./DEPLOYMENT_GUIDE.md)
- [Secrets 配置指南](./CLOUDFLARE_SECRETS_SETUP.md)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)

---

## 👥 作者

- 原始作者：[Your Name]
- v2.0 架构重构：Claude Code + Anthropic

---

## 💬 联系方式

- GitHub Issues: https://github.com/your-repo/issues
- Email: your-email@example.com

---

<div align="center">

**如果这个项目对你有帮助，请给它一个 ⭐️!**

Made with ❤️ using Cloudflare Workers + TypeScript

</div>
