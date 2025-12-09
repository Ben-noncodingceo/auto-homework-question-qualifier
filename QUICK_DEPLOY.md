# 快速部署指南（5 分钟完成）

本文档提供最快速的部署步骤。详细说明请查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🚀 部署步骤

### 步骤 1: 安装 Wrangler（1 分钟）

```bash
npm install -g wrangler
```

### 步骤 2: 部署 Workers 后端（2 分钟）

```bash
cd workers

# 登录 Cloudflare
wrangler login

# 配置 API 密钥（至少配置一个）
wrangler secret put DEEPSEEK_API_KEY
# 输入你的 DeepSeek API 密钥（推荐：https://platform.deepseek.com/）

# 部署
wrangler deploy
```

部署成功后会显示 Worker URL，例如：
```
https://homework-analyzer-api.your-subdomain.workers.dev
```

**记下这个 URL！**

### 步骤 3: 部署 Pages 前端（2 分钟）

```bash
cd ../frontend

# 1. 修改 app.js 第 2 行
# 将 API_BASE_URL 改为步骤 2 得到的 Worker URL

# 2. 部署到 Pages
wrangler pages deploy . --project-name=homework-analyzer
```

部署成功后会显示 Pages URL，例如：
```
https://homework-analyzer.pages.dev
```

### 完成！🎉

访问你的 Pages URL 即可使用系统！

---

## 🔑 获取 API 密钥

### DeepSeek（推荐，性价比最高）

1. 访问 https://platform.deepseek.com/
2. 注册并登录
3. 点击右上角头像 → API Keys
4. 创建新密钥
5. 复制密钥（格式：`sk-...`）

**费用**: 约 ¥0.001/千tokens（1000 个文档约 ¥15/月）

### Doubao（可选）

1. 访问 https://www.volcengine.com/product/doubao
2. 注册火山引擎账号
3. 开通豆包服务
4. 获取 API Key

### Tongyi（可选）

1. 访问 https://dashscope.console.aliyun.com/
2. 登录阿里云账号
3. 开通 DashScope 服务
4. 获取 API-KEY

---

## 🧪 测试

### 测试 Worker
```bash
curl https://your-worker.your-subdomain.workers.dev/api/health
```

应该返回：
```json
{"status":"ok","version":"2.0.0"}
```

### 测试前端

访问你的 Pages URL，上传一个 PDF 文件测试。

---

## 🐛 遇到问题？

### Worker 部署失败
```bash
# 重新登录
wrangler logout
wrangler login

# 重新部署
wrangler deploy
```

### Secret 未生效
```bash
# 重新设置 Secret
wrangler secret put DEEPSEEK_API_KEY

# 重新部署
wrangler deploy
```

### 前端无法连接 Worker
- 检查 `frontend/app.js` 中的 `API_BASE_URL` 是否正确
- 确保 Worker URL 以 `https://` 开头

---

## 📖 更多信息

- **完整部署指南**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Secrets 配置**: [CLOUDFLARE_SECRETS_SETUP.md](./CLOUDFLARE_SECRETS_SETUP.md)
- **项目文档**: [README_V2.md](./README_V2.md)

---

## 💡 提示

1. **免费额度**: Cloudflare Workers 每天 100,000 请求免费，足够使用
2. **推荐配置**: 只使用 DeepSeek，性价比最高
3. **本地测试**: 创建 `workers/.dev.vars` 文件配置本地环境变量
4. **自定义域名**: 可在 Cloudflare Dashboard 配置自定义域名

---

**总用时**: 约 5 分钟
**总成本**: Cloudflare 免费 + AI API 约 ¥15/月（DeepSeek）
