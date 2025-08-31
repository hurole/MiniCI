# 路由装饰器使用指南

本项目已支持使用装饰器来自动注册路由，让控制器代码更加简洁和声明式。

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
    const userData = ctx.request.body;
    // 业务逻辑处理...
    return { id: 1, ...userData };
  }

  @Put('/users/:id')
  async updateUser(ctx: Context) {
    const { id } = ctx.params;
    const userData = ctx.request.body;
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

### HTTP方法装饰器

- `@Get(path)` - GET 请求
- `@Post(path)` - POST 请求
- `@Put(path)` - PUT 请求
- `@Delete(path)` - DELETE 请求
- `@Patch(path)` - PATCH 请求

### 控制器装饰器

- `@Controller(prefix)` - 控制器路由前缀

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

## 路由参数

支持标准的Koa路由参数：

```typescript
@Get('/users/:id')           // 路径参数
@Get('/users/:id/posts/:pid') // 多个参数
@Get('/search')              // 查询参数通过 ctx.query 获取
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

## 注意事项

1. 需要安装依赖：`pnpm add reflect-metadata`
2. TypeScript配置需要开启装饰器支持
3. 控制器类需要导出并在路由中间件中注册
4. 控制器方法应该返回数据而不是直接操作 `ctx.body`
