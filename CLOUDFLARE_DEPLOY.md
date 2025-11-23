# Cloudflare Pages 部署指南

本项目已配置好可直接部署到 Cloudflare Pages。

## 🚀 快速部署步骤

### 方法一：通过 Cloudflare Dashboard 部署（推荐）

1. **登录 Cloudflare**
   - 访问 https://dash.cloudflare.com/
   - 登录你的账号

2. **创建新项目**
   - 点击左侧菜单 "Pages"
   - 点击 "Create a project"
   - 选择 "Connect to Git"

3. **连接 GitHub 仓库**
   - 授权 Cloudflare 访问你的 GitHub
   - 选择此仓库 `auto-homework-question-qualifier`
   - 点击 "Begin setup"

4. **配置构建设置**
   ```
   项目名称: homework-analyzer (或自定义)
   生产分支: main (或你的主分支)
   构建命令: bash build.sh
   构建输出目录: public
   ```

5. **点击 "Save and Deploy"**
   - 等待 1-2 分钟完成部署
   - 部署完成后会得到一个 `*.pages.dev` 域名

6. **访问你的网站**
   - 例如: `https://homework-analyzer.pages.dev`
   - 可在 Cloudflare Dashboard 中配置自定义域名

### 方法二：使用 Wrangler CLI 部署

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 部署项目
wrangler pages deploy public --project-name=homework-analyzer
```

## 📋 项目结构

```
auto-homework-question-qualifier/
├── public/                          # Cloudflare Pages 输出目录
│   ├── index.html                  # 主页面（复制自 homework_analyzer.html）
│   └── _headers                    # HTTP 安全头配置
├── homework_analyzer.html          # 源文件
├── build.sh                        # Cloudflare Pages 构建脚本
├── .node-version                   # Node.js 版本配置
└── CLOUDFLARE_DEPLOY.md           # 部署说明（本文件）
```

## ⚙️ 构建配置说明

### 构建命令
```bash
bash build.sh
```

这个脚本会：
1. 创建 `public` 目录
2. 复制 `homework_analyzer.html` 到 `public/index.html`

### 构建输出目录
```
public
```

### 环境变量
无需配置环境变量，API 密钥由用户在前端页面输入。

## 🔧 自定义配置

### 修改 HTTP 头部
编辑 `public/_headers` 文件来自定义安全头部和缓存策略。

### 添加自定义域名
1. 在 Cloudflare Dashboard 中打开你的 Pages 项目
2. 点击 "Custom domains"
3. 点击 "Set up a custom domain"
4. 输入你的域名并按照提示配置 DNS

## 🐛 常见问题

### 问题 1: 部署后页面空白
**原因**: 可能是构建输出目录配置错误
**解决方案**: 确保构建输出目录设置为 `public`

### 问题 2: API 调用失败
**原因**: 用户输入的 API 密钥有误或网络问题
**解决方案**:
- 检查 API 密钥是否正确
- 确保 API 服务可访问（DeepSeek 或 OpenAI）
- 检查浏览器控制台是否有 CORS 错误

### 问题 3: PDF 处理失败
**原因**: PDF.js CDN 加载失败或 PDF 文件格式问题
**解决方案**:
- 检查网络连接
- 确保 PDF 文件不是扫描件
- 尝试使用不同的 PDF 文件

### 问题 4: 构建失败
**原因**: build.sh 没有执行权限
**解决方案**:
```bash
chmod +x build.sh
git add build.sh
git commit -m "fix: add execute permission to build.sh"
git push
```

## 📊 性能优化

### CDN 缓存
Cloudflare Pages 自动提供全球 CDN 加速，无需额外配置。

### 缓存策略
- HTML 文件: 1小时缓存
- JS/CSS 文件: 1年缓存（如果添加）

## 🔐 安全配置

### HTTP 安全头部
已在 `public/_headers` 中配置：
- `X-Frame-Options: DENY` - 防止点击劫持
- `X-Content-Type-Options: nosniff` - 防止 MIME 类型嗅探
- `Referrer-Policy: strict-origin-when-cross-origin` - 控制 Referrer 信息
- `Permissions-Policy` - 限制浏览器功能权限

### API 密钥安全
- ✅ API 密钥由用户在浏览器中输入
- ✅ 不会存储在服务器或代码中
- ✅ 仅在浏览器本地使用
- ⚠️ 提醒用户不要在公共电脑上使用或分享 API 密钥

## 🌐 访问限制

如需限制访问（例如仅允许特定 IP 访问）：
1. 在 Cloudflare Dashboard 中配置 Access 规则
2. 或使用 Cloudflare Workers 添加认证逻辑

## 📞 支持

- Cloudflare Pages 文档: https://developers.cloudflare.com/pages/
- Cloudflare Community: https://community.cloudflare.com/

## 🎉 部署成功后

访问你的网站，你应该能看到：
- 📚 作业题目质量评估系统界面
- 📤 PDF 文件上传功能
- 🔑 API 配置选项
- 📊 题目分析和结果展示

**恭喜！你的项目已成功部署到 Cloudflare Pages！**
