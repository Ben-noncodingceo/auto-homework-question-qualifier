# Cloudflare Pages 部署问题修复指南

## 🐛 问题说明

Cloudflare Pages 在尝试运行 `npx wrangler deploy`，这是错误的。Pages 应该只托管静态文件，不需要构建过程。

## ✅ 解决方案

### 方法一：通过 Cloudflare Dashboard 修改配置（推荐）

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 点击 "Workers & Pages"
   - 找到你的项目 `auto-homework-question-qualifier`

2. **修改构建配置**
   - 点击项目名称
   - 点击 "Settings" 标签
   - 找到 "Build & deployments" 部分
   - 点击 "Edit configuration"

3. **设置正确的配置**
   ```
   Framework preset: None
   Build command: (留空或填写: bash build-pages.sh)
   Build output directory: public
   Root directory: (留空，使用根目录)
   Environment variables: (不需要)
   ```

4. **保存并重新部署**
   - 点击 "Save"
   - 回到 "Deployments" 标签
   - 点击 "Retry deployment" 或者推送新的代码触发部署

### 方法二：删除项目重新创建

如果方法一不行，可以删除 Pages 项目重新创建：

1. **删除现有项目**
   - Cloudflare Dashboard -> Workers & Pages
   - 找到 `auto-homework-question-qualifier`
   - Settings -> 滚动到底部 -> Delete project

2. **重新创建项目**
   - 点击 "Create application"
   - 选择 "Pages" 标签
   - 选择 "Connect to Git"
   - 选择你的 GitHub 仓库

3. **配置构建设置**
   ```
   Project name: auto-homework-question-qualifier
   Production branch: main
   Build command: (留空)
   Build output directory: public
   ```

4. **点击 "Save and Deploy"**

## 📝 已修复的内容

我已经修复了以下文件：

### 1. ✅ 前端 API URL
- **文件**: `frontend/app.js`
- **修改**:
  ```javascript
  const API_BASE_URL = 'https://auto-homework-question-qualifier.peungsun.workers.dev';
  ```

### 2. ✅ 更新 public 目录
- 复制了 `frontend/` 的最新文件到 `public/`
- 确保 Pages 部署的是正确的文件

### 3. ✅ 创建构建脚本
- **文件**: `build-pages.sh`
- **说明**: 这是一个空操作脚本，因为静态站点不需要构建

### 4. ✅ CORS 配置
- **文件**: `public/_headers`
- **说明**: 添加了 CORS 头部以允许 Pages 调用 Worker API

## 🧪 验证部署

部署成功后：

1. **访问前端**
   ```
   https://auto-homework-question-qualifier.pages.dev
   ```

2. **测试功能**
   - 打开浏览器开发者工具（F12）
   - 上传一个测试文档
   - 查看 Network 标签，确认 API 调用成功

3. **检查 API 连接**
   - 打开浏览器控制台
   - 应该能看到 API 请求发送到：
     ```
     https://auto-homework-question-qualifier.peungsun.workers.dev/api/analyze
     ```

## 🔧 如果仍然失败

### 检查项 1: 验证文件是否正确
```bash
# 在本地检查 public 目录
ls -la public/
# 应该看到：
# index.html
# app.js
# _headers
```

### 检查项 2: 验证 API URL
```bash
# 打开 public/app.js，检查第 2 行
cat public/app.js | head -5
# 应该看到：
# const API_BASE_URL = 'https://auto-homework-question-qualifier.peungsun.workers.dev';
```

### 检查项 3: 手动部署
```bash
cd public
npx wrangler pages deploy . --project-name=auto-homework-question-qualifier
```

## 📊 完整的部署架构

```
┌─────────────────────────────────────────┐
│   用户浏览器                              │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  Cloudflare Pages                       │
│  https://auto-homework-question-        │
│         qualifier.pages.dev             │
│                                         │
│  静态文件:                               │
│  - index.html                           │
│  - app.js                               │
│  - _headers                             │
└────────────┬────────────────────────────┘
             │ API Call
             ↓
┌─────────────────────────────────────────┐
│  Cloudflare Workers                     │
│  https://auto-homework-question-        │
│         qualifier.peungsun.workers.dev  │
│                                         │
│  端点:                                   │
│  - GET  /api/health                     │
│  - GET  /api/models                     │
│  - POST /api/analyze                    │
└────────────┬────────────────────────────┘
             │
             ↓
      AI Providers (DeepSeek/Doubao/Tongyi)
```

## ❓ 常见错误

### 错误 1: "Wrangler requires at least Node.js v20.0.0"

**原因**: Pages 配置中有错误的构建命令。

**解决**: 按照上面的步骤清空构建命令或使用 `build-pages.sh`。

### 错误 2: "CORS error when calling API"

**原因**: Worker 或 Pages 的 CORS 配置不正确。

**解决**:
- Worker 已配置 CORS（`Access-Control-Allow-Origin: *`）
- 检查浏览器控制台的具体错误信息

### 错误 3: "API returns 404"

**原因**: API URL 配置错误。

**解决**: 确认 `public/app.js` 中的 URL 是：
```javascript
const API_BASE_URL = 'https://auto-homework-question-qualifier.peungsun.workers.dev';
```

## 📞 需要帮助？

如果按照以上步骤仍然无法解决：

1. 检查 Cloudflare Pages 的构建日志
2. 检查浏览器开发者工具的 Console 和 Network 标签
3. 提供错误日志截图

## ✅ 成功标志

部署成功后，你应该能够：

- ✅ 访问 `https://auto-homework-question-qualifier.pages.dev`
- ✅ 看到完整的 UI 界面
- ✅ 上传 PDF/Word 文档
- ✅ 选择 AI 模型
- ✅ 成功分析并显示结果
- ✅ 导出 JSON/Excel 文件

---

**最后推送时间**: 已将所有修复提交到 Git
**分支**: claude/fix-cloudflare-deployment-01L8F7cz95bxy9DG4drFTx53
