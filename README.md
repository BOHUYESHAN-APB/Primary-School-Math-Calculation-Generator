# MathBud（重写中）

本仓库已清空旧实现并开始重写，当前目标是先把「前端 + 后端」架起来：

- 前端：React + Vite（优先支持中文/英文）
- 后端：Node.js（TypeScript）+ Fastify（提供知识点/出题/验题 API）
- 资源：`res/logo.png` 与 `res/open.png` 为品牌资源源文件；前端开发/构建会直接使用 `res/` 作为 Vite 的 public 目录。

## 目录结构

```
.
├─ res/                 # logo / 启动图 / favicon（已保留）
├─ frontend/            # Web 前端
└─ backend/             # API 后端
```

## 本地开发

要求：Node.js >= 18

```bash
npm install
npm run dev
```

- 前端：默认 `http://localhost:5173`
- 后端：默认 `http://localhost:3001`

