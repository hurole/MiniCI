---
type: '参考'
title: '环境搭建与开发运维指南'
openwiki_generated: true
verified:
  - by: openwiki/0.6.1
    at: 2026-10-02T00:56:02.982Z
sources:
  - id: openwiki-source-327e8e84fb9c5c41f197ee11
    resource: repo://apps/server/package.json
  - id: openwiki-source-9694cf190949b48cda8559c7
    resource: repo://bin/start.sh
  - id: openwiki-source-12b24dda2df60c26a1497adc
    resource: repo://bin/stop.sh
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
generated: { by: 'antigravity', at: '2026-10-01T08:53:56.886Z' }
---

# 环境搭建与开发运维指南

## 环境要求

- **Node.js** v20.0.0 或更高版本（推荐 v22）
- **pnpm** v10+（`corepack enable` 或 `npm install -g pnpm`）

## 快速启动（本地开发）

```bash
# 1. 克隆并安装依赖
git clone https://github.com/hurole/MiniCI.git
cd MiniCI
pnpm install

# 2. 复制并配置服务端环境变量
cp apps/server/.env.example apps/server/.env

# 3. 初始化数据库
cd apps/server
pnpm prisma generate
pnpm prisma db push
cd ../..

# 4. 并行启动前后端开发服务器
pnpm dev
```

启动后访问：

- **前端页面**：http://localhost:3000
- **服务端 API**：http://localhost:3001

## 环境变量配置

服务端环境变量位于 `apps/server/.env`，主要配置项如下：

```env
# 基础服务
PORT=3001
NODE_ENV=development

# 数据库 (SQLite)
DATABASE_URL="file:./prisma/data/dev.db"

# Gitea OAuth 配置（登录与仓库访问）
GITEA_URL="https://your-gitea-instance.com"
GITEA_CLIENT_ID="your_oauth_client_id"
GITEA_CLIENT_SECRET="your_oauth_client_secret"
GITEA_REDIRECT_URI="http://localhost:3000/login"

# 日志级别与工作区目录
LOG_LEVEL="debug"
PIPELINE_WORKSPACE="/tmp/minici/workspace"
```

## 常用脚本命令

### 根工作区

| 命令             | 说明                                   |
| ---------------- | -------------------------------------- |
| `pnpm dev`       | 并行启动所有应用的开发服务器（热重载） |
| `pnpm lint`      | 使用 oxlint 进行静态代码检查           |
| `pnpm lint:fix`  | 自动修复可修复的 lint 问题             |
| `pnpm fmt`       | 使用 oxfmt 格式化所有代码              |
| `pnpm fmt:check` | 检查代码格式规范（不自动修改）         |
| `pnpm check`     | 全量检查（oxlint + oxfmt --check）     |

### 服务端（`apps/server`）

| 命令                   | 说明                                     |
| ---------------------- | ---------------------------------------- |
| `pnpm dev`             | 使用 `tsx watch` 启动，代码变更自动重启  |
| `pnpm build`           | 编译 TypeScript 为 JavaScript（`dist/`） |
| `pnpm prisma generate` | 生成 Prisma Client                       |
| `pnpm prisma db push`  | 将 Schema 同步到 SQLite 数据库           |
| `pnpm prisma studio`   | 打开数据库可视化管理界面                 |

### 前端（`apps/web`）

| 命令           | 说明                                      |
| -------------- | ----------------------------------------- |
| `pnpm dev`     | 使用 Rsbuild 启动开发服务器（支持热重载） |
| `pnpm build`   | 构建生产环境包，输出到 `dist/`            |
| `pnpm preview` | 本地预览生产环境构建结果                  |

## 生产部署

生产环境通过 `bin/` 下的脚本管理：

```bash
# 启动（Nginx 服务前端 + PM2 管理后端）
pnpm start      # 等同于 ./bin/start.sh

# 停止
pnpm stop       # 等同于 ./bin/stop.sh
```

- **前端**：由 Nginx 提供静态文件服务（`apps/web/nginx.conf`）
- **后端**：由 PM2 管理 `dist/app.js` 进程（进程名 `MiniCI`）

部署前需先完成构建：

```bash
pnpm --filter web build
pnpm --filter server build
```

## 代码提交前检查清单

1. 运行 `pnpm check` 确保 lint 与格式检查全部通过
2. 服务端相对路径导入须携带 `.ts` 扩展名
3. 新增 Controller 须确认已在 `app.ts` 或中间件加载器中注册（或支持自动扫描发现）
4. 新增 Web 页面须在 `apps/web/src/pages/App.tsx` 中添加对应路由
