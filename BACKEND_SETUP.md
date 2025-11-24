# Flask 后端版本部署指南

本文档介绍如何在本地或服务器上运行 Flask 后端版本。

## 📋 系统要求

- Python 3.7 或更高版本
- pip (Python 包管理器)
- 10MB 可用磁盘空间

## 🚀 快速开始

### 方法一：一键启动（推荐）

**Linux/macOS:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

脚本会自动：
1. 检查 Python 版本
2. 安装依赖包
3. 创建必要的目录
4. 启动 Flask 服务器

### 方法二：手动启动

#### 1. 安装依赖

```bash
pip3 install -r requirements.txt
```

或者手动安装：
```bash
pip3 install Flask==3.0.0 PyPDF2==3.0.1 python-docx==1.1.0 requests==2.31.0
```

#### 2. 创建必要的目录

```bash
mkdir -p uploads output static
```

#### 3. 启动服务器

```bash
python3 app.py
```

服务器将自动寻找可用端口（5000, 5001, 5002, 8000, 8080）并启动。

#### 4. 访问网页

打开浏览器访问显示的地址，通常是：
```
http://localhost:5000
```

## 📁 项目结构

```
auto-homework-question-qualifier/
├── app.py                      # Flask 主应用
├── requirements.txt            # Python 依赖列表
├── templates/                  # HTML 模板
│   └── index.html             # 前端界面
├── static/                     # 静态文件（如有）
├── src/                        # 源代码目录
│   ├── ai_processor.py        # AI 处理核心
│   ├── analyzer/              # 分析器模块
│   ├── converters/            # 转换器模块
│   ├── parser/                # 解析器模块
│   └── preview/               # 预览模块
├── uploads/                    # 上传文件存储（自动创建）
└── output/                     # 输出文件存储（自动创建）
```

## 🔧 配置说明

### API 配置

本系统支持两种 AI API 提供商：

1. **DeepSeek（推荐）**
   - 网址：https://platform.deepseek.com/
   - 优点：价格便宜，中文支持好
   - 费用：约 ¥0.001/千tokens

2. **OpenAI / ChatGPT**
   - 网址：https://platform.openai.com/
   - 优点：功能强大，响应快
   - 费用：较高，需要国际支付方式

### 端口配置

如果默认端口被占用，应用会自动尝试以下端口：
- 5000（默认）
- 5001
- 5002
- 8000
- 8080

您也可以手动指定端口（需要修改 app.py）。

### 文件大小限制

默认限制：10MB
修改方式：编辑 `app.py` 中的 `MAX_CONTENT_LENGTH` 配置。

```python
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB
```

## 🔍 API 端点说明

### 1. 主页
```
GET /
```
返回 Web 界面（templates/index.html）

### 2. 处理 PDF
```
POST /api/process
```
**请求参数：**
- `file`: PDF 文件（multipart/form-data）
- `api_provider`: API 提供商（'deepseek' 或 'openai'）
- `api_key`: API 密钥

**返回：**
```json
{
  "success": true,
  "latex_code": "LaTeX 代码...",
  "latex_filename": "output.tex",
  "question_analysis": [...],
  "question_count": 5
}
```

### 3. 下载文件
```
GET /api/download/<filename>
```
下载生成的 LaTeX 或 JSON 文件。

### 4. 健康检查
```
GET /health
```
返回服务器状态。

```json
{
  "status": "ok"
}
```

## 🐛 常见问题

### 问题 1: 端口被占用

**错误信息：**
```
Address already in use
```

**解决方案：**
1. macOS 用户关闭 AirPlay Receiver：
   ```
   系统设置 -> 通用 -> 隔空播放与接力 -> 关闭
   ```

2. 或者查找并停止占用端口的程序：
   ```bash
   # macOS/Linux
   lsof -i :5000
   kill -9 <PID>

   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### 问题 2: 依赖安装失败

**错误信息：**
```
ModuleNotFoundError: No module named 'flask'
```

**解决方案：**
```bash
# 升级 pip
pip3 install --upgrade pip

# 重新安装依赖
pip3 install -r requirements.txt

# 如果有权限问题
pip3 install --user -r requirements.txt
```

### 问题 3: PDF 处理失败

**可能原因：**
1. PDF 是扫描件（图片格式）
2. PDF 文件损坏或加密
3. API 密钥无效或余额不足

**解决方案：**
1. 确保 PDF 包含文本内容（非纯图片）
2. 检查 API 密钥是否正确
3. 确认 API 账户有足够余额
4. 查看服务器日志获取详细错误信息

### 问题 4: 前端页面不显示

**解决方案：**
1. 确认 Flask 服务器正在运行
2. 检查控制台是否有错误信息
3. 确认访问的 URL 正确
4. 清除浏览器缓存并刷新

### 问题 5: API 调用超时

**解决方案：**
1. 检查网络连接
2. 确认 API 服务可访问
3. 尝试使用代理（如果在国内使用 OpenAI）
4. 减小 PDF 文件大小

## 🔒 安全建议

1. **不要在代码中硬编码 API 密钥**
   - 使用环境变量
   - 或者让用户在前端输入

2. **生产环境部署**
   - 使用 Gunicorn 或 uWSGI 代替开发服务器
   - 配置 Nginx 反向代理
   - 启用 HTTPS

3. **文件上传安全**
   - 已实施文件类型检查（仅允许 PDF）
   - 已实施文件大小限制（10MB）
   - 使用 `secure_filename` 防止路径遍历

## 📊 性能优化

### 生产环境部署

使用 Gunicorn 运行：

```bash
pip3 install gunicorn

gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

参数说明：
- `-w 4`: 4 个工作进程
- `-b 0.0.0.0:5000`: 绑定到所有网卡的 5000 端口

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 增加超时时间（AI 处理可能需要较长时间）
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # 增加上传文件大小限制
    client_max_body_size 10M;
}
```

## 🧪 测试

### 健康检查

```bash
curl http://localhost:5000/health
```

预期输出：
```json
{"status": "ok"}
```

### 测试 PDF 处理

使用 curl 测试 API：

```bash
curl -X POST http://localhost:5000/api/process \
  -F "file=@example.pdf" \
  -F "api_provider=deepseek" \
  -F "api_key=your-api-key-here"
```

## 📝 日志

应用日志会输出到控制台。在生产环境中，建议配置日志文件：

```python
import logging

logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## 🔄 更新和维护

### 更新依赖

```bash
pip3 install --upgrade -r requirements.txt
```

### 备份数据

定期备份 `uploads/` 和 `output/` 目录中的重要文件。

### 清理临时文件

```bash
# 清理上传文件
rm -rf uploads/*

# 清理输出文件
rm -rf output/*
```

## 📞 获取帮助

如遇到问题，请：
1. 查看本文档的"常见问题"部分
2. 检查服务器日志中的错误信息
3. 在 GitHub Issues 中搜索类似问题
4. 提交新的 Issue 并附上详细的错误信息

## 📄 许可证

MIT License

---

**提示：** 首次使用建议先阅读 [README.md](README.md) 了解项目整体功能。
