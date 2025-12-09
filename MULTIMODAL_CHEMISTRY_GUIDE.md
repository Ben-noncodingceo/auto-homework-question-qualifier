# 多模态化学题目分析指南

## 🧪 功能概述

本系统现已支持**多模态 AI 分析**，特别优化了含有**分子结构图**的有机化学题目处理能力。

### 核心能力

✅ **自动提取图片**：从 PDF/Word 文档中提取 JPEG 和 PNG 格式的图片
✅ **分子结构识别**：识别苯环、官能团、取代基位置等化学结构
✅ **结构化描述**：将分子图转化为文字描述（如"苯环邻位连接甲基和羟基"）
✅ **综合分析**：结合图片和文字进行完整的题目解析
✅ **化学专用标签**：自动生成化学知识点标签（有机化学、取代反应等）

## 🏗️ 技术架构

遵循你提出的三层架构设计：

### 基础层：文档解析与图片提取
```typescript
// PDF 解析器自动提取文字和图片
const documentContent = await DocumentParser.parseDocument(file);
// 返回: { text: string, images: ExtractedImage[] }
```

**支持的图片格式：**
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)

**提取策略：**
1. 扫描 PDF/Word 二进制数据
2. 定位图片标记（JPEG: `FF D8 FF`, PNG: `89 50 4E 47`）
3. 提取完整图片数据
4. Base64 编码并附加 MIME 类型

### 核心层：多模态 AI 分析

使用 **Doubao（豆包）多模态模型** 处理文字 + 图片：

```typescript
// 构建多模态消息
const content = [
  { type: 'text', text: '请分析这道化学题...' },
  { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,...' } }
];
```

**化学专用 Prompt 示例：**

```
你是一个专业的教育专家，擅长识别和分析题目，特别精通化学题目分析。

当分析包含分子结构图的化学题目时，请：
1. 仔细观察图片中的分子结构、化学式、反应方程式等
2. 结构化描述分子特征（如：苯环、官能团位置、取代基等）
3. 识别化学反应类型和机理
4. 提供准确的化学知识点标签（如：有机化学、芳香族化合物、取代反应等）
5. 结合图片和文字进行综合分析

**特别注意（化学题目）：**
如果题目包含分子结构图或化学图示：
1. 详细描述图片中的分子结构（如：苯环上的取代基位置、官能团类型等）
2. 在 analysis 中说明："图片显示了【具体结构描述】，该结构的特点是..."
3. 知识点标签要包含具体的化学概念（如：芳香族化合物、酯化反应、邻位取代等）
4. 对于有机化学题，分析时要说明：
   - 分子的主要骨架结构
   - 关键官能团及其位置
   - 可能的化学反应类型
   - IUPAC命名或常见名称（如适用）
```

### 优化层：未来扩展

系统架构已预留扩展接口，可接入：

- **RDKit**：Python 化学信息学库，用于分子结构验证
- **ChemDoodle**：化学绘图工具，可生成 SMILES 格式
- **专业 OCR**：如阿里云 OCR，处理手写化学式

## 📋 使用方式

### 1. 部署 Worker

确保 Worker 已部署最新代码：

```bash
cd workers
wrangler deploy
```

### 2. 上传含图片的 PDF

前端无需修改，系统自动处理：

```javascript
const formData = new FormData();
formData.append('file', pdfFile); // PDF 包含分子结构图
formData.append('config', JSON.stringify({
  provider: 'doubao',  // 使用 Doubao 多模态模型
  model: 'doubao-pro-32k',
  temperature: 0.3
}));

const response = await fetch(`${API_URL}/api/analyze`, {
  method: 'POST',
  body: formData
});
```

### 3. 查看分析结果

返回数据包含图片数量信息：

```json
{
  "success": true,
  "data": {
    "questions": [...],
    "total_count": 5,
    "document_length": 1523,
    "image_count": 3,           // 提取的图片数量
    "has_multimodal": true      // 是否使用多模态分析
  }
}
```

每道题目的 `analysis` 字段会包含图片描述：

```json
{
  "question_number": "1",
  "subject": "化学",
  "analysis": "图片显示了一个苯环结构，在苯环的1位和2位（邻位）分别连接了一个甲基（-CH3）和一个羟基（-OH）。这是一个典型的邻甲基苯酚结构。该化合物属于芳香族化合物，具有酚类物质的典型性质...",
  "knowledge_tags": [
    "有机化学",
    "芳香族化合物",
    "酚类化合物",
    "邻位取代",
    "苯环结构"
  ],
  "ability_tags": [
    "结构识别",
    "空间想象",
    "化学推理",
    "官能团分析",
    "IUPAC命名"
  ],
  "difficulty": 3.2
}
```

## 🔬 示例场景

### 场景 1：有机化学命名题

**PDF 内容：**
- 文字："请写出下图化合物的 IUPAC 名称"
- 图片：苯环 + 取代基结构图

**系统输出：**
```
analysis: "图片显示了一个苯环，在1位连接羟基(-OH)，2位连接甲基(-CH3)。
根据IUPAC命名规则，羟基为主官能团，编号从1开始，因此该化合物的系统命名为
2-甲基苯酚（2-methylphenol），俗称邻甲酚..."
```

### 场景 2：反应机理题

