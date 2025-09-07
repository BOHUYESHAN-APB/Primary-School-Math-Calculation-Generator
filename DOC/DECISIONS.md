# Architecture Decisions

记录在重构过程中做出的关键设计决策。

## AD01 — 后端选型

- 选项：Node/Express vs FastAPI
- 决定：选择 FastAPI（Python）或 Node/Express 均可。FastAPI 便于复用现有 Python AI 工具与生态；Node/Express 更利于与前端 TypeScript 对齐。
- 结论：优先使用 FastAPI（若希望复用现有 mcp 代码），否则 Node/Express。

## AD02 — AI 调用策略

- 本地优先：默认调用本地后端（若可用），否则回退到云端 AI。
- 异步任务：长时间生成任务应由后端通过队列/worker 异步执行，并提供任务状态接口。
- 安全与配额：云端调用需在后端统一管理 API Key 与限额。

## AD03 — 数据与序列化格式

- 接口采用 JSON，时间使用 ISO 8601，题目/答案使用明确 schema（见 DOC/ARCH_SCHEMA.md）。
- 辅助使用 Protobuf 可选（在大型并发或跨语言场景）。

## AD04 — 本地降级策略

- 当无网络或无云凭证时，后端提供有限的规则/模板生成能力。
- 前端通过 feature flag 控制显示与提示。

## AD05 — 日志与监控

- 后端应输出结构化日志（JSON），并暴露 /health 与 /metrics 端点。
- 本地开发可写入本地文件或 console；生产环境建议接入集中监控。

## AD06 — 接口契约（快速回顾）

- POST /api/parse -> { text } -> { problems, metadata }
- POST /api/generate -> { config } -> { paper, answers, jobId? }
- GET /api/job/{id} -> { status, result? }

## 记录与变更流程

- 所有重大设计决策记录在本文件，变更需注明作者与日期。

-- 
生成时间：2025-09-07