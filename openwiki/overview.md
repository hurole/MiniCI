---
type: '参考'
title: 'MiniCI 概览'
openwiki_generated: true
sources:
  - id: openwiki-source-327e8e84fb9c5c41f197ee11
    resource: repo://apps/server/package.json
  - id: openwiki-source-633db5c25afdc324f4483f9f
    resource: repo://apps/web/src/pages/App.tsx
  - id: openwiki-source-3991e5820212155f6efc5331
    resource: repo://README.zh-CN.md
generated: { by: 'antigravity', at: '2026-10-01T08:53:56.886Z' }
verified:
  - by: openwiki/0.6.1
    at: 2026-10-02T00:56:02.982Z
---

# MiniCI 概览

**MiniCI** 是一个基于 TypeScript Monorepo 架构构建的现代化轻量级持续集成（CI）与自动化部署平台。

## 系统定位

MiniCI 面向小型团队与个人开发者，提供：

- 与 Gitea 深度集成的 OAuth2 认证与代码仓库管理
- 可视化的 CI/CD 流水线配置与执行监控
- 自动化的部署事件 Webhook 通知

## 核心特性

| 特性                     | 说明                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| ⚡ **现代化前端**        | React 19 + Rsbuild + Arco Design + TailwindCSS + Zustand 原子状态管理 |
| 🚀 **高性能后端**        | Node.js + Koa 2 + TC39 Stage 3 路由装饰器 + 标准 CSR 分层架构         |
| 🗄️ **数据持久化**        | Prisma ORM + SQLite，内置完善的数据模型与迁移能力                     |
| 🔄 **Git 与 OAuth 集成** | 原生支持 Gitea OAuth 授权登录、代码仓库克隆、分支与 Commit 获取       |
| 🛠️ **统一工程规范**      | oxlint + oxfmt（`@fka/oxfmt-config`）毫秒级检查与格式化               |
| 🔒 **全链路类型安全**    | 全仓库 `strict: true` TypeScript 模式                                 |

## 技术栈

| 领域                  | 选型                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| **Monorepo 与包管理** | pnpm Workspaces + TypeScript                                          |
| **代码规范**          | oxlint + oxfmt                                                        |
| **前端**              | React 19, Rsbuild, Arco Design, TailwindCSS, Zustand, React Router v7 |
| **后端**              | Node.js 22, Koa 3, Prisma 7 (SQLite), Pino, zx, zod                   |

## 项目目录结构

```text
MiniCI/
├── apps/
│   ├── server/             # 后端 Koa 应用
│   │   ├── controllers/    # 控制器层（auth/git/pipeline/project/step/deployment/user）
│   │   ├── decorators/     # TC39 Stage 3 路由装饰器（@Controller, @Get, @Post 等）
│   │   ├── libs/           # 共享工具类（Git 管理器、任务队列、Gitea 集成、Webhook）
│   │   ├── middlewares/    # Koa 中间件（cors/session/authorization/router/exception）
│   │   └── prisma/         # 数据库 Schema 与 SQLite 存储
│   └── web/                # 前端 React 应用
│       └── src/
│           ├── components/ # 通用 UI 组件
│           ├── pages/      # 路由页面（home/login/project）
│           ├── stores/     # Zustand 状态管理
│           └── utils/      # 请求封装（net）与工具函数
├── bin/
│   ├── start.sh            # 生产启动脚本（Nginx + PM2）
│   └── stop.sh             # 生产停止脚本
├── .oxlintrc.json          # Oxlint 规则配置
├── oxfmt.config.ts         # Oxfmt 格式化配置
├── package.json            # 工作区根配置与脚本
└── pnpm-workspace.yaml     # pnpm workspace 配置
```

## 路线图（Roadmap）

- [x] **Gitea 平台集成**：OAuth2 授权、仓库列表、分支与 Commit 获取
- [ ] **多代码托管平台支持**：GitHub、GitLab 等 Git Provider 抽象适配层
- [ ] **Webhook 自动化触发**：Push/Tag/PR 合并事件自动触发流水线
- [ ] **多渠道通知**：飞书/Lark、钉钉、企业微信、Slack 等
- [ ] **流水线能力演进**：矩阵构建、Docker 隔离、产物归档与缓存
