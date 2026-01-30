<!--
Sync Impact Report:
- Version change: 1.1.0 → 1.2.0
- List of modified principles: 
  - III. Frontend Modernity: Added mandatory extraction of types to types.ts.
- Added sections: N/A
- Removed sections: N/A
- Templates requiring updates: 
  - ⚠ .specify/templates/plan-template.md (Testing references still pending from v1.0.0)
  - ⚠ .specify/templates/spec-template.md (Testing references still pending from v1.0.0)
  - ⚠ .specify/templates/tasks-template.md (Testing references still pending from v1.0.0)
- Follow-up TODOs: Update AGENTS.md to match the new type definition rule.
-->

# MiniCI Constitution

## Core Principles

### I. Monorepo Strictness

架构必须保持 `apps/server` (Node.js/Koa) 和 `apps/web` (React 19) 之间的严格分离。共享代码仅允许存在于 `libs` 包中（如果已外部化）或 `apps/server/libs`（仅限服务端）。`pnpm` 是唯一允许的包管理器；严禁使用 `npm` 和 `yarn`。

### II. Server Architecture & ESM

服务端代码必须是严格类型的 TypeScript。相对导入必须包含 `.ts` 扩展名（例如 `import x from './file.ts'`）。架构必须遵循 Controller-Service-Repository 模式。路由必须使用 `apps/server/decorators` 中自定义的 TC39 stage 3 装饰器（例如 `@Get`, `@Post`）进行定义。

### III. Frontend Modernity

前端必须使用 React 19+ 的函数式组件和 Hooks；禁止使用类组件。状态管理必须使用带原子选择器（atomic selectors）的 Zustand。样式必须使用 TailwindCSS + Arco Design。引入模块时必须优先使用 tsconfig.json 中配置的路径别名（如 `@components/*`, `@hooks/*` 等），而非相对路径。类型声明必须优先提取到 `types.ts` 文件中，禁止在组件代码文件中混合定义复杂类型。

### IV. Testing Prohibition

不要编写或运行 `test` 或 `spec` 文件（例如 `*.test.ts`）。目前没有测试基础设施。验证必须通过手动方式或在 `apps/server/runners/` 中编写临时的 `runner` 脚本进行。除非明确指示搭建基础设施，否则不要尝试安装测试框架。

### V. Language & Style

所有文档、注释和 Agent 对话必须使用中文。代码风格必须遵守 `biome.json`（2 空格缩进，单引号，排序导入）。强烈不建议使用 `any` 类型（已启用严格模式）。

## Implementation Constraints

Server: 使用 `libs/logger.ts` 进行日志记录（Pino 封装）。Controller 中的错误必须使用 `try/catch` 并返回结构化的 JSON。
Web: 在 `src/pages` 中使用 React Router v7 进行路由。
Env: 使用 `dotenv` 遵循 `.env` 配置。

## Workflow Standards

Linting: 在完成实现前运行 `pnpm check` (Web) 或依赖 Biome。
Dev: 使用 `pnpm dev` (根目录) 或特定应用的命令。
Database: 使用 `pnpm prisma db push` 进行 Schema 更新 (SQLite)。

## Governance

本宪法取代所有其他实践。修订需要文档记录、批准并更新 `AGENTS.md`。合规性审查必须验证严格的 ESM 导入和中文文档。

**Version**: 1.2.0 | **Ratified**: 2026-01-30 | **Last Amended**: 2026-01-30