**PDF 内容：**
- 文字："分析下列反应的机理类型"
- 图片：反应方程式（反应物 → 产物）

**系统输出：**
```
analysis: "从图片可以看出，苯环上的氢原子被硝基(-NO2)取代，这是典型的
芳香烃亲电取代反应。反应机理包括三个步骤：1) 硝酸在硫酸催化下生成硝基正离子
NO2+；2) 硝基正离子进攻苯环的π电子；3) 失去质子得到硝基苯..."
```

### 场景 3：立体化学题

**PDF 内容：**
- 文字："判断下列分子的手性"
- 图片：楔形-虚线式结构图

**系统输出：**
```
analysis: "图片显示该分子含有一个手性碳原子（用楔形键和虚线键表示），
连接四个不同的基团。楔形键指向纸面前方，虚线键指向纸面后方，这是R构型。
该分子具有光学活性，可以使偏振光旋转..."
```

## ⚙️ 配置建议

### AI 模型选择

| 模型 | 适用场景 | 优势 |
|------|---------|------|
| **Doubao Pro 32K** | 复杂有机化学题 | 多模态能力强，结构识别准确 |
| Doubao Lite 32K | 简单化学题 | 速度快，成本低 |
| Doubao Pro 128K | 超长文档 | 支持更多题目批量处理 |

### Temperature 参数

- **0.1-0.3**：结构描述、命名题（需要精确性）
- **0.4-0.6**：机理分析、综合题（需要一定创造性）
- **0.7-1.0**：开放性问题（不推荐用于化学题）

## 🚀 性能优化

### 图片大小限制

- 单个图片：建议 < 2MB
- 总文档大小：< 10MB
- 图片数量：建议 < 20 张/文档

### 批量处理

系统自动将题目分批处理（每批 5 题），避免超时：

```
Found 12 questions
Analyzing questions 1-5...
Analyzing questions 6-10...
Analyzing questions 11-12...
```

### API 调用优化

- 批量分析使用 `max_tokens: 4000`
- 精炼分析使用 `max_tokens: 2000`
- 自动去重提取的图片
- 延迟 500ms 避免速率限制

## 📊 日志监控

部署后，在 Cloudflare Dashboard 查看日志：

```
Processing file: chemistry_homework.pdf (234567 bytes)
Using doubao - doubao-pro-32k (temp: 0.3)
Parsing document...
Extracted 1523 characters and 3 images
📷 Using multimodal analysis (3 images)
Identifying questions...
Document has 3 images
Found 5 questions
Analyzing questions 1-5...
✅ Analysis complete: 5 questions processed
```

## 🐛 故障排查

### 问题 1：图片未提取

**症状：** `image_count: 0` 即使 PDF 包含图片

**原因：**
- 图片是嵌入式矢量图（SVG）而非位图
- 图片格式不支持（如 TIFF、BMP）
- PDF 加密或保护

**解决：**
1. 使用 PDF 编辑器转换图片为 JPEG/PNG
2. 导出为无保护的 PDF
3. 截图重新插入图片

### 问题 2：结构描述不准确

**症状：** AI 描述的分子结构与图片不符

**原因：**
- 图片分辨率太低
- 图片中文字模糊
- 多个结构图重叠

**解决：**
1. 提高 PDF 导出质量（300 DPI 以上）
2. 每个结构图单独显示
3. 使用标准化学绘图软件（ChemDraw）

### 问题 3：分析时间过长

**症状：** 请求超时

**原因：**
- 图片太大（> 5MB）
- 题目太多（> 20 题）
- 图片数量过多（> 10 张）

**解决：**
1. 压缩图片质量
2. 分割文档分批上传
3. 使用 Doubao Lite 模型加速

## 💡 最佳实践

### 1. 文档准备

- ✅ 使用标准化学绘图软件
- ✅ 图片清晰度 ≥ 300 DPI
- ✅ 每题图片独立，不重叠
- ✅ 标注清晰（箭头、标号等）

### 2. 模型选择

- ✅ 化学题首选 **Doubao** 多模态模型
- ✅ Temperature 设置 0.2-0.4
- ⚠️ DeepSeek/Tongyi 不支持多模态

### 3. 结果验证

- ✅ 检查返回的 `image_count` 确认图片提取成功
- ✅ 阅读 `analysis` 中的图片描述部分
- ✅ 验证知识点标签是否包含化学专业术语

## 🔮 未来扩展

### 阶段 1：当前实现 ✅

- [x] PDF/Word 图片提取
- [x] Doubao 多模态 API 集成
- [x] 化学专用 Prompt 优化
- [x] 分子结构文字描述

### 阶段 2：计划中

- [ ] SMILES 格式生成（化学结构标准表示）
- [ ] RDKit 分子验证
- [ ] 手写化学式 OCR
- [ ] 3D 分子模型支持

### 阶段 3：高级功能

- [ ] 化学方程式平衡验证
- [ ] 反应机理步骤可视化
- [ ] 立体异构体自动标注
- [ ] 化学数据库查询（PubChem）

---

## 📞 支持

如有问题或建议，请在 GitHub Issues 中反馈。

**相关文档：**
- [部署指南](DEPLOYMENT_GUIDE.md)
- [快速开始](QUICK_DEPLOY.md)
- [API 文档](README_V2.md)
