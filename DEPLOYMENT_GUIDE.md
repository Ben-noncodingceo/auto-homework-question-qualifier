# Cloudflare Pages + Workers 完整部署指南

本文档提供从零开始部署作业题目智能分析系统到 Cloudflare 的完整步骤。

---

## 📋 目录

1. [项目架构](#项目架构)
2. [前置要求](#前置要求)
3. [快速开始](#快速开始)
4. [详细部署步骤](#详细部署步骤)
5. [配置 API 密钥](#配置-api-密钥)
6. [测试验证](#测试验证)
7. [常见问题](#常见问题)
8. [性能优化](#性能优化)

---

## 🏗️ 项目架构

```
┌─────────────────┐
│  Cloudflare     │  前端（静态网页）
│  Pages          │  - HTML/CSS/JavaScript
└────────┬────────┘  - 用户界面
         │
         │ HTTPS
         ↓
┌─────────────────┐
│  Cloudflare     │  后端（API 服务）
│  Workers        │  - 文档解析
└────────┬────────┘  - AI 分析
         │            - 多提供商支持
         │
         ├──────────→ DeepSeek API
         ├──────────→ Doubao API
         └──────────→ Tongyi API
```

### 技术栈

**前端（Cloudflare Pages）**:
- 纯 HTML5/CSS3/JavaScript（无框架依赖）
- 响应式设计
- Excel 导出（xlsx.js）

**后端（Cloudflare Workers）**:
- TypeScript
- Workers Runtime
- 边缘计算（全球 CDN）

---

## 📦 前置要求

### 1. 账号和工具

- [ ] Cloudflare 账号（免费版即可）
- [ ] Git 安装
- [ ] Node.js 16+ 和 npm
- [ ] 至少一个 AI 提供商的 API 密钥

### 2. 获取 API 密钥

选择至少一个 AI 提供商并获取 API 密钥：

| 提供商 | 注册链接 | 费用 |
|--------|---------|------|
| **DeepSeek**（推荐） | https://platform.deepseek.com/ | ¥0.001/千tokens |
| **Doubao** | https://www.volcengine.com/product/doubao | 按量计费 |
| **Tongyi** | https://dashscope.console.aliyun.com/ | 按量计费 |

---

## 🚀 快速开始

### 方法一：一键部署（使用 Wrangler）

```bash
# 1. 克隆仓库
git clone https://github.com/your-repo/auto-homework-question-qualifier.git
cd auto-homework-question-qualifier

# 2. 安装依赖
cd workers
npm install

# 3. 登录 Cloudflare
npm install -g wrangler
wrangler login

# 4. 配置 API 密钥
wrangler secret put DEEPSEEK_API_KEY
# 按提示输入你的 API 密钥

# 5. 部署 Workers
wrangler deploy

# 6. 部署前端（见下文详细步骤）
```

---

## 📝 详细部署步骤

### 步骤 1: 部署 Cloudflare Workers（后端）

#### 1.1 进入 Workers 目录

```bash
cd workers
```

#### 1.2 安装依赖

```bash
npm install
```

#### 1.3 修改配置文件

编辑 `wrangler.toml`，修改项目名称：

```toml
name = "homework-analyzer-api"  # 改成你想要的名称
```

#### 1.4 登录 Cloudflare

```bash
wrangler login
```

浏览器会打开授权页面，点击"Allow"授权。

#### 1.5 配置 Secrets（API 密钥）

**方式一：使用 CLI**

```bash
# DeepSeek（推荐，性价比高）
wrangler secret put DEEPSEEK_API_KEY

# Doubao（可选）
wrangler secret put DOUBAO_API_KEY

# Tongyi（可选）
wrangler secret put TONGYI_API_KEY
```

**方式二：使用 Dashboard**

详见 [CLOUDFLARE_SECRETS_SETUP.md](./CLOUDFLARE_SECRETS_SETUP.md)

#### 1.6 部署 Worker

```bash
wrangler deploy
```

部署成功后，会显示你的 Worker URL：
```
https://homework-analyzer-api.your-subdomain.workers.dev
```

**记下这个 URL，前端配置需要用到！**

---

### 步骤 2: 部署 Cloudflare Pages（前端）

#### 2.1 更新前端 API 地址

编辑 `frontend/app.js`，修改第 2 行：

```javascript
const API_BASE_URL = 'https://your-worker.your-subdomain.workers.dev';
```

改成你在步骤 1.6 获得的 Worker URL。

#### 2.2 方式一：使用 GitHub 自动部署（推荐）

1. **推送代码到 GitHub**

```bash
git add .
git commit -m "Setup Cloudflare deployment"
git push origin main
```

2. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 点击左侧 "Workers & Pages"
   - 点击 "Create application"
   - 选择 "Pages" 标签
   - 点击 "Connect to Git"

3. **连接 GitHub 仓库**
   - 授权 Cloudflare 访问你的 GitHub
   - 选择 `auto-homework-question-qualifier` 仓库
   - 点击 "Begin setup"

4. **配置构建设置**
   ```
   Project name: homework-analyzer
   Production branch: main
   Build command: (留空)
   Build output directory: frontend
   ```

5. **点击 "Save and Deploy"**

部署完成后，你会得到一个 Pages URL：
```
https://homework-analyzer.pages.dev
```

#### 2.3 方式二：使用 Wrangler CLI 部署

```bash
cd frontend
wrangler pages deploy . --project-name=homework-analyzer
```

---

### 步骤 3: 配置自定义域名（可选）

#### 3.1 为 Pages 添加自定义域名

1. 进入 Cloudflare Dashboard -> Workers & Pages
2. 选择你的 Pages 项目
3. 点击 "Custom domains"
4. 点击 "Set up a custom domain"
5. 输入域名并按提示配置 DNS

#### 3.2 为 Worker 添加自定义域名

1. 进入你的 Worker 项目
2. 点击 "Triggers" 标签
3. 点击 "Add route"
4. 配置路由规则（如：`api.yourdomain.com/*`）

---

## 🔐 配置 API 密钥

详细步骤请参考 [CLOUDFLARE_SECRETS_SETUP.md](./CLOUDFLARE_SECRETS_SETUP.md)

### 快速配置（CLI）

```bash
cd workers

# 配置 DeepSeek（推荐）
wrangler secret put DEEPSEEK_API_KEY

# 可选：配置其他提供商
wrangler secret put DOUBAO_API_KEY
wrangler secret put TONGYI_API_KEY

# 查看已配置的 secrets
wrangler secret list
```

### 本地开发配置

创建 `workers/.dev.vars` 文件（不要提交到 Git）：

```bash
DEEPSEEK_API_KEY=sk-your-key-here
DOUBAO_API_KEY=your-key-here
TONGYI_API_KEY=your-key-here
```

---

## 🧪 测试验证

### 1. 测试 Worker API

```bash
# 健康检查
curl https://your-worker.your-subdomain.workers.dev/api/health

# 预期返回
{"status":"ok","version":"2.0.0"}

# 获取可用模型
curl https://your-worker.your-subdomain.workers.dev/api/models
```

### 2. 测试前端页面

访问你的 Pages URL：
```
https://homework-analyzer.pages.dev
```

测试流程：
1. 选择 AI 提供商和模型
2. 上传一个 PDF 或 Word 文档
3. 点击"开始分析"
4. 查看分析结果

### 3. 本地开发测试

**启动 Worker 本地服务器**:
```bash
cd workers
wrangler dev
```
访问 http://localhost:8787

**启动前端本地服务器**:
```bash
cd frontend
python3 -m http.server 8080
# 或使用 npx
npx serve .
```
访问 http://localhost:8080

---

## ⚙️ 配置选项

### Workers 配置 (wrangler.toml)

```toml
name = "homework-analyzer-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# 环境变量
[vars]
ALLOWED_ORIGINS = "https://your-domain.pages.dev"

# 生产环境
[env.production]
name = "homework-analyzer-api-prod"
vars = { ALLOWED_ORIGINS = "https://yourdomain.com" }

# 开发环境
[env.development]
name = "homework-analyzer-api-dev"
vars = { ALLOWED_ORIGINS = "*" }
```

### CORS 配置

Worker 默认允许所有来源的请求。生产环境建议限制：

编辑 `workers/src/index.ts`:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
  // ...
};
```

---

## 🐛 常见问题

### Q1: Worker 部署后报 "API key not configured"

**原因**: Secret 未配置或未重新部署。

**解决方案**:
```bash
wrangler secret put DEEPSEEK_API_KEY
wrangler deploy
```

### Q2: 前端无法连接 Worker API

**原因**: 前端配置的 API 地址不正确。

**解决方案**: 检查 `frontend/app.js` 中的 `API_BASE_URL` 是否正确。

### Q3: PDF 解析失败

**原因**: Worker 的 PDF 解析器是简化版，可能不支持复杂 PDF。

**解决方案**:
- 使用文本型 PDF（非扫描件）
- 或考虑使用 Cloudflare Workers AI 进行 OCR

### Q4: 本地开发时 Secret 未加载

**原因**: 本地开发需要 `.dev.vars` 文件。

**解决方案**: 创建 `workers/.dev.vars` 并添加 API 密钥。

### Q5: 超出 Worker 的免费额度

**免费额度**:
- 每天 100,000 个请求
- CPU 时间：10ms/请求

**解决方案**:
- 升级到 Workers Paid 计划（$5/月）
- 优化代码减少 CPU 时间

---

## 📊 性能优化

### 1. 启用缓存

在 Worker 中添加缓存逻辑：

```typescript
const cache = caches.default;
const cacheKey = new Request(url.toString(), request);
let response = await cache.match(cacheKey);

if (!response) {
  response = await handleRequest(request);
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
}
```

### 2. 使用 KV 存储

对于频繁访问的数据，使用 Workers KV：

```toml
# wrangler.toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

### 3. 批量处理优化

题目分析已经实现批量处理（每批 5 个），可根据需要调整。

### 4. CDN 优化

Cloudflare Pages 自动提供全球 CDN，无需额外配置。

---

## 📈 监控和日志

### 查看 Worker 日志

```bash
wrangler tail
```

### 查看 Dashboard 分析

1. 访问 Cloudflare Dashboard
2. Workers & Pages -> 你的 Worker
3. 点击 "Analytics" 查看请求统计

### 设置告警

1. Workers & Pages -> 你的 Worker
2. Settings -> Alerts
3. 配置错误率或请求量告警

---

## 💰 成本估算

### 免费额度

**Cloudflare Pages**:
- 500 次构建/月
- 无限流量
- 无限请求

**Cloudflare Workers**:
- 100,000 请求/天
- 10ms CPU 时间/请求

### 付费方案

**Workers Paid** ($5/月):
- 10,000,000 请求/月
- 50ms CPU 时间/请求
- 额外请求: $0.50/百万

**预估月成本**（1000 个文档/月）:
- Cloudflare: $0-5
- AI API: $15-120（取决于提供商）

---

## 🔗 相关资源

### 官方文档
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

### AI 提供商文档
- [DeepSeek API](https://platform.deepseek.com/api-docs/)
- [Doubao API](https://www.volcengine.com/docs/82379/1099475)
- [Tongyi API](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)

### 项目文档
- [Secrets 配置指南](./CLOUDFLARE_SECRETS_SETUP.md)
- [本地运行指南](./BACKEND_SETUP.md)

---

## ✅ 部署检查清单

部署前请确认：

**前置准备**:
- [ ] 已注册 Cloudflare 账号
- [ ] 已安装 Node.js 和 npm
- [ ] 已安装 Wrangler CLI
- [ ] 已获取 AI API 密钥

**Worker 部署**:
- [ ] 已修改 `wrangler.toml` 配置
- [ ] 已配置至少一个 AI Secret
- [ ] 已成功部署 Worker
- [ ] 健康检查通过

**Pages 部署**:
- [ ] 已更新前端 API 地址
- [ ] 已部署到 Cloudflare Pages
- [ ] 前端页面可访问
- [ ] 前后端连接正常

**功能测试**:
- [ ] 文档上传功能正常
- [ ] AI 分析功能正常
- [ ] 结果显示正常
- [ ] 导出功能正常

---

## 🎉 完成！

恭喜！你已经成功部署了作业题目智能分析系统到 Cloudflare。

访问你的应用：
```
https://homework-analyzer.pages.dev
```

或你的自定义域名。

如有问题，请查看[常见问题](#常见问题)部分或提交 Issue。
