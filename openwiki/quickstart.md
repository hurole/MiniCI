---
type: '参考'
title: 'MiniCI Wiki 快速入门'
openwiki_generated: true
verified:
  - by: openwiki/0.6.1
    at: 2026-10-01T08:53:56.886Z
sources:
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-3991e5820212155f6efc5331
    resource: repo://README.zh-CN.md
generated: { by: 'antigravity', at: '2026-10-01T08:53:56.886Z' }
---

# MiniCI Wiki 快速入门

**MiniCI** 是一个基于 TypeScript Monorepo 架构的轻量级持续集成与自动化部署平台，提供与 Gitea 深度集成的 CI/CD 管理能力。

## ⚡ 快速启动

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp apps/server/.env.example apps/server/.env
# 按需编辑 apps/server/.env

# 3. 初始化数据库
cd apps/server && pnpm prisma generate && pnpm prisma db push && cd ../..

# 4. 启动开发服务器（前后端并行）
pnpm dev
```

- **前端**：http://localhost:3000
- **API**：http://localhost:3001

## 📚 Wiki 页面导航

| 页面                                   | 描述                                           |
| -------------------------------------- | ---------------------------------------------- |
| [概览](./overview.md)                  | 项目定位、核心特性、技术栈与目录结构           |
| [系统架构](./architecture.md)          | 全栈架构图、前后端分工与请求生命周期           |
| [服务端架构](./server-architecture.md) | TC39 装饰器路由、路由扫描器、Prisma 数据模型   |
| [前端架构](./web-architecture.md)      | Rsbuild 构建、Zustand 状态管理、网络请求封装   |
| [流水线引擎](./pipeline-engine.md)     | ExecutionQueue、GitManager、任务调度与崩溃恢复 |
| [外部集成](./integrations.md)          | Gitea OAuth2 认证流程、Webhook 通知机制        |
| [环境搭建](./getting-started.md)       | 本地开发环境配置、常用命令、生产部署指南       |

## 🛠️ 常用命令速查

| 命令                         | 说明                             |
| ---------------------------- | -------------------------------- |
| `pnpm dev`                   | 并行启动前后端开发服务器         |
| `pnpm check`                 | 运行全量 lint 与格式化检查       |
| `pnpm fmt`                   | 自动格式化所有代码               |
| `pnpm --filter web build`    | 构建前端生产包                   |
| `pnpm --filter server build` | 编译服务端 TypeScript            |
| `pnpm start` / `pnpm stop`   | 生产环境启动/停止（Nginx + PM2） |
