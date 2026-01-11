import type { Context } from 'koa';
import { Controller, Delete, Get, Post, Put } from '../../decorators/route.ts';
import { BusinessError } from '../../middlewares/exception.ts';
import {
  createUserSchema,
  searchUserQuerySchema,
  updateUserSchema,
  userIdSchema,
} from './dto.ts';

/**
 * 用户控制器
 */
@Controller('/user')
export class UserController {
  @Get('/list')
  async list(_ctx: Context) {
    // 模拟用户列表数据
    const users = [
      { id: 1, name: 'Alice', email: 'alice@example.com', status: 'active' },
      { id: 2, name: 'Bob', email: 'bob@example.com', status: 'inactive' },
      {
        id: 3,
        name: 'Charlie',
        email: 'charlie@example.com',
        status: 'active',
      },
    ];

    return users;
  }

  @Get('/detail/:id')
  async detail(ctx: Context) {
    const { id } = userIdSchema.parse(ctx.params);

    // 模拟根据ID查找用户
    const user = {
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    if (id > 100) {
      throw new BusinessError('用户不存在', 2001, 404);
    }

    return user;
  }

  @Post('')
  async create(ctx: Context) {
    const body = createUserSchema.parse(ctx.request.body);

    // 模拟创建用户
    const newUser = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
      status: body.status,
    };

    return newUser;
  }

  @Put('/:id')
  async update(ctx: Context) {
    const { id } = userIdSchema.parse(ctx.params);
    const body = updateUserSchema.parse(ctx.request.body);

    // 模拟更新用户
    const updatedUser = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return updatedUser;
  }

  @Delete('/:id')
  async delete(ctx: Context) {
    const { id } = userIdSchema.parse(ctx.params);

    if (id === 1) {
      throw new BusinessError('管理员账户不能删除', 2002, 403);
    }

    // 模拟删除操作
    return {
      success: true,
      message: `用户 ${id} 已删除`,
      deletedAt: new Date().toISOString(),
    };
  }

  @Get('/search')
  async search(ctx: Context) {
    const { keyword, status } = searchUserQuerySchema.parse(ctx.query);

    // 模拟搜索逻辑
    let results = [
      { id: 1, name: 'Alice', email: 'alice@example.com', status: 'active' },
      { id: 2, name: 'Bob', email: 'bob@example.com', status: 'inactive' },
    ];

    if (keyword) {
      results = results.filter(
        (user) =>
          user.name.toLowerCase().includes(keyword.toLowerCase()) ||
          user.email.toLowerCase().includes(keyword.toLowerCase()),
      );
    }

    if (status) {
      results = results.filter((user) => user.status === status);
    }

    return results;
  }
}
