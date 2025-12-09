# Cloudflare Workers Secrets 配置指南

本文档详细说明如何在 Cloudflare Workers 中配置 API 密钥（Secrets）。

## 📋 前置要求

1. 已注册 Cloudflare 账号
2. 已安装 Wrangler CLI（Cloudflare 官方工具）
3. 已获取各 AI 提供商的 API 密钥

---

## 🔐 支持的 AI 提供商

本系统支持以下三家 AI 提供商，需要配置对应的 API 密钥：

### 1. DeepSeek（深度求索）
- **官网**: https://platform.deepseek.com/
- **获取密钥**: 注册后访问 API Keys 页面创建
- **Secret 名称**: `DEEPSEEK_API_KEY`
- **费用**: 约 ¥0.001/千tokens（性价比高）

### 2. Doubao（豆包 - 字节跳动火山引擎）
- **官网**: https://www.volcengine.com/product/doubao
- **获取密钥**: 注册火山引擎账号，开通豆包服务
- **Secret 名称**: `DOUBAO_API_KEY`
- **费用**: 按量计费，具体见官网

### 3. Tongyi（通义千问 - 阿里云）
- **官网**: https://help.aliyun.com/zh/dashscope/
- **获取密钥**: 阿里云控制台 -> DashScope -> API Key
- **Secret 名称**: `TONGYI_API_KEY`
- **费用**: 按量计费，具体见官网

---

## 🛠️ 方法一：使用 Wrangler CLI 配置（推荐）

### 步骤 1: 安装 Wrangler CLI

```bash
# 使用 npm 安装
npm install -g wrangler

# 或使用 yarn
yarn global add wrangler
```

### 步骤 2: 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，授权 Wrangler 访问你的 Cloudflare 账号。

### 步骤 3: 进入项目目录

```bash
cd /path/to/auto-homework-question-qualifier/workers
```

### 步骤 4: 配置 Secrets

为每个 AI 提供商配置 API 密钥：

#### DeepSeek API Key
```bash
wrangler secret put DEEPSEEK_API_KEY
```
系统会提示你输入密钥，粘贴后按回车。

#### Doubao API Key
```bash
wrangler secret put DOUBAO_API_KEY
```

#### Tongyi API Key
```bash
wrangler secret put TONGYI_API_KEY
```

### 步骤 5: 验证配置

```bash
# 列出所有 secrets（只显示名称，不显示值）
wrangler secret list
```

你应该看到：
```
DEEPSEEK_API_KEY
DOUBAO_API_KEY
TONGYI_API_KEY
```

---

## 🌐 方法二：使用 Cloudflare Dashboard 配置

### 步骤 1: 访问 Cloudflare Dashboard

1. 登录 https://dash.cloudflare.com/
2. 点击左侧菜单 "Workers & Pages"
3. 选择你的 Worker 项目（例如：`homework-analyzer-api`）

### 步骤 2: 进入设置页面

1. 点击项目名称进入详情页
2. 点击 "Settings" 标签
3. 找到 "Variables and Secrets" 部分

### 步骤 3: 添加 Secrets

1. 点击 "Add variable" 按钮
2. 选择 "Encrypt"（加密类型）
3. 添加每个 Secret：

#### DeepSeek
- **Variable name**: `DEEPSEEK_API_KEY`
- **Value**: 你的 DeepSeek API 密钥
- 点击 "Encrypt and save"

#### Doubao
- **Variable name**: `DOUBAO_API_KEY`
- **Value**: 你的 Doubao API 密钥
- 点击 "Encrypt and save"

#### Tongyi
- **Variable name**: `TONGYI_API_KEY`
- **Value**: 你的 Tongyi API 密钥
- 点击 "Encrypt and save"

### 步骤 4: 保存并部署

点击页面底部的 "Save and Deploy" 按钮。

---

## 🔄 更新 Secret

### 使用 CLI
```bash
# 更新某个 secret（会提示输入新值）
wrangler secret put DEEPSEEK_API_KEY
```

### 使用 Dashboard
1. 进入 Workers & Pages -> 你的项目 -> Settings -> Variables and Secrets
2. 找到要更新的 Secret
3. 点击 "Edit" 按钮
4. 输入新值并保存

---

## 🗑️ 删除 Secret

### 使用 CLI
```bash
wrangler secret delete DEEPSEEK_API_KEY
```

### 使用 Dashboard
1. 进入 Variables and Secrets 页面
2. 找到要删除的 Secret
3. 点击 "Delete" 按钮
4. 确认删除

---

## 🔍 查看 Secrets

