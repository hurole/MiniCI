# Agent Guide for MiniCI

This repository is a Monorepo using `pnpm` workspaces, containing a Node.js Koa server and a React Web UI.
The goal of this document is to provide comprehensive context for AI agents working in this codebase.

## 1. Project Structure

- **`apps/server`**: Backend API (Node.js, Koa, Prisma, SQLite).
  - `controllers/`: Request handlers.
  - `decorators/`: TC39 stage 3 decorators for routing.
  - `libs/`: Shared utilities (Logger, Queue).
  - `middlewares/`: Koa middlewares.
  - `prisma/`: Database schema and migrations.
- **`apps/web`**: Frontend (React 19, Rsbuild, Arco Design, Zustand).
  - `src/pages/`: Application routes/views.
  - `src/stores/`: Zustand state management.
  - `src/hooks/`: Custom React hooks.
  - `src/components/`: Reusable UI components.
- **`biome.json`**: Root configuration for linting and formatting.

## 2. Build, Lint, and Run Commands

### Root
- **Install dependencies:** `pnpm install`
- **Start all apps (dev):** `pnpm dev` (runs concurrently)

### Web (`apps/web`)
- **Dev Server:** `cd apps/web && pnpm dev` (Uses Rsbuild, hot reload)
- **Build:** `cd apps/web && pnpm build` (Production build)
- **Lint/Check:** `cd apps/web && pnpm check` (Biome - fixes import order etc.)
- **Format:** `cd apps/web && pnpm format` (Biome)
- **Preview:** `cd apps/web && pnpm preview` (Preview production build)

### Server (`apps/server`)
- **Dev Server:** `cd apps/server && pnpm dev` (Uses `tsx watch` for auto-restart)
- **Database Setup:**
  - `pnpm prisma generate` (Generate client)
  - `pnpm prisma db push` (Sync schema to `dev.db`)
  - `pnpm prisma studio` (View database GUI)

### Testing
**⚠️ CRITICAL: NO TEST INFRASTRUCTURE**
- This project currently has **NO** testing framework (Jest, Vitest, etc.) configured.
- **Do not** attempt to run tests.
- **Do not** write test files (like `*.test.ts`, `*.spec.ts`) unless the user explicitly asks you to set up the testing infrastructure first.
- If asked to "verify" logic, rely on manual verification steps or writing temporary executable scripts in `apps/server/runners/` if applicable.

## 3. Code Style & Conventions

### General (Biome)
- **Indentation:** 2 spaces.
- **Quotes:** Single quotes preferred.
- **Imports:** Organized automatically by Biome.
- **Semicolons:** Always use semicolons.
- **Type Safety:** `strict: true` is enabled. Avoid `any` where possible.

### Server (`apps/server`)
- **Language:** TypeScript (`.ts`).
- **Imports (Important):** **Must** include `.ts` extension in relative imports.
  - ✅ `import { log } from './libs/logger.ts';`
  - ❌ `import { log } from './libs/logger';` (This will fail at runtime with `tsx`)
- **Architecture:** Controller-Service-Repository pattern (lightweight).
- **Decorators:** Uses custom TC39 (Stage 3) decorators for routing.
  ```typescript
  @Controller('/api/users')
  export class UserController {
    @Get('/:id')
    async getUser(ctx: Context) { ... }
  }
  ```
- **Async/Await:** Preferred over Promises.
- **Logging:** Use `libs/logger.ts` (Pino wrapper).
  - `log.info('MODULE', 'Message %s', var);`
- **Comments:** Chinese comments (`// 初始化应用`) are standard for high-level documentation and complex logic.
- **Error Handling:** Use `try/catch` in controllers. Return structured JSON errors.

### Web (`apps/web`)
- **Language:** TypeScript (`.tsx`, `.ts`).
- **Framework:** React 19.
- **State Management:** Zustand.
  - Store files in `src/stores/`.
  - Use atomic selectors where possible to minimize re-renders.
- **Styling:** TailwindCSS + Arco Design.
  - Use Arco components for base UI.
  - Use Tailwind for layout and custom tweaks.
- **Paths:** Use configured aliases in `tsconfig.json`:
  - `@pages/*` -> `./src/pages/*`
  - `@utils/*` -> `./src/utils/*`
  - `@assets/*` -> `./src/assets/*`
  - `@styles/*` -> `./src/styles/*`
- **Components:** Functional components with Hooks. Avoid Class components.
- **Routing:** React Router v7.

## 4. Development Workflow

1.  **Dependencies:** Always check `package.json` in the specific app folder before adding new libraries.
    - Server: `apps/server/package.json`
    - Web: `apps/web/package.json`
2.  **Linting:** Run `pnpm check` (in `apps/web`) or rely on IDE Biome integration before finishing a task.
    - Ensure imports are sorted.
    - Ensure no unused variables.
3.  **File Creation:**
    -   When creating server files, register them in `app.ts` or the relevant loader if they aren't auto-discovered.
    -   When creating web pages, update routing in `apps/web/src/pages/App.tsx` (or equivalent router config).

## 5. Specific Implementation Details

### Server Decorators (`apps/server/decorators/route.ts`)
The server uses a custom implementation of decorators for routing.
- `createMethodDecorator(method)` factory creates decorators like `@Get`, `@Post`.
- These store metadata on the class constructor.
- A loader (likely in `app.ts` or `middlewares`) scans these to register Koa routes.

### Web Store Pattern
Zustand stores are defined in `src/stores/`.
Example pattern (inferred):
```typescript
import { create } from 'zustand';

interface State {
  count: number;
  inc: () => void;
}

export const useStore = create<State>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));
```

## 6. Rules & Restrictions
- **使用中文:** 对话和文档、代码注释优先使用中文
- **No Tests:** Do not run non-existent test commands.
- **No Class Components:** Use React Functional Components.
- **Strict ESM:** Remember `.ts` extensions in server imports.
- **Environment:** Respect `.env` files (using `dotenv`).
- **Package Manager:** Use `pnpm` exclusively. Do not use `npm` or `yarn`.
- **Imports Order:** `import type` 要在 `import` 之后
