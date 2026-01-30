# MiniCI

> 一个基于 Monorepo 架构的轻量级持续集成（CI）系统。

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Koa](https://img.shields.io/badge/Server-Koa-green.svg)
![Prisma](https://img.shields.io/badge/ORM-Prisma-white.svg)

MiniCI 是一个全栈 TypeScript 项目，旨在提供简单、高效的自动化构建与部署流程。项目采用 `pnpm` workspaces 管理，实现了前后端代码的严格分离与高效协作。

## ✨ 特性

- **现代化前端**: 基于 React 19、Rsbuild 和 Arco Design 构建的响应式 UI。
- **高性能后端**: 使用 Node.js + Koa 框架，配合 Prisma ORM 操作 SQLite 数据库。
- **类型安全**: 全链路 TypeScript 支持，严格的类型检查。
- **工程化规范**: 集成 Biome 进行代码 Lint 和格式化，统一的代码风格。

## 🛠 技术栈

### Core
- **包管理器**: [pnpm](https://pnpm.io/) (Workspaces)
- **语言**: TypeScript (Strict Mode)
- **工具链**: [Biome](https://biomejs.dev/) (Linting & Formatting)

### Frontend (`apps/web`)
- **框架**: React 19
- **构建工具**: Rsbuild
- **UI 组件库**: Arco Design
- **样式**: TailwindCSS
- **状态管理**: Zustand (Atomic Selectors)
- **路由**: React Router v7

### Backend (`apps/server`)
- **运行时**: Node.js
- **Web 框架**: Koa
- **架构模式**: Controller-Service-Repository (Custom Decorators)
- **ORM**: Prisma (SQLite)
- **日志**: Pino

## 🚀 快速开始

### 前置要求

- Node.js (推荐 v20+)
- pnpm (本项目强制使用 pnpm)

### 1. 安装依赖

在根目录下运行：

```bash
pnpm install
```

### 2. 环境配置

确保根目录或各应用目录下存在 `.env` 配置文件。

**服务端 (`apps/server/.env`) 示例:**

```env
# 基础配置
PORT=3001
NODE_ENV=development

# 数据库 (SQLite)
DATABASE_URL="file:./data/dev.db"

# Gitea OAuth 配置 (用于登录)
GITEA_URL="https://your-gitea-instance.com"
GITEA_CLIENT_ID="your_client_id"
GITEA_CLIENT_SECRET="your_client_secret"
GITEA_REDIRECT_URI="http://localhost:3001/api/auth/callback"
```

### 3. 数据库初始化

初始化 SQLite 数据库并同步 Schema：

```bash
# 生成 Prisma Client
pnpm prisma generate

# 推送数据库结构到 dev.db
pnpm prisma db push
```

### 4. 启动开发服务器

并行启动前端和后端服务：

```bash
pnpm dev
```

- **Web 端**: [http://localhost:3000](http://localhost:3000)
- **服务端**: [http://localhost:3001](http://localhost:3001) (视具体配置而定)

## 📂 项目结构

```text
MiniCI/
├── apps/
│   ├── server/            # 后端应用
│   │   ├── controllers/   # 请求控制器
│   │   ├── decorators/    # 路由装饰器 (@Get, @Post)
│   │   ├── prisma/        # 数据库 Schema
│   │   └── ...
│   └── web/               # 前端应用
│       ├── src/
│       │   ├── pages/     # 页面视图 (含 components, service, types)
│       │   ├── stores/    # Zustand 状态
│       │   └── ...
├── .specify/              # AI Agent 记忆与宪法
├── package.json
├── pnpm-workspace.yaml
└── biome.json             # 代码规范配置
```

## 🤝 开发规范

本项目遵循严格的代码宪法（Constitution），请在贡献代码前阅读 [AGENTS.md](./AGENTS.md)。

### 核心原则

1.  **Monorepo 严格性**: `server` 与 `web` 依赖隔离，禁止交叉引用。
2.  **后端架构**: 必须使用 `.ts` 扩展名导入，遵循 CSR 模式，Controller 禁止使用 try/catch（由中间件统一捕获）。
3.  **前端现代化**: 仅使用函数式组件 + Hooks。类型定义必须提取到 `types.ts`。引入模块优先使用路径别名（如 `@components/*`）。
4.  **无测试策略**: 本项目目前**不包含**单元测试基础设施，请勿编写 `*.test.ts` 文件。
5.  **代码风格**: 提交前请确保通过 Biome 检查。

```bash
# Web 端格式化与检查
cd apps/web && pnpm check
```

## 📄 License

[ISC](./package.json) © hurole
