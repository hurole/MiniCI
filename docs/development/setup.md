---
title: 开发与本地环境搭建
summary: 针对本项目的本地开发、数据库与调试指南。
owners:
  - team: backend
status: stable
---

# 开发与本地环境搭建

## 1. 安装依赖

建议使用 `pnpm` 管理工作区依赖：

```bash
# 在仓库根
pnpm install
```

或者只在 server 子包安装：

```bash
cd apps/server
pnpm install
```

## 2. 生成 Prisma Client

```bash
cd apps/server
npx prisma generate
```

如果需要执行迁移（开发场景）：

```bash
npx prisma migrate dev --name init
```

数据库：项目使用 SQLite（见 `apps/server/prisma/schema.prisma`），迁移会在本地创建 `.db` 文件。

## 3. 启动服务

并行启动 workspace 中所有 dev 脚本（推荐）：

```bash
pnpm dev
```

或单独启动 server：

```bash
cd apps/server
pnpm dev
```

服务默认端口：`3001`。如需修改：

```bash
PORT=4000 pnpm dev
```

## 4. 常见开发命令

- 运行测试脚本（仓库自带）：

```bash
cd apps/server
node test.js
```

- TypeScript 类型检查（本地可使用 `tsc`）：

```bash
npx tsc --noEmit
```

## 5. 环境变量与第三方集成

常见 env：`GITEA_URL`, `GITEA_CLIENT_ID`, `GITEA_REDIRECT_URI`, `PORT`, `NODE_ENV`。

登录采用 Gitea OAuth，未配置时某些 auth 接口会返回 401，需要先登录获取 session。

## 6. 运行与调试要点

- 代码通过装饰器注册路由（见 `apps/server/decorators/route.ts` 与 `apps/server/libs/route-scanner.ts`）。
- Prisma client 生成路径：`apps/server/generated`。
- 若变更 Prisma schema，请执行 `prisma generate` 并更新迁移。
