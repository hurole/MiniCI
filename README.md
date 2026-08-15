<p align="center">
  <img src="./apps/web/src/assets/images/logo.svg" alt="MiniCI Logo" width="96" height="96" />
</p>

<h1 align="center">MiniCI</h1>

<p align="center">
  <strong>A lightweight, modern continuous integration (CI) and deployment platform built on a TypeScript monorepo.</strong>
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

## 📖 Introduction

**MiniCI** is an end-to-end continuous integration and deployment management system. Managed via `pnpm` workspaces, it pairs a fast Node.js/Koa backend with a responsive React 19 single-page application to provide an intuitive, flexible pipeline execution engine.

## ✨ Features

- ⚡ **Modern Frontend**: React 19, Rsbuild, Arco Design, TailwindCSS, and atomic Zustand state management.
- 🚀 **Robust Backend**: Node.js + Koa 2 with TC39 Stage 3 routing decorators and CSR architecture.
- 🗄️ **Data Persistence**: Prisma ORM with SQLite backend and built-in migration management.
- 🔄 **Git & OAuth Integration**: First-class support for Gitea OAuth authentication, repository cloning, and branch/commit tracking.
- 🛠️ **Unified Toolchain**: Ultra-fast linting and formatting powered by [oxlint](https://oxc.rs/) and [oxfmt](https://oxc.rs/) (`@fka/oxfmt-config`).
- 🔒 **Type-Safe**: Full-stack TypeScript strictly enforced throughout the monorepo.

## 🛠 Tech Stack

| Domain                            | Technologies                                                                                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Monorepo & Package Management** | [pnpm](https://pnpm.io/) Workspaces, [TypeScript](https://www.typescriptlang.org/)                                                                                                                                                   |
| **Linting & Formatting**          | [oxlint](https://oxc.rs/), [oxfmt](https://oxc.rs/) (`@fka/oxfmt-config`)                                                                                                                                                            |
| **Frontend (`apps/web`)**         | [React 19](https://react.dev/), [Rsbuild](https://rsbuild.dev/), [Arco Design](https://arco.design/), [TailwindCSS](https://tailwindcss.com/), [Zustand](https://zustand.docs.pmnd.rs/), [React Router v7](https://reactrouter.com/) |
| **Backend (`apps/server`)**       | [Node.js](https://nodejs.org/), [Koa](https://koajs.com/), [Prisma](https://www.prisma.io/) (SQLite), [Pino](https://getpino.io/), [zx](https://google.github.io/zx/)                                                                |

## 📂 Project Structure

```text
MiniCI/
├── apps/
│   ├── server/             # Backend Koa application
│   │   ├── controllers/    # API Controllers
│   │   ├── decorators/     # TC39 Stage 3 route decorators (@Get, @Post, etc.)
│   │   ├── libs/           # Utility libraries (Git, Execution Queue, Webhook, etc.)
│   │   ├── middlewares/    # Koa middleware stack
│   │   ├── prisma/         # Prisma schema and SQLite database
│   │   └── .env.example    # Server environment template
│   └── web/                # Frontend React application
│       └── src/
│           ├── components/ # Shared UI components
│           ├── pages/      # Route views (pages, sub-components, services)
│           ├── stores/     # Zustand state stores
│           └── utils/      # HTTP client and helpers
├── .oxlintrc.json          # Oxlint configuration
├── oxfmt.config.ts         # Oxfmt configuration
├── package.json            # Root workspace scripts & dev tools
└── pnpm-workspace.yaml     # pnpm workspace definition
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.0.0 or higher recommended)
- [pnpm](https://pnpm.io/) (`corepack enable` or `npm install -g pnpm`)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/hurole/MiniCI.git
cd MiniCI
pnpm install
```

### 2. Environment Configuration

Copy the example environment configuration in `apps/server`:

```bash
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env` to configure your database path and Gitea OAuth credentials:

```env
# Server
PORT=3001
NODE_ENV=development

# SQLite Database
DATABASE_URL="file:./prisma/data/dev.db"

# Gitea OAuth (for authentication & repository access)
GITEA_URL="https://your-gitea-instance.com"
GITEA_CLIENT_ID="your_oauth_client_id"
GITEA_CLIENT_SECRET="your_oauth_client_secret"
GITEA_REDIRECT_URI="http://localhost:3000/login"

# Logging & Workspace
LOG_LEVEL="debug"
PIPELINE_WORKSPACE="/tmp/minici/workspace"
```

### 3. Database Initialization

Generate the Prisma client and push the schema to SQLite:

```bash
cd apps/server
pnpm prisma generate
pnpm prisma db push
cd ../..
```

### 4. Run Development Servers

Start both frontend and backend development servers concurrently:

```bash
pnpm dev
```

- **Web UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

## 📜 Available Scripts

| Command                      | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `pnpm dev`                   | Starts all workspace applications in parallel       |
| `pnpm lint`                  | Runs `oxlint` for fast static code analysis         |
| `pnpm lint:fix`              | Automatically fixes lint issues with `oxlint --fix` |
| `pnpm fmt`                   | Formats all code with `oxfmt`                       |
| `pnpm fmt:check`             | Verifies code formatting across the repository      |
| `pnpm check`                 | Runs full static check (`oxlint && oxfmt --check`)  |
| `pnpm --filter web build`    | Builds the frontend production bundle               |
| `pnpm --filter server build` | Compiles the backend TypeScript code                |

## 🗺️ Roadmap

- [x] **Gitea Integration**: OAuth2 authentication, repository browsing, branch & commit discovery.
- [ ] **Multi-Git Providers Support**:
  - [ ] GitHub OAuth & API integration (Repositories, Branches, Commits, Pull Requests).
  - [ ] GitLab self-hosted & SaaS integration.
  - [ ] Custom Git provider adapter interface (`GitProvider` abstraction).
- [ ] **Webhook Automation**: Trigger automated pipeline executions on Git push / tag / PR events.
- [ ] **Notification Channels**: Lark/Feishu, DingTalk, WeChat Work, Slack, and Discord webhook integration.
- [ ] **Pipeline Execution Enhancements**:
  - [ ] Concurrent matrix builds.
  - [ ] Docker-in-Docker isolated container execution environments.
  - [ ] Artifacts archiving & cache management.

## 🤝 Development Guidelines

Please refer to [AGENTS.md](./AGENTS.md) for code conventions, architectural patterns, and development workflow.

1. **Strict Monorepo Isolation**: Do not cross-import code between `server` and `web`.
2. **ESM Imports**: Relative imports in the backend must include `.ts` extensions.
3. **Format & Lint**: Ensure `pnpm check` passes before committing code.

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
