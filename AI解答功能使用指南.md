# AI解答功能使用指南

## 功能概述

小学数学题目生成系统现已集成AI智能解答功能，可以为生成的数学题目提供详细的解题步骤、思路分析和教学指导。

## 系统架构

### 前端组件
- `AIAnalysisComponent`: AI分析结果展示组件
- `ai-service.ts`: AI服务接口
- `question-preview.tsx`: 集成AI分析按钮的题目预览组件

### 后端服务
- MCP服务器扩展，支持AI解答API
- 支持多种AI模型接入（DeepSeek、GPT等）
- 异步任务处理机制

## 快速开始

### 1. 启动MCP服务器

```bash
cd mcp-server
pip install -r requirements.txt
python main.py
```

### 2. 配置AI API

设置环境变量：
```bash
export AI_API_KEY="your-api-key"
export AI_API_BASE="https://api.deepseek.com"  # 或其他AI服务
export AI_MODEL="deepseek-math-7b-instruct"
```

或通过API动态配置：
```bash
curl -X POST http://localhost:8000/ai/config \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "your-api-key",
    "api_base": "https://api.deepseek.com",
    "model": "deepseek-math-7b-instruct"
  }'
```

### 3. 使用AI解答功能

1. 生成数学题目
2. 在题目预览界面点击"显示AI分析"按钮
3. AI将自动分析题目并提供详细解答

## AI分析内容

### 核心分析模块

1. **题目理解** - 分析题目要求和解决的问题
2. **解题思路** - 说明基本解题方法和策略
3. **解题步骤** - 逐步详细的计算过程
4. **关键概念** - 涉及的数学概念和知识点
5. **常见错误** - 学生容易犯的错误
6. **解题技巧** - 有助于解题的方法和技巧
7. **难度分析** - 题目难度等级和原因分析
8. **其他解法** - 替代的解题方法

### 支持的题目类型

- ✅ 基础四则运算
- ✅ 分数运算
- ✅ 小数运算
- ✅ 百分数运算
- ✅ 混合运算
- ✅ 平方根运算
- ✅ 幂运算

## API接口

### 提交AI分析请求
```
POST /ai/analyze
```

请求体：
```json
{
  "question": {
    "expression": "12 + 8 × 3",
    "answer": 36,
    "operation": "mixed_operations",
    "knowledge_point": "mixed_operations_order"
  },
  "language": "zh-CN",
  "detail_level": "standard"
}
```

### 获取分析结果
```
GET /ai/result/{task_id}
```

### 获取AI配置
```
GET /ai/config
```

### 更新AI配置
```
POST /ai/config
```

## 配置选项

### 语言支持
- `zh-CN`: 中文
- `en-US`: 英文

### 详细程度
- `simple`: 简单模式，提供基本解答
- `standard`: 标准模式，提供完整分析
- `detailed`: 详细模式，提供深度解析

### AI模型选择
- `deepseek-math-7b-instruct`: DeepSeek数学专用模型
- `gpt-4`: OpenAI GPT-4
- `gpt-3.5-turbo`: OpenAI GPT-3.5

## 开发指南

### 添加新的AI服务提供商

1. 在`ai-service.ts`中扩展`AIService`类
2. 实现对应的API接口适配
3. 更新配置选项

### 自定义分析模板

修改`mcp-server/main.py`中的`create_analysis_prompt`函数来自定义AI分析提示词模板。

### 扩展分析内容

在`AIAnalysis`接口中添加新的字段，并更新相应的解析逻辑。

## 故障排除

### 常见问题

1. **AI分析失败**
   - 检查API Key是否正确配置
   - 验证网络连接和API服务状态
   - 查看MCP服务器日志

2. **分析结果不完整**
   - 调整`detail_level`参数
   - 检查AI模型的token限制
   - 优化提示词模板

3. **响应速度慢**
   - 调整`timeout`配置
   - 考虑使用更快的AI模型
   - 实现结果缓存机制

### 日志查看

```bash
# MCP服务器日志
docker logs mcp-server

# 前端控制台
# 打开浏览器开发者工具查看
```

## 未来规划

### 即将支持的功能

- [ ] 个性化解题建议
- [ ] 学习路径推荐
- [ ] 错题本集成
- [ ] 多种解法对比
- [ ] 语音解答功能
- [ ] 图形化解题演示

### 性能优化

- [ ] 分析结果缓存
- [ ] 批量分析接口
- [ ] 实时分析流式响应
- [ ] 离线分析能力

## 技术支持

如遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查GitHub Issues
3. 提交新的Issue报告
4. 联系开发团队

---

**注意**: AI解答功能需要配置有效的AI API密钥才能使用。建议在生产环境中使用更稳定的AI服务提供商。