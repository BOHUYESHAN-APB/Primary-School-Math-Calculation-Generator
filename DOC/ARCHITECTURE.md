# Architecture Overview

目标：为新的前后端架构设计提供清晰、可执行的路线图，以便在独立分支上从零开始实现重构。

内容概要：
- 目标与约束
- 高层架构选项（Electron + 本地后端 / 云端直连 / 统一后端）
- 推荐方案与理由
- 模块划分与接口契约
- 开发计划与里程碑

## 目标与约束

1. 提高 AI 题目解析与综合题生成功能的可靠性与可扩展性。
2. 尽量降低对本地复杂进程管理的依赖（例如 MCP）。
3. 支持离线优雅降级和在线增强（根据可用性切换）。
4. 易于维护和 CI/CD 集成。

## 高层架构选项

- 前端 + 本地后端（现有 Electron 架构）
- 前端直连云端 AI（简化本地依赖，增加网络与成本依赖）
- 统一后端服务（REST/WebSocket，集中AI逻辑，前端负责展示与交互）

## 推荐方案

建议先实现统一后端服务（Node/Express 或 FastAPI），后端负责 AI 调用、解析与题目生成功能；前端保持轻量，专注 UI 与导出功能。该方案在可维护性、测试与部署上更容易掌控。

## 模块划分（初稿）

- backend/
  - api/ (REST endpoints)
  - workers/ (AI 调用封装)
  - models/ (解析与生成逻辑)
  - infra/ (启动与配置)
- frontend/
  - components/
  - services/ (与 backend 的接口)
  - pages/

## 接口契约（示例）

POST /api/parse
Body: { text: string }
Response: { problems: [...], metadata: {...} }

POST /api/generate
Body: { config: {...} }
Response: { paper: {...}, answers: [...] }

## 里程碑

1. 定义接口与契约（本文件）
2. 实现后端骨架并提供 mock 接口
3. 前端集成 mock 接口并完成端到端流程
4. 替换 mock 为真实 AI 调用并完善错误处理