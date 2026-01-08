---
title: 快速开始
summary: 本文档介绍如何在本地启动与运行项目的基础步骤。
tags: [getting-started]
owners:
  - team: backend
status: stable
version: 1.0.0
---

# 快速开始

## 前置条件

- Node.js >= 18
- pnpm
- 克隆权限（或访问仓库）

## 克隆与依赖安装

```bash
git clone <repo-url>
cd foka-ci
pnpm install
```

说明：仓库使用 pnpm workspace，根目录脚本 `pnpm dev` 会并行启动工作区内的 `dev` 脚本。

## 运行服务（开发）

- 从仓库根（并行运行所有 dev 脚本）：

```bash
pnpm dev
```

- 单独运行 server：

```bash
cd apps/server
pnpm install
pnpm dev       # 等同于: tsx watch ./app.ts
```

服务器默认监听端口 `3001`（可通过 `PORT` 环境变量覆盖）。API 前缀为 `/api`。

## Prisma 与数据库

项目使用 SQLite（见 `apps/server/prisma/schema.prisma`）。如果需要生成 Prisma Client 或运行迁移：

```bash
cd apps/server
npx prisma generate
npx prisma migrate dev --name init   # 本地开发使用
```

生成的 Prisma Client 位于 `apps/server/generated`（由 schema 中的 generator 指定）。

## 环境变量（常用）

- `GITEA_URL`、`GITEA_CLIENT_ID`、`GITEA_REDIRECT_URI`：用于 OAuth 登录（Gitea）。
- `PORT`：服务监听端口，默认 `3001`。
- `NODE_ENV`：环境（development/production）。

将敏感值放入 `.env`（不要将 `.env` 提交到仓库）。

## 运行脚本与测试

```bash
cd apps/server
node test.js       # 运行仓库自带的简单测试脚本
```

## 其他说明

- 文档目录位于 `docs/`，设计模板在 `docs/.meta/templates/`。
- API 路由由装饰器注册，路由前缀为 `/api`，在 `apps/server/middlewares/router.ts` 中可查看。

更多开发细节请参见 `docs/development/setup.md` 与 `docs/api/endpoints.md`。
