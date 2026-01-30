<!--
Sync Impact Report:
- Version change: 1.2.0 → 1.3.0
- List of modified principles: 
  - II. Server Architecture & ESM: Added file naming, DTO rules, REVERSED error handling (no try/catch), added response standard.
  - III. Frontend Modernity: Added component naming, page structure rules, API request rules.
  - V. Language & Style: Added JSDoc and cleanup rules.
- Added sections: N/A
- Removed sections: N/A
- Templates requiring updates: 
  - ⚠ .specify/templates/plan-template.md
  - ⚠ .specify/templates/spec-template.md
  - ⚠ .specify/templates/tasks-template.md
- Follow-up TODOs: Update AGENTS.md to match the new error handling and conventions.
-->

# MiniCI Constitution

## Core Principles

### I. Monorepo Strictness

架构必须保持 `apps/server` (Node.js/Koa) 和 `apps/web` (React 19) 之间的严格分离。共享代码仅允许存在于 `libs` 包中（如果已外部化）或 `apps/server/libs`（仅限服务端）。`pnpm` 是唯一允许的包管理器；严禁使用 `npm` 和 `yarn`。

### II. Server Architecture & ESM

服务端代码必须是严格类型的 TypeScript。相对导入必须包含 `.ts` 扩展名（例如 `import x from './file.ts'`）。架构必须遵循 Controller-Service-Repository 模式。
- **命名规范**: 文件使用 kebab-case (如 `route-scanner.ts`)。DTO 文件名为 `dto.ts`，类名为 `XxxDTO`。
- **路由定义**: 必须使用 `apps/server/decorators` 中自定义的 TC39 stage 3 装饰器（例如 `@Get`, `@Post`）。
- **错误处理**: 异常必须由 `exception.ts` 中间件统一捕获。Controller 中**禁止**使用 `try/catch`，应直接抛出错误。
- **响应结构**: 必须遵循 `{ code: 0, message: 'success', data: any, timestamp: string }` 标准格式。

### III. Frontend Modernity

前端必须使用 React 19+ 的函数式组件和 Hooks；禁止使用类组件。状态管理必须使用带原子选择器（atomic selectors）的 Zustand。样式必须使用 TailwindCSS + Arco Design。
- **命名规范**: 组件使用 PascalCase (如 `ProjectCard.tsx`)。
- **目录结构**: 页面代码 (`src/pages/*`) 必须包含 `index.tsx` (入口), `components/` (私有组件), `service.ts` (API/纯函数), `types.ts` (类型定义)。
- **路径别名**: 引入模块时必须优先使用 `tsconfig.json` 中配置的别名（如 `@components/*`, `@utils/*` 等），而非相对路径。
- **API 请求**: 必须使用 `@utils` 中的 `net.request`。GET 请求参数必须通过 `params` 对象传递，禁止手动拼接 URL。
- **类型定义**: 必须优先提取到 `types.ts` 文件中，禁止在组件代码文件中混合定义复杂类型。

### IV. Testing Prohibition

不要编写或运行 `test` 或 `spec` 文件（例如 `*.test.ts`）。目前没有测试基础设施。验证必须通过手动方式或在 `apps/server/runners/` 中编写临时的 `runner` 脚本进行。除非明确指示搭建基础设施，否则不要尝试安装测试框架。

### V. Language & Style

所有文档、注释和 Agent 对话必须使用中文。代码风格必须遵守 `biome.json`（2 空格缩进，单引号，排序导入）。
- **注释**: 必须符合 JSDoc 规范。
- **代码质量**: 保持简洁，严禁保留无用的代码引用、变量、函数和 CSS 样式。
- **类型安全**: `any` 类型被**强烈劝阻**（严格模式已启用）。

## Implementation Constraints

Server: 使用 `libs/logger.ts` 进行日志记录（Pino 封装）。
Web: 在 `src/pages` 中使用 React Router v7 进行路由。
Env: 使用 `dotenv` 遵循 `.env` 配置。

## Workflow Standards

Linting: 在完成实现前运行 `pnpm check` (Web) 或依赖 Biome。
Dev: 使用 `pnpm dev` (根目录) 或特定应用的命令。
Database: 使用 `pnpm prisma db push` 进行 Schema 更新 (SQLite)。

## Governance

本宪法取代所有其他实践。修订需要文档记录、批准并更新 `AGENTS.md`。合规性审查必须验证严格的 ESM 导入和中文文档。

**Version**: 1.3.0 | **Ratified**: 2026-01-30 | **Last Amended**: 2026-01-30
