# 快速修复指南

## 问题 1: ModuleNotFoundError: No module named 'PyPDF2'

### 解决方案（选择一种）

**方法 1: 使用 pip3（推荐）**
```bash
pip3 install Flask PyPDF2 python-docx requests
```

**方法 2: 使用 pip**
```bash
pip install Flask PyPDF2 python-docx requests
```

**方法 3: 使用 python3 -m pip**
```bash
python3 -m pip install Flask PyPDF2 python-docx requests
```

**方法 4: 从 requirements.txt 安装**
```bash
pip3 install -r requirements.txt
```

## 问题 2: Port 5000 is in use (端口被占用)

### ✅ 已自动修复！

程序现在会自动尝试以下端口：5000, 5001, 5002, 8000, 8080

如果仍有问题，可以手动关闭 macOS AirPlay：

**macOS 用户:**
1. 打开"系统设置"
2. 进入"通用"
3. 选择"隔空播放与接力"
4. 关闭"隔空播放接收器"

## 完整启动步骤

```bash
# 1. 进入项目目录
cd /Users/sunpeng/Downloads/auto-homework-question-qualifier-second

# 2. 安装依赖（只需运行一次）
pip3 install Flask PyPDF2 python-docx requests

# 3. 启动应用
python3 app.py

# 4. 打开浏览器
# 访问显示的网址（通常是 http://localhost:5001 或类似）
```

## 验证安装

运行以下命令检查依赖是否安装成功：

```bash
python3 -c "import flask, PyPDF2, docx, requests; print('✓ 所有依赖已安装')"
```

如果看到"✓ 所有依赖已安装"，说明一切正常！

## 一键安装脚本

**macOS/Linux:**
```bash
pip3 install Flask==3.0.0 PyPDF2==3.0.1 python-docx==1.1.0 requests==2.31.0
```

**Windows:**
```cmd
pip install Flask==3.0.0 PyPDF2==3.0.1 python-docx==1.1.0 requests==2.31.0
```

## 故障排查

### 如果 pip3 不存在

```bash
# 尝试使用 pip
pip install Flask PyPDF2 python-docx requests
```

### 如果权限被拒绝

```bash
# macOS/Linux
pip3 install --user Flask PyPDF2 python-docx requests

# 或使用 sudo（不推荐）
sudo pip3 install Flask PyPDF2 python-docx requests
```

### 如果网络问题

```bash
# 使用国内镜像
pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple Flask PyPDF2 python-docx requests
```
