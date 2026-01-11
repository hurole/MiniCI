# MiniCI 项目开发指南

MiniCI 是一个轻量级的持续集成（CI）系统，采用 Monorepo 架构。

## 技术栈

### 核心架构

- **Monorepo**: 使用 pnpm workspace 管理。
- **包管理器**: pnpm。
- **代码格式化**: Biome。

### 后端 (apps/server)

- **框架**: Koa (v3)。
- **语言**: TypeScript。
- **路由**: 基于 TC39 装饰器的自定义路由系统。
- **数据库**: SQLite + Prisma ORM。
- **任务执行**: `zx` (Shell 脚本执行), 自研 `ExecutionQueue` (任务队列)。
- **日志**: Pino。
- **验证**: Zod。

### 前端 (apps/web)

- **框架**: React 19。
- **构建工具**: Rsbuild。
- **样式**: Tailwind CSS + Arco Design + Less。
- **状态管理**: Zustand。
- **路由**: React Router 7。
- **请求**: Axios。

## 项目结构

```text
MiniCI/
├── apps/
│   ├── server/           # 后端服务
│   │   ├── controllers/  # 控制器层 (路由处理)
│   │   ├── decorators/   # TC39 路由装饰器
│   │   ├── libs/         # 核心逻辑库 (Git, 队列, 路由扫描)
│   │   ├── runners/      # 流水线执行器
│   │   ├── prisma/       # 数据库模型定义
│   │   └── generated/    # Prisma 生成的代码
│   └── web/              # 前端应用
│       ├── src/
│       │   ├── pages/    # 页面组件及对应的 Service/Types
│       │   ├── components/ # 通用组件
│       │   ├── stores/   # Zustand 状态管理
│       │   └── shared/   # 通用请求和工具类
└── specs/                # 项目规范与文档
```

## 开发规范

### 1. 后端路由

必须使用装饰器定义路由。

- 类必须标记 `@Controller('prefix')`。
- 方法必须标记 `@Get('path')`, `@Post('path')` 等。
- 路由自动扫描并在 `app.ts` 中通过 `initMiddlewares` 加载。

### 2. 数据库操作

- 使用 Prisma 客户端 (`apps/server/libs/prisma.ts`)。
- 修改模型后运行 `pnpm --filter server prisma generate`。

### 3. 前端开发

- 优先使用 **Arco Design** 组件。
- 样式使用 **Tailwind CSS**。
- 每个页面或模块应包含自己的 `service.ts`（处理 API 请求）和 `types.ts`。

### 4. 任务执行逻辑

- 所有流水线执行都通过 `ExecutionQueue` 调度。
- 具体的执行逻辑位于 `PipelineRunner`，它会处理 Git 仓库的准备和步骤脚本的执行。

## 常用命令

- **全量开发**: `pnpm dev`
- **后端单独开发**: `pnpm --filter server dev`
- **前端单独开发**: `pnpm --filter web dev`
- **数据库同步**: `npx prisma db push` (在 server 目录下)

## 注意事项

- **安全性**: 执行流水线脚本时需注意命令注入风险，目前主要由 `zx` 处理。
- **性能**: 构建日志实时写入数据库，注意大规模并发下的 IO 压力。
- **编码**: 遵循项目中的 Biome 配置进行代码格式化。
