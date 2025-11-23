#!/bin/bash
# Cloudflare Pages 构建脚本
# 这个脚本会在部署时自动运行

echo "开始构建..."

# 创建 public 目录（如果不存在）
mkdir -p public

# 复制 HTML 文件到 public 目录
echo "复制文件到 public 目录..."
cp homework_analyzer.html public/index.html

echo "构建完成！"
echo "输出目录: public/"
