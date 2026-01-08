# 路由装饰器使用指南（TC39 标准）

本项目使用符合 **TC39 Stage 3 提案**的标准装饰器语法，提供现代化的路由定义方式。

## TC39 装饰器优势

- ✅ **标准化**：符合 ECMAScript 官方标准提案
- ✅ **类型安全**：完整的 TypeScript 类型支持
- ✅ **性能优化**：无需 reflect-metadata 依赖
- ✅ **未来兼容**：随着标准发展自动获得浏览器支持

## 快速开始

### 1. 创建控制器

```typescript
import type { Context } from 'koa';
import { Controller, Get, Post, Put, Delete } from '../decorators/route.ts';
import { BusinessError } from '../middlewares/exception.ts';

@Controller('/api-prefix') // 控制器路由前缀
export class MyController {

  @Get('/users')
  async getUsers(ctx: Context) {
    // 直接返回数据，自动包装成统一响应格式
    return { users: [] };
  }

  @Post('/users')
  async createUser(ctx: Context) {
    const userData = (ctx.request as any).body;
    // 业务逻辑处理...
    return { id: 1, ...userData };
  }

  @Put('/users/:id')
  async updateUser(ctx: Context) {
    const { id } = ctx.params;
    const userData = (ctx.request as any).body;
    // 业务逻辑处理...
    return { id, ...userData };
  }

  @Delete('/users/:id')
  async deleteUser(ctx: Context) {
    const { id } = ctx.params;
    // 业务逻辑处理...
    return { success: true };
  }
}
```

### 2. 注册控制器

在 `middlewares/router.ts` 的 `registerDecoratorRoutes()` 方法中添加你的控制器：

```typescript
this.routeScanner.registerControllers([
  ApplicationController,
  UserController,
  MyController  // 添加你的控制器
]);
```

## 可用装饰器

### HTTP方法装饰器（TC39 标准）

- `@Get(path)` - GET 请求
- `@Post(path)` - POST 请求
- `@Put(path)` - PUT 请求
- `@Delete(path)` - DELETE 请求
- `@Patch(path)` - PATCH 请求

### 控制器装饰器（TC39 标准）

- `@Controller(prefix)` - 控制器路由前缀

## TC39 装饰器特性

### 1. 标准语法
```typescript
// TC39 标准装饰器使用 addInitializer
@Get('/users')
async getUsers(ctx: Context) {
  return userData;
}
```

### 2. 类型安全
```typescript
// 完整的 TypeScript 类型检查
@Controller('/api')
export class ApiController {
  @Get('/health')
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
```

### 3. 无外部依赖
```typescript
// 不再需要 reflect-metadata
// 使用内置的 WeakMap 存储元数据
```

## 配置要求

### TypeScript 配置

```json
{
  "compilerOptions": {
    "experimentalDecorators": false,  // 关闭实验性装饰器
    "emitDecoratorMetadata": false,   // 关闭元数据发射
    "target": "ES2022",               // 目标 ES2022+
    "useDefineForClassFields": false  // 兼容装饰器行为
  }
}
```

### 依赖

```json
{
  "dependencies": {
    // 无需 reflect-metadata
  }
}
```

## 路径拼接规则

最终的API路径 = 全局前缀 + 控制器前缀 + 方法路径

例如：
- 全局前缀：`/api`
- 控制器前缀：`/user`
- 方法路径：`/list`
- 最终路径：`/api/user/list`

## 响应格式

控制器方法只需要返回数据，系统会自动包装成统一响应格式：

```json
{
  "code": 0,
  "message": "操作成功",
  "data": { /* 控制器返回的数据 */ },
  "timestamp": 1693478400000
}
```

## 异常处理

可以抛出 `BusinessError` 来返回业务异常：

```typescript
import { BusinessError } from '../middlewares/exception.ts';

@Get('/users/:id')
async getUser(ctx: Context) {
  const { id } = ctx.params;

  if (!id) {
    throw new BusinessError('用户ID不能为空', 1001, 400);
  }

  // 正常业务逻辑...
  return userData;
}
```

## 现有路由

项目中已注册的路由：

### ApplicationController
- `GET /api/application/list` - 获取应用列表
- `GET /api/application/detail/:id` - 获取应用详情

### UserController
- `GET /api/user/list` - 获取用户列表
- `GET /api/user/detail/:id` - 获取用户详情
- `POST /api/user` - 创建用户
- `PUT /api/user/:id` - 更新用户
- `DELETE /api/user/:id` - 删除用户
- `GET /api/user/search` - 搜索用户

## 与旧版本装饰器的区别

| 特性 | 实验性装饰器 | TC39 标准装饰器 |
|------|-------------|----------------|
| 标准化 | ❌ TypeScript 特有 | ✅ ECMAScript 标准 |
| 依赖 | ❌ 需要 reflect-metadata | ✅ 零依赖 |
| 性能 | ❌ 运行时反射 | ✅ 编译时优化 |
| 类型安全 | ⚠️ 部分支持 | ✅ 完整支持 |
| 未来兼容 | ❌ 可能被废弃 | ✅ 持续演进 |

## 迁移指南

从实验性装饰器迁移到 TC39 标准装饰器：

1. **更新 tsconfig.json**
   ```json
   {
     "experimentalDecorators": false,
     "emitDecoratorMetadata": false
   }
   ```

2. **移除依赖**
   ```bash
   pnpm remove reflect-metadata
   ```

3. **代码无需修改**
   - 装饰器语法保持不变
   - 控制器代码无需修改
   - 自动兼容新标准

## 注意事项

1. 需要 TypeScript 5.0+ 支持
2. 需要 Node.js 16+ 运行环境
3. 控制器类需要导出并在路由中间件中注册
4. 控制器方法应该返回数据而不是直接操作 `ctx.body`
5. TC39 装饰器使用 `addInitializer` 进行初始化，性能更优
