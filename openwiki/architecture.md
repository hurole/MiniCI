---
type: '参考'
title: '系统架构与设计'
openwiki_generated: true
verified:
  - by: openwiki/0.6.1
    at: 2026-10-01T08:53:56.886Z
sources:
  - id: openwiki-source-553a2057799da6ed2743bc4e
    resource: repo://apps/server/app.ts
generated: { by: 'antigravity', at: '2026-10-01T08:53:56.886Z' }
---

# 系统架构与设计

MiniCI 采用 **pnpm Workspaces Monorepo** 结构，将前端（`apps/web`）与后端（`apps/server`）置于同一仓库中协同管理，通过共享的工程规范、统一的依赖版本与自动化脚本实现高效的全栈开发体验。

## 整体架构概览

```
┌────────────────────────────────────────────────────────┐
│                      用户浏览器                         │
│   React 19 SPA (Rsbuild + Arco Design + Tailwind)      │
│            React Router v7 / Zustand Store              │
└───────────────────────┬────────────────────────────────┘
                        │ HTTP REST API
                        ▼
┌────────────────────────────────────────────────────────┐
│                  Koa 2 HTTP 服务端                      │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Middleware │→ │  Controller  │→ │  Service/Lib  │  │
│  │ (cors/auth │  │ (TC39 路由   │  │ (Git/Queue/   │  │
│  │ /session…) │  │  装饰器)     │  │  Gitea/Prisma)│  │
│  └────────────┘  └──────────────┘  └───────┬───────┘  │
└──────────────────────────────────────────────┼─────────┘
                                               │
                        ┌──────────────────────┤
                        │                      │
                        ▼                      ▼
               ┌─────────────────┐   ┌──────────────────┐
               │  SQLite (Prisma)│   │  外部 Gitea 实例  │
               │  dev.db         │   │  OAuth2 / API     │
               └─────────────────┘   └──────────────────┘
```

## 前后端分工

| 层面         | 应用               | 职责                                    |
| ------------ | ------------------ | --------------------------------------- |
| **展示层**   | `apps/web`         | 路由渲染、用户交互、状态管理            |
| **API 层**   | `apps/server`      | REST API 处理、请求鉴权、业务调度       |
| **领域层**   | `apps/server/libs` | Git 操作、执行队列、Gitea 集成、Webhook |
| **持久化层** | Prisma + SQLite    | 数据模型存储与查询                      |

## 请求生命周期

1. **前端**通过 `@utils/net` 工具函数发起 HTTP 请求至服务端。
2. **Koa 中间件链**按顺序执行：CORS → Body Parser → Session → Logger → Authorization → Router → Exception。
3. **Router 中间件**通过路由扫描器（`libs/route-scanner.ts`）发现所有带有 TC39 Stage 3 装饰器的 Controller 类，并将其注册为 Koa 路由。
4. **Controller** 调用业务逻辑库（`libs/`），操作数据库（`libs/prisma.ts`）或触发异步任务（`ExecutionQueue`）。
5. 响应统一封装为 `{ code, message, data, timestamp }` 格式返回前端。
6. 异常由 `middlewares/exception.ts` 统一捕获，Controller 层无需 `try/catch`。

## Monorepo 协作结构

```
MiniCI/
├── apps/
│   ├── server/      # Koa 服务端（Node.js + TypeScript）
│   └── web/         # React 19 前端（Rsbuild + TypeScript）
├── package.json     # 根工作区脚本（dev / lint / fmt / check）
├── pnpm-workspace.yaml
├── .oxlintrc.json   # 全局 oxlint 规则
└── oxfmt.config.ts  # 全局 oxfmt 配置
```

前端与后端**依赖完全隔离**，各自管理独立的 `package.json`；根工作区仅提供统一的工程脚本与代码规范配置。

## 关键设计决策

- **TC39 Stage 3 装饰器**：服务端使用自定义装饰器（`@Controller`、`@Get`、`@Post` 等）声明路由，由 `route-scanner.ts` 扫描并动态注册，降低路由配置耦合度。
- **单文件数据库**：SQLite 通过 Prisma ORM 管理，适合小规模 CI 场景，无需独立数据库服务。
- **ExecutionQueue 单例**：流水线任务通过单例执行队列串行调度，避免并发冲突，并在服务启动时自动恢复未完成任务。
- **严格 TypeScript**：全仓库启用 `strict: true`，服务端相对导入必须携带 `.ts` 扩展名以兼容 `tsx` 运行时。
