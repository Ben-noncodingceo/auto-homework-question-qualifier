# 如何断开 Worker 的 Git 自动部署

## 问题
Worker 的 Git 自动部署失败，错误：
```
Wrangler requires at least Node.js v20.0.0. You are using v18.20.8.
```

## 原因
- Cloudflare 构建环境只有 Node.js v18
- Wrangler v4 需要 Node.js v20+
- 无法在构建环境中升级 Node.js 版本

## 解决方案：禁用 Worker Git 自动部署

### 步骤：

1. **访问 Cloudflare Dashboard**
   - 登录 https://dash.cloudflare.com/
   - 点击 "Workers & Pages"

2. **找到 Worker 项目**
   - 找到 `auto-homework-question-qualifier` (Worker 图标)
   - 点击项目名称

3. **进入 Settings → Build**
   - 点击顶部的 "Settings" 标签
   - 找到 "Build" 部分
   - 会看到 Git repository 连接信息

4. **断开连接**
   - 找到 Git repository 旁边的 "Disconnect" 按钮
   - 点击 "Disconnect"
   - 确认操作

5. **完成**
   - Worker 将不再自动部署
   - 现有的部署保持不变

## 以后如何更新 Worker

当需要更新 Worker 代码时：

```bash
# 1. 进入 workers 目录
cd workers

# 2. 本地测试（可选）
wrangler dev

# 3. 部署到生产环境
wrangler deploy
```

## Pages 仍然自动部署

Pages 的自动部署**保持启用**：
- 推送代码到 GitHub
- Pages 自动更新
- 无需手动操作

## 优点

✅ 避免 Node.js 版本冲突
✅ 更可控的部署流程
✅ Worker 代码更新不频繁，手动部署完全够用
✅ Pages 前端仍然自动部署，保持便利性

---

**完成此步骤后，部署问题即可解决！**
