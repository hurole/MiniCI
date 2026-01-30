# MiniCI Agent 指南

本仓库是一个使用 `pnpm` workspaces 的 Monorepo，包含一个 Node.js Koa 服务端和一个 React Web UI。
本文档旨在为在该代码库中工作的 AI Agent 提供全面的上下文信息。

## 1. 项目结构

- **`apps/server`**: 后端 API (Node.js, Koa, Prisma, SQLite)。
  - `controllers/`: 请求处理器。
  - `decorators/`: 用于路由的 TC39 stage 3 装饰器。
  - `libs/`: 共享工具库 (Logger, Queue)。
  - `middlewares/`: Koa 中间件。
  - `prisma/`: 数据库 Schema 和迁移文件。
- **`apps/web`**: 前端 (React 19, Rsbuild, Arco Design, Zustand)。
  - `src/pages/`: 应用路由/视图。
  - `src/stores/`: Zustand 状态管理。
  - `src/hooks/`: 自定义 React hooks。
  - `src/components/`: 可复用 UI 组件。
- **`biome.json`**: 根目录下的 lint 和格式化配置。

## 2. 构建、Lint 和运行命令

### 根目录
- **安装依赖:** `pnpm install`
- **启动所有应用 (开发模式):** `pnpm dev` (并行运行)

### Web 端 (`apps/web`)
- **开发服务器:** `cd apps/web && pnpm dev` (使用 Rsbuild，支持热重载)
- **构建:** `cd apps/web && pnpm build` (生产环境构建)
- **Lint/检查:** `cd apps/web && pnpm check` (使用 Biome - 修复导入顺序等)
- **格式化:** `cd apps/web && pnpm format` (使用 Biome)
- **预览:** `cd apps/web && pnpm preview` (预览生产环境构建结果)

### 服务端 (`apps/server`)
- **开发服务器:** `cd apps/server && pnpm dev` (使用 `tsx watch` 自动重启)
- **数据库设置:**
  - `pnpm prisma generate` (生成客户端)
  - `pnpm prisma db push` (同步 Schema 到 `dev.db`)
  - `pnpm prisma studio` (打开数据库 GUI 视图)

### 测试
**⚠️ 重要提示：无测试基础设施**
- 本项目目前**没有**配置任何测试框架 (如 Jest, Vitest 等)。
- **请勿**尝试运行测试命令。
- **请勿**编写测试文件 (如 `*.test.ts`, `*.spec.ts`)，除非用户明确要求先搭建测试基础设施。
- 如果被要求“验证”逻辑，请依赖手动验证步骤或在 `apps/server/runners/` 中编写临时的可执行脚本（如果适用）。

## 3. 代码风格与规范

### 通用规范 (Biome)
- **缩进:** 2 个空格。
- **引号:** 优先使用单引号。
- **导入:** 由 Biome 自动组织。
- **分号:** 始终使用分号。
- **类型安全:** 已启用 `strict: true`。尽量避免使用 `any`。

### 服务端 (`apps/server`)
- **语言:** TypeScript (`.ts`)。
- **导入 (重要):** 相对导入**必须**包含 `.ts` 扩展名。
  - ✅ `import { log } from './libs/logger.ts';`
  - ❌ `import { log } from './libs/logger';` (这会导致 `tsx` 运行时失败)
- **命名:** 文件名使用 kebab-case (如 `route-scanner.ts`)；DTO 类名使用 PascalCase (如 `CreateUserDTO`)。
- **架构:** 轻量级的 Controller-Service-Repository 模式。
- **装饰器:** 使用自定义的 TC39 (Stage 3) 装饰器进行路由定义。
  ```typescript
  @Controller('/api/users')
  export class UserController {
    @Get('/:id')
    async getUser(ctx: Context) { ... }
  }
  ```
- **Async/Await:** 优先于 Promise。
- **日志:** 使用 `libs/logger.ts` (Pino 的包装类)。
  - `log.info('模块名', '消息内容 %s', 变量);`
- **注释:** 采用中文注释 (`// 初始化应用`)，必须符合 JSDoc 规范。
- **错误处理:** 异常由 `exception.ts` 中间件统一捕获。**禁止**在 Controller 中使用 `try/catch`，应直接抛出错误。
- **响应结构:** 必须遵循 `{ code: 0, message: 'success', data: any, timestamp: string }` 标准格式。

### Web 端 (`apps/web`)
- **语言:** TypeScript (`.tsx`, `.ts`)。
- **框架:** React 19。
- **状态管理:** Zustand。
  - Store 文件存放在 `src/stores/`。
  - 尽可能使用原子化的选择器 (atomic selectors) 以减少不必要的重渲染。
- **样式:** TailwindCSS + Arco Design。
  - 使用 Arco 组件作为基础 UI。
  - 使用 Tailwind 进行布局和自定义调整。
- **路径别名:** 使用 `tsconfig.json` 中配置的别名。**引入模块时务必优先使用这些别名，而非相对路径**：
  - `@pages/*` -> `./src/pages/*`
  - `@utils/*` -> `./src/utils/*`
  - `@assets/*` -> `./src/assets/*`
  - `@styles/*` -> `./src/styles/*`
  - 以及其他在 `tsconfig.json` 中定义的别名（如 `@components/*`, `@hooks/*`, `@stores/*`）。
- **组件:** 使用 Hooks 的函数式组件。避免使用类组件。组件命名使用 PascalCase。
- **类型定义:** 优先提取到 `types.ts` 文件中，避免在组件文件中混杂复杂的类型定义。
- **页面结构:** 页面目录下应包含 `index.tsx` (入口), `components/`, `service.ts` (API), `types.ts`。
- **API 请求:** 必须使用 `@utils` 中的 `net`。GET 请求参数通过 `params` 对象传递。
- **路由:** React Router v7。

## 4. 开发工作流

1.  **依赖管理:** 在添加新库之前，务必检查对应应用目录下的 `package.json`。
    - 服务端: `apps/server/package.json`
    - Web 端: `apps/web/package.json`
2.  **Lint 检查:** 在完成任务前，运行 `pnpm check` (在 `apps/web` 中) 或依赖 IDE 的 Biome 集成。
    - 确保导入已排序。
    - 确保没有未使用的变量。
3.  **文件创建:**
    - 创建服务端文件时，如果无法自动发现，请在 `app.ts` 或相关的加载器中注册它们。
    - 创建 Web 页面时，在 `apps/web/src/pages/App.tsx` (或等效的路由配置) 中更新路由。

## 5. 特定实现细节

### 服务端装饰器 (`apps/server/decorators/route.ts`)
服务端使用自定义实现的装饰器进行路由管理。
- `createMethodDecorator(method)` 工厂函数创建了 `@Get`, `@Post` 等装饰器。
- 这些装饰器将元数据存储在类的构造函数上。
- 加载器 (通常在 `app.ts` 或中间件中) 扫描这些元数据以注册 Koa 路由。

### Web Store 模式
Zustand stores 定义在 `src/stores/`。
示例模式：
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

## 6. 规则与限制
- **使用中文:** 对话、文档和代码注释优先使用中文。
- **禁止运行测试:** 不要运行不存在的测试命令。
- **禁止类组件:** 使用 React 函数式组件。
- **严格 ESM:** 服务端导入务必记得带上 `.ts` 扩展名。
- **环境变量:** 尊重 `.env` 文件 (使用 `dotenv`)。
- **包管理器:** 仅使用 `pnpm`。不要使用 `npm` 或 `yarn`。