### 查看所有 Secrets（仅名称）
```bash
wrangler secret list
```

**注意**: 出于安全考虑，Cloudflare 不允许查看 Secret 的实际值。如果需要确认值是否正确，建议重新设置。

---

## 🧪 测试 API 密钥配置

### 方法 1: 本地测试

```bash
cd workers

# 设置本地环境变量（仅用于测试）
export DEEPSEEK_API_KEY="your-key-here"
export DOUBAO_API_KEY="your-key-here"
export TONGYI_API_KEY="your-key-here"

# 启动本地开发服务器
wrangler dev
```

访问 `http://localhost:8787/api/health` 测试是否正常。

### 方法 2: 生产环境测试

部署后访问你的 Worker URL：

```bash
curl https://your-worker.your-subdomain.workers.dev/api/health
```

应该返回：
```json
{
  "status": "ok",
  "version": "2.0.0"
}
```

---

## ⚠️ 安全最佳实践

### 1. 不要在代码中硬编码密钥
❌ **错误做法**:
```javascript
const apiKey = 'sk-1234567890abcdef'; // 永远不要这样做！
```

✅ **正确做法**:
```javascript
const apiKey = env.DEEPSEEK_API_KEY; // 从环境变量读取
```

### 2. 不要将密钥提交到 Git
确保 `.env` 文件在 `.gitignore` 中：
```gitignore
.env
.dev.vars
*.env.local
```

### 3. 定期轮换密钥
建议每 3-6 个月更换一次 API 密钥。

### 4. 最小权限原则
如果 AI 提供商支持权限控制，只授予必要的权限。

### 5. 监控使用量
在各 AI 提供商的控制台设置用量告警，防止滥用。

---

## 🐛 常见问题

### Q1: Secret 设置后 Worker 仍然报错 "API key not configured"

**原因**: Secret 设置后需要重新部署 Worker。

**解决方案**:
```bash
wrangler deploy
```

### Q2: 本地开发时如何使用 Secrets？

**解决方案**: 创建 `.dev.vars` 文件（Wrangler 会自动读取）：

```bash
# .dev.vars
DEEPSEEK_API_KEY=sk-your-key-here
DOUBAO_API_KEY=your-key-here
TONGYI_API_KEY=your-key-here
```

**注意**: `.dev.vars` 文件应该加入 `.gitignore`！

### Q3: 如何在不同环境使用不同的密钥？

Cloudflare Workers 支持环境配置。在 `wrangler.toml` 中配置：

```toml
[env.production]
name = "homework-analyzer-api-prod"

[env.development]
name = "homework-analyzer-api-dev"
```

为每个环境设置不同的 Secret：
```bash
# 生产环境
wrangler secret put DEEPSEEK_API_KEY --env production

# 开发环境
wrangler secret put DEEPSEEK_API_KEY --env development
```

### Q4: Secret 的值可以包含特殊字符吗？

**答案**: 可以。Secret 值会被完整保存，包括特殊字符。

### Q5: 忘记了 Secret 的值怎么办？

**答案**: Cloudflare 不允许查看 Secret 的值。如果忘记了，需要从 AI 提供商处重新生成并更新。

---

## 📊 成本估算

假设每月处理 1000 个文档，每个文档 5 道题：

| 提供商 | 每道题 Tokens | 单价（元/千tokens） | 月成本估算 |
|--------|--------------|-------------------|-----------|
| DeepSeek | ~3000 | 0.001 | ~15元 |
| Doubao | ~3000 | 0.008 | ~120元 |
| Tongyi | ~3000 | 0.002 | ~30元 |

**建议**: 优先使用 DeepSeek，性价比最高。

---

## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Workers Secrets 管理](https://developers.cloudflare.com/workers/configuration/secrets/)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [Doubao API 文档](https://www.volcengine.com/docs/82379/1099475)
- [Tongyi API 文档](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)

---

## ✅ 配置检查清单

在部署前，请确认以下事项：

- [ ] 已安装 Wrangler CLI
- [ ] 已登录 Cloudflare 账号 (`wrangler login`)
- [ ] 已获取至少一个 AI 提供商的 API 密钥
- [ ] 已使用 `wrangler secret put` 配置所需的密钥
- [ ] 已验证 Secret 列表 (`wrangler secret list`)
- [ ] 已测试 Worker 健康检查端点
- [ ] `.dev.vars` 已加入 `.gitignore`
- [ ] 生产环境已设置用量告警

---

**提示**: 如果只使用一个 AI 提供商，只需配置对应的一个 Secret 即可。前端界面会根据配置的 Secret 自动启用相应的提供商选项。
