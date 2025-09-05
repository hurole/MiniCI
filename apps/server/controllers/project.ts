import type { Context } from 'koa';
import prisma from '../libs/db.ts';
import { log } from '../libs/logger.ts';
import { BusinessError } from '../middlewares/exception.ts';
import { Controller, Get } from '../decorators/route.ts';

@Controller('/project')
export class ProjectController {
  @Get('/list')
  async list(ctx: Context) {
    log.debug('app', 'session %o', ctx.session);
    try {
      const list = await prisma.application.findMany({
        where: {
          valid: 1,
        },
      });

      // 直接返回数据，由路由中间件统一包装成响应格式
      return list;
    } catch (error) {
      // 抛出业务异常，由全局异常处理中间件捕获
      throw new BusinessError('获取应用列表失败', 1001, 500);
    }
  }

  @Get('/detail/:id')
  async detail(ctx: Context) {
    const { id } = ctx.params;
    const app = await prisma.application.findUnique({
      where: { id: Number(id) },
    });

    if (!app) {
      throw new BusinessError('应用不存在', 1002, 404);
    }

    return app;
  }
}
