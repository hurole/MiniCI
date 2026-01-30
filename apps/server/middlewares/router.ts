import KoaRouter from '@koa/router';
import type Koa from 'koa';
import {
  AuthController,
  DeploymentController,
  GitController,
  PipelineController,
  ProjectController,
  StepController,
  UserController,
} from '../controllers/index.ts';
import { log } from '../libs/logger.ts';
import { RouteScanner } from '../libs/route-scanner.ts';
import type { Middleware } from './types.ts';

export class Router implements Middleware {
  private router: KoaRouter;
  private routeScanner: RouteScanner;
  private readonly TAG = 'Router';

  constructor() {
    this.router = new KoaRouter({
      prefix: '/api',
    });

    this.routeScanner = new RouteScanner('/api');

    this.registerDecoratorRoutes();

    this.registerTraditionalRoutes();
  }

  apply(app: Koa) {
    // 应用装饰器路由
    this.routeScanner.applyToApp(app);

    // 应用传统路由
    app.use(this.router.routes());
    app.use(this.router.allowedMethods());
  }

  /**
   * 注册装饰器路由
   */
  private registerDecoratorRoutes(): void {
    // 注册所有使用装饰器的控制器
    this.routeScanner.registerControllers([
      ProjectController,
      UserController,
      AuthController,
      DeploymentController,
      PipelineController,
      StepController,
      GitController,
    ]);

    // 输出注册的路由信息
    const routes = this.routeScanner.getRegisteredRoutes();
    log.debug(this.TAG, '装饰器路由注册完成:');
    routes.forEach((route) => {
      log.debug(
        this.TAG,
        `  ${route.method} ${route.path} -> ${route.controller}.${route.action}`,
      );
    });
  }

  /**
   * 注册传统路由（向后兼容）
   */
  private registerTraditionalRoutes(): void {
    // 保持对老版本的兼容，如果需要可以在这里注册非装饰器路由
    // this.router.get('/application/list-legacy', wrapController(application.list));
  }
}
