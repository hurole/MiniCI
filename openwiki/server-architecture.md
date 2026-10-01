---
type: '参考'
title: '服务端架构与核心实现'
openwiki_generated: true
verified:
  - by: openwiki/0.6.1
    at: 2026-10-01T08:53:56.886Z
sources:
  - id: openwiki-source-7eebab92a1387b104121d58d
    resource: repo://apps/server/decorators/route.ts
  - id: openwiki-source-75b3bed3091d0feb03bf6bfb
    resource: repo://apps/server/libs/route-scanner.ts
  - id: openwiki-source-c72e803ea9381ace9aa01e0e
    resource: repo://apps/server/prisma/schema.prisma
generated: { by: 'antigravity', at: '2026-10-01T08:53:56.886Z' }
---

# 服务端架构与核心实现

MiniCI 服务端基于 **Koa 3** 构建，采用 TC39 Stage 3 装饰器路由机制、Prisma ORM 数据层以及清晰的 Controller-Lib 分层结构。

## TC39 Stage 3 路由装饰器

### 装饰器实现原理（`decorators/route.ts`）

路由系统使用自定义的 TC39 Stage 3 装饰器（无需 `reflect-metadata`），核心是以 `WeakMap` 作为元数据存储：

```typescript
const metadataStore = new WeakMap<any, Map<string | symbol, any>>();
```

**`@Controller(prefix)`**：通过 `ClassDecoratorContext.addInitializer` 在类初始化时将路由前缀存储到元数据。

**`@Get / @Post / @Put / @Delete / @Patch`**：由 `createMethodDecorator(method)` 工厂函数生成，通过 `ClassMethodDecoratorContext.addInitializer` 在实例初始化时将路由元数据（method、path、propertyKey）追加到类构造函数上的 `RouteMetadata[]` 数组中。

### 使用示例

```typescript
@Controller('/auth')
export class AuthController {
  @Get('/url')
  async url() {
    return { url: '...' };
  }

  @Post('/login')
  async login(ctx: Context) { ... }
}
```

## RouteScanner：路由自动注册（`libs/route-scanner.ts`）

`RouteScanner` 读取装饰器元数据，动态注册到 `@koa/router`。

### 注册流程

```
RouteScanner.registerController(AuthController)
  │
  ├── new AuthController()（触发 addInitializer，元数据写入）
  ├── getControllerPrefix(AuthController)  → "/auth"
  ├── getRouteMetadata(AuthController)     → [{ method: "GET", path: "/url", ... }, ...]
  │
  └── 遍历路由元数据 → router.get("/auth/url", handler)
                       router.post("/auth/login", handler)
```

所有路由统一挂载在 `/api` 前缀下（`new RouteScanner('/api')`），最终完整路径为 `/api/auth/url`。

### 响应格式统一化

`wrapControllerMethod` 包装每个 Controller 方法，Controller 只需 `return` 数据，框架自动封装为标准格式：

```json
{
  "code": 0,
  "message": "success",
  "data": <controller返回值>,
  "timestamp": "2026-10-01T08:00:00.000Z"
}
```

## Koa 中间件链

中间件按以下顺序执行（`middlewares/index.ts`）：

```
CORS → Body Parser → Session → Logger → Authorization → Router → Exception
```

- **Authorization**：校验 `ctx.session.user`，未登录请求返回 401
- **Exception**：统一捕获异常，Controller 层无需 `try/catch`

## 控制器组织

所有 Controller 位于 `apps/server/controllers/`：

| 控制器       | 路由前缀      | 职责                           |
| ------------ | ------------- | ------------------------------ |
| `auth`       | `/auth`       | OAuth2 登录、登出、用户信息    |
| `git`        | `/git`        | Gitea API 代理（分支、Commit） |
| `project`    | `/project`    | 项目 CRUD 管理                 |
| `pipeline`   | `/pipeline`   | 流水线管理与部署触发           |
| `step`       | `/step`       | 流水线步骤管理                 |
| `deployment` | `/deployment` | 部署记录查询                   |
| `user`       | `/user`       | 用户管理                       |

## Prisma 数据模型

数据库使用 SQLite（`prisma/data/dev.db`），包含以下核心模型：

| 模型         | 说明                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| `Project`    | 项目信息，含仓库 URL、工作目录、Webhook URL                                    |
| `Pipeline`   | 流水线定义，属于某个 Project                                                   |
| `Step`       | 流水线步骤，含 `script`（执行命令）和 `order`（顺序）                          |
| `Deployment` | 部署记录，含状态（pending/running/success/failed）、分支、commitHash、buildLog |
| `User`       | 用户信息，从 Gitea 同步                                                        |

所有模型均包含 `valid` 字段（软删除标记）以及 `createdBy`/`updatedBy` 审计字段。

`Deployment.status` 的有效值为：`pending`、`running`、`success`、`failed`、`cancelled`。
