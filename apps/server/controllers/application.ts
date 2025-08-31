import type { Context } from 'koa';
import prisma from '../libs/db.ts';
import { BusinessError } from '../middlewares/exception.ts';
import { Controller, Get } from '../decorators/route.ts';

@Controller('/application')
export class ApplicationController {
  @Get('/list')
  async list(ctx: Context) {
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
    try {
      const { id } = ctx.params;
      const app = await prisma.application.findUnique({
        where: { id: Number(id) },
      });

      if (!app) {
        throw new BusinessError('应用不存在', 1002, 404);
      }

      return app;
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      throw new BusinessError('获取应用详情失败', 1003, 500);
    }
  }
}

// 保持向后兼容的导出方式
const applicationController = new ApplicationController();
export const list = applicationController.list.bind(applicationController);
export const detail = applicationController.detail.bind(applicationController);
