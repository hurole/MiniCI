---
title: 设计文档 0001 - 部署执行队列与重试（基于当前实现）
summary: 记录当前 ExecutionQueue 的行为与下一步改进方向，便于团队对齐。
owners:
  - team: backend
reviewers:
  - ops-team
status: draft
date: 2026-01-03
version: 0.1.0
related:
  - code: apps/server/libs/execution-queue.ts
  - code: apps/server/controllers/deployment/index.ts
  - schema: apps/server/prisma/schema.prisma
---

# 设计文档 0001：部署执行队列与重试

## 1. 背景（Context）

当前服务端在启动时会初始化执行队列（`ExecutionQueue.initialize()`），用于从数据库恢复 `status=pending` 的部署任务并按顺序执行流水线。

现有相关事实（来自当前代码）：

- 服务启动入口：`apps/server/app.ts`
- 路由：`/api/deployments`（创建部署后入队）与 `/api/deployments/:id/retry`（复制记录后入队）
- 数据库：SQLite + Prisma，Deployment 存在 `status` 字段（注释标明：pending/running/success/failed/cancelled）
- 队列实现：内存队列 `pendingQueue` + `runningDeployments` Set，并有轮询机制（默认 30 秒）把 DB 中的 pending 任务补进队列

## 2. 目标（Goals）

- [ ] 明确“部署任务”从创建到执行的状态流转与约束
- [ ] 明确重试语义（retry 会创建新 deployment，而不是复用原记录）
- [ ] 降低重复入队/重复执行的风险（幂等与并发边界清晰）
- [ ] 让运维/排障更容易：关键日志点与可观测性清单

## 3. 非目标（Non-goals）

- 不引入外部消息队列（如 Redis/Kafka），仍以当前内存队列 + DB 恢复为基础
- 不在本文直接实现大规模调度/分布式 runner（后续 ADR/设计再做）

## 4. 需求与范围（Requirements & Scope）

### 功能需求

- 创建部署：写入一条 Deployment 记录，初始状态为 `pending`，并加入执行队列
- 重试部署：通过 `/deployments/:id/retry` 创建一条新的 Deployment 记录（复制必要字段），并加入执行队列
- 服务重启恢复：服务启动后能从 DB 找回仍为 `pending` 的任务并继续执行

### 非功能需求

- 可靠性：服务重启不会“丢任务”（pending 的任务能恢复）
- 幂等性：避免同一个 deployment 被重复执行
- 可观测性：能定位某次部署为何失败、何时开始/结束、队列长度

## 5. 方案概览（High-level Design）

当前方案核心链路如下：

1) API 创建 Deployment（status=pending）
2) `ExecutionQueue.addTask(deploymentId, pipelineId)` 入队
3) `ExecutionQueue.processQueue()` 串行消费 `pendingQueue`
4) `executePipeline()` 会读取 Deployment 与关联 Project，获取 `projectDir`，然后创建 `PipelineRunner` 执行
5) 定时轮询：每 30 秒扫描 DB 中的 pending 任务，若不在 `runningDeployments` 集合则补入队列

## 6. 详细设计（Detailed Design）

### 6.1 接口/API 设计

#### 创建部署

- POST `/api/deployments`
- 行为：创建 Deployment 后立即入队

#### 重试部署

- POST `/api/deployments/:id/retry`
- 行为：读取原 deployment -> 创建新 deployment（status=pending）-> 入队
- 语义：重试是“创建一个新的任务实例”，便于保留历史执行记录

### 6.2 数据模型/数据库

Deployment 当前关键字段（见 schema 注释）：

- `status`: pending/running/success/failed/cancelled（目前入队依赖 pending）
- `buildLog`: 执行日志（当前创建时写空字符串）
- `startedAt`/`finishedAt`: 时间标记（目前 created 时 startedAt 默认 now）

建议补齐/明确（文档层面约束，代码后续落地）：

- 状态迁移：
  - `pending` -> `running`（开始执行前）
  - `running` -> `success|failed|cancelled`（结束后）
- 幂等控制：
  - 以 deploymentId 为“单次执行唯一标识”，同一个 deploymentId 不允许重复开始执行

### 6.3 队列/轮询/并发

现状：

- `runningDeployments` 同时承担“已入队/执行中”的去重集合
- `pendingQueue` 为内存 FIFO
- 单实例串行消费（`processQueue` while 循环）
- 轮询间隔常量 30 秒

风险点（需要在文档中明确约束/后续逐步修正）：

- 多实例部署：如果将来启动多个 server 实例，每个实例都可能轮询到同一条 pending 记录并执行（需要 DB 锁/租约/状态原子更新）
- 状态更新缺口：当前 `ExecutionQueue` 代码中没有看到明确把 status 从 pending 改成 running/failed/success 的逻辑（可能在 `PipelineRunner` 内处理；若没有，需要补齐）

建议（不改变整体架构前提）：

- 将轮询间隔改为可配置 env：`EXECUTION_POLL_INTERVAL_MS`（默认 30000）
- 在真正执行前做一次 DB 原子“抢占”：仅当 status=pending 时更新为 running（并记录开始时间）；更新失败则放弃执行

### 6.4 可观测性

最低要求（建议后续落地到代码/日志规范）：

- 日志字段：deploymentId、pipelineId、projectId、projectDir、status
- 队列指标：pendingQueue length、runningDeployments size
- 失败记录：捕获异常 message/stack（避免泄露敏感信息）

### 6.5 安全与权限

当前接口层面需要确认：

- `/api/deployments` 与 `/api/deployments/:id/retry` 是否需要登录/鉴权（取决于 middleware 配置）
- 若需要鉴权：建议限制为有项目权限的用户才能创建/重试部署

## 7. 影响与权衡（Trade-offs）

- 继续采用内存队列：实现简单，但天然不支持多实例并发安全
- DB 轮询恢复：可靠性提升，但会带来额外 DB 查询压力

## 8. 兼容性与迁移（Compatibility & Migration）

- 文档层面不破坏现有 API
- 若引入 status 原子抢占，需要确保旧数据/旧状态兼容（例如对历史 pending 记录仍可恢复）

## 9. 测试计划（Test Plan）

- 集成链路：创建 deployment -> 入队 -> 触发执行（可用假 runner）
- 重启恢复：插入 pending 记录 -> initialize() -> 任务被 addTask
- 重试接口：原记录存在/不存在的分支

## 10. 发布计划（Rollout Plan）

- 先补齐文档 + 最小日志规范
- 再逐步落地：status 原子抢占 + 轮询间隔 env

## 11. 备选方案（Alternatives Considered）

- 引入 Redis 队列（BullMQ 等）：更可靠、支持多实例，但复杂度上升
- 使用 DB 作为队列（表 + 锁/租约）：更可靠，但需要严格的并发控制

## 12. 风险与开放问题（Risks & Open Questions）

- Q1：`PipelineRunner` 是否负责更新 Deployment.status？如果没有，状态机应由谁维护？
- Q2：服务是否计划多实例部署？如果是，必须补齐“抢占执行”机制

## 13. 附录（Appendix）

- 代码：`apps/server/libs/execution-queue.ts`
- 控制器：`apps/server/controllers/deployment/index.ts`
- Schema：`apps/server/prisma/schema.prisma`
