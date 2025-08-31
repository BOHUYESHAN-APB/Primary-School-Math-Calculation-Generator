# MCP服务器

数学计算验证服务器，为数学题目生成器提供AI自主验证功能。

## 功能

- 安全的Python代码执行环境
- RESTful API接口
- 支持数学表达式计算
- 异步任务执行

## API接口

### 提交代码执行任务

```
POST /execute

{
  "code": "1+1",
  "timeout": 10
}
```

### 查询执行结果

```
GET /result/{task_id}
```

## 部署

### 使用Docker

```bash
docker build -t mcp-server .
docker run -p 8000:8000 mcp-server
```

### 直接运行

```bash
pip install -r requirements.txt
python main.py
```