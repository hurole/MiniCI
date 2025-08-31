import KoaRouter from '@koa/router';
import type Koa from 'koa';
import type { Middleware } from './types.ts';
import { createAutoSuccessResponse } from './exception.ts';
import { RouteScanner } from '../libs/route-scanner.ts';
import { ApplicationController } from '../controllers/application.ts';
import { UserController } from '../controllers/user.ts';
import * as application from '../controllers/application.ts';

/**
 * 包装控制器函数，统一处理响应格式
 */
function wrapController(controllerFn: Function) {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    try {
      // 调用控制器函数获取返回数据
      const result = await controllerFn(ctx, next);

      // 如果控制器返回了数据，则包装成统一响应格式
      if (result !== undefined) {
        ctx.body = createAutoSuccessResponse(result);
      }
      // 如果控制器没有返回数据，说明已经自己处理了响应
    } catch (error) {
      // 错误由全局异常处理中间件处理
      throw error;
    }
  };
}

export class Router implements Middleware {
  private router: KoaRouter;
  private routeScanner: RouteScanner;

  constructor() {
    this.router = new KoaRouter({
      prefix: '/api',
    });

    // 初始化路由扫描器
    this.routeScanner = new RouteScanner('/api');

    // 注册装饰器路由
    this.registerDecoratorRoutes();

    // 注册传统路由（向后兼容）
    this.registerTraditionalRoutes();
  }

  /**
   * 注册装饰器路由
   */
  private registerDecoratorRoutes(): void {
    // 注册所有使用装饰器的控制器
    this.routeScanner.registerControllers([
      ApplicationController,
      UserController
    ]);

    // 输出注册的路由信息
    const routes = this.routeScanner.getRegisteredRoutes();
    console.log('装饰器路由注册完成:');
    routes.forEach(route => {
      console.log(`  ${route.method} ${route.path} -> ${route.controller}.${route.action}`);
    });
  }

  /**
   * 注册传统路由（向后兼容）
   */
  private registerTraditionalRoutes(): void {
    // 保持对老版本的兼容，如果需要可以在这里注册非装饰器路由
    // this.router.get('/application/list-legacy', wrapController(application.list));
  }

  apply(app: Koa) {
    // 应用装饰器路由
    this.routeScanner.applyToApp(app);

    // 应用传统路由
    app.use(this.router.routes());
    app.use(this.router.allowedMethods());
  }
}
