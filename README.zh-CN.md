<p align="center">
  <img src="./apps/web/src/assets/images/logo.svg" alt="MiniCI Logo" width="96" height="96" />
</p>

<h1 align="center">MiniCI</h1>

<p align="center">
  <strong>基于 TypeScript Monorepo 架构构建的现代化轻量级持续集成（CI）与自动化部署平台。</strong>
</p>

<p align="center">
  <a href="./README.md">English</a> •
  <a href="./README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/Node.js-20%2B-green.svg" alt="Node.js" />
  <img src="https://img.shields.io/badge/pnpm-10%2B-orange.svg" alt="pnpm" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61dafb.svg" alt="React 19" />
  <img src="https://img.shields.io/badge/Server-Koa-green.svg" alt="Koa" />
  <img src="https://img.shields.io/badge/ORM-Prisma-white.svg" alt="Prisma" />
</p>

---

## 📖 项目简介

**MiniCI** 是一个全栈持续集成与部署管理系统。项目基于 `pnpm` workspaces 管理，采用高性能 Node.js + Koa 服务端与响应式 React 19 单页前端，提供直观、灵活的自动化流水线执行与管理能力。

## ✨ 特性

- ⚡ **现代化前端**: 基于 React 19、Rsbuild、Arco Design 与 TailwindCSS 构建，结合 Zustand 原子状态管理。
- 🚀 **高性能后端**: Node.js + Koa 2 架构，采用 TC39 Stage 3 路由装饰器与标准的 CSR 分层结构。
- 🗄️ **数据持久化**: Prisma ORM 配合 SQLite 数据库，内置完善的数据模型与迁移能力。
- 🔄 **Git 与 OAuth 集成**: 原生支持 Gitea OAuth 授权登录、代码仓库克隆、分支与 Commit 动态获取。
- 🛠️ **统一工程规范**: 集成 [oxlint](https://oxc.rs/) 与 [oxfmt](https://oxc.rs/)（`@fka/oxfmt-config`），实现毫秒级代码检查与格式化。
- 🔒 **全链路类型安全**: 全仓库采用严格 TypeScript 规范开发。

## 🛠 技术栈

| 领域                         | 技术选型                                                                                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Monorepo 与包管理**        | [pnpm](https://pnpm.io/) Workspaces, [TypeScript](https://www.typescriptlang.org/)                                                                                                                                                   |
| **代码规范与格式化**         | [oxlint](https://oxc.rs/), [oxfmt](https://oxc.rs/) (`@fka/oxfmt-config`)                                                                                                                                                            |
| **前端应用 (`apps/web`)**    | [React 19](https://react.dev/), [Rsbuild](https://rsbuild.dev/), [Arco Design](https://arco.design/), [TailwindCSS](https://tailwindcss.com/), [Zustand](https://zustand.docs.pmnd.rs/), [React Router v7](https://reactrouter.com/) |
| **后端应用 (`apps/server`)** | [Node.js](https://nodejs.org/), [Koa](https://koajs.com/), [Prisma](https://www.prisma.io/) (SQLite), [Pino](https://getpino.io/), [zx](https://google.github.io/zx/)                                                                |

## 📂 项目结构

```text
MiniCI/
├── apps/
│   ├── server/             # 后端 Koa 应用程序
│   │   ├── controllers/    # 控制器层
│   │   ├── decorators/     # TC39 Stage 3 路由装饰器 (@Get, @Post 等)
│   │   ├── libs/           # 共享工具类 (Git 管理器, 任务队列, Webhook 等)
│   │   ├── middlewares/    # Koa 中间件
│   │   ├── prisma/         # 数据库模型与 SQLite 存储
│   │   └── .env.example    # 服务端环境变量配置模板
│   └── web/                # 前端 React 应用程序
│       └── src/
│           ├── components/ # 通用 UI 组件
│           ├── pages/      # 路由页面 (含视图、子组件与 API 服务)
│           ├── stores/     # Zustand 状态管理
│           └── utils/      # 请求封装与工具函数
├── .oxlintrc.json          # Oxlint 规则配置
├── oxfmt.config.ts         # Oxfmt 格式化配置
├── package.json            # 工作区根配置与脚本
└── pnpm-workspace.yaml     # pnpm workspace 配置
```

## 🚀 快速上手

### 环境要求

- [Node.js](https://nodejs.org/) (建议 v20.0.0 或更高版本)
- [pnpm](https://pnpm.io/) (`corepack enable` 或 `npm install -g pnpm`)

### 1. 克隆代码并安装依赖

```bash
git clone https://github.com/hurole/MiniCI.git
cd MiniCI
pnpm install
```

### 2. 环境变量配置

复制服务端环境变量模板文件：

```bash
cp apps/server/.env.example apps/server/.env
```

按需修改 `apps/server/.env` 文件中的配置项：

```env
# 基础服务
PORT=3001
NODE_ENV=development

# 数据库 (SQLite)
DATABASE_URL="file:./prisma/data/dev.db"

# Gitea OAuth 配置 (用于登录与仓库访问)
GITEA_URL="https://your-gitea-instance.com"
GITEA_CLIENT_ID="your_oauth_client_id"
GITEA_CLIENT_SECRET="your_oauth_client_secret"
GITEA_REDIRECT_URI="http://localhost:3000/login"

# 日志与工作区
LOG_LEVEL="debug"
PIPELINE_WORKSPACE="/tmp/minici/workspace"
```

### 3. 数据库初始化

生成 Prisma Client 并将数据表结构同步到 SQLite：

```bash
cd apps/server
pnpm prisma generate
pnpm prisma db push
cd ../..
```

### 4. 启动开发环境

并行启动前端与后端服务：

```bash
pnpm dev
```

- **Web 端页面**: [http://localhost:3000](http://localhost:3000)
- **服务端 API**: [http://localhost:3001](http://localhost:3001)

## 📜 常用命令

| 命令                         | 说明                                           |
| ---------------------------- | ---------------------------------------------- |
| `pnpm dev`                   | 并行启动工作区所有应用的开发服务器             |
| `pnpm lint`                  | 运行 `oxlint` 进行静态代码检查                 |
| `pnpm lint:fix`              | 运行 `oxlint --fix` 自动修复可修复的 lint 问题 |
| `pnpm fmt`                   | 使用 `oxfmt` 格式化工作区所有代码              |
| `pnpm fmt:check`             | 检查代码格式规范                               |
| `pnpm check`                 | 运行全量检查 (`oxlint && oxfmt --check`)       |
| `pnpm --filter web build`    | 构建前端生产环境包                             |
| `pnpm --filter server build` | 编译服务端 TypeScript 代码                     |

## 🗺️ 路线图 (Roadmap)

- [x] **Gitea 平台集成**: OAuth2 授权登录、仓库列表浏览、分支与 Commit 动态获取。
- [ ] **多代码托管平台支持**:
  - [ ] GitHub OAuth 与 API 集成（仓库、分支、Commit、PR 等）。
  - [ ] GitLab（自建版与 SaaS 版）API 集成。
  - [ ] 通用 Git 托管平台适配器抽象层（`GitProvider` 接口）。
- [ ] **Webhook 自动化触发**: 支持在代码 Push / Tag / PR 合并事件发生时自动触发流水线。
- [ ] **多渠道通知**: 集成飞书/Lark、钉钉、企业微信、Slack、Discord 等通知通道。
- [ ] **流水线能力演进**:
  - [ ] 矩阵式多任务并发构建。
  - [ ] Docker-in-Docker 隔离容器运行环境。
  - [ ] 构建产物归档与构建缓存机制。

## 🤝 开发规范

请在贡献代码前阅读 [AGENTS.md](./AGENTS.md) 了解详细的代码规范和架构设计。

1. **依赖隔离**: 前端和后端项目独立管理依赖，禁止跨项目直接引用。
2. **ESM 导入**: 服务端相对路径导入必须保留 `.ts` 扩展名。
3. **提交前检查**: 代码提交前请确保运行 `pnpm check` 并通过检查。

## 📄 开源协议

本项目基于 [MIT License](./LICENSE) 协议开源。
