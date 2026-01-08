import KoaRouter from '@koa/router';
import type Koa from 'koa';
import {
  getControllerPrefix,
  getRouteMetadata,
  type RouteMetadata,
} from '../decorators/route.ts';
import { createSuccessResponse } from '../middlewares/exception.ts';
import { log } from './logger.ts';

const TAG = 'RouteScanner';

/**
 * 控制器类型
 */
export interface ControllerClass {
  new (...args: any[]): any;
}

/**
 * 路由扫描器，用于自动注册装饰器标注的路由
 */
export class RouteScanner {
  private router: KoaRouter;
  private controllers: ControllerClass[] = [];

  constructor(prefix: string = '/api') {
    this.router = new KoaRouter({ prefix });
  }

  /**
   * 注册控制器类
   */
  registerController(ControllerClass: ControllerClass): void {
    this.controllers.push(ControllerClass);
    this.scanController(ControllerClass);
  }

  /**
   * 注册多个控制器类
   */
  registerControllers(controllers: ControllerClass[]): void {
    controllers.forEach((controller) => this.registerController(controller));
  }

  /**
   * 扫描控制器并注册路由
   */
  private scanController(ControllerClass: ControllerClass): void {
    // 创建控制器实例
    const controllerInstance = new ControllerClass();

    // 获取控制器的路由前缀
    const controllerPrefix = getControllerPrefix(ControllerClass);

    // 获取控制器的路由元数据
    const routes: RouteMetadata[] = getRouteMetadata(ControllerClass);

    // 注册每个路由
    routes.forEach((route) => {
      const fullPath = this.buildFullPath(controllerPrefix, route.path);
      const handler = this.wrapControllerMethod(
        controllerInstance,
        route.propertyKey,
      );

      // 根据HTTP方法注册路由
      switch (route.method) {
        case 'GET':
          this.router.get(fullPath, handler);
          break;
        case 'POST':
          this.router.post(fullPath, handler);
          break;
        case 'PUT':
          this.router.put(fullPath, handler);
          break;
        case 'DELETE':
          this.router.delete(fullPath, handler);
          break;
        case 'PATCH':
          this.router.patch(fullPath, handler);
          break;
        default:
          log.info(TAG, `未支持的HTTP方法: ${route.method}`);
      }
    });
  }

  /**
   * 构建完整的路由路径
   */
  private buildFullPath(controllerPrefix: string, routePath: string): string {
    // 清理和拼接路径
    const cleanControllerPrefix = controllerPrefix.replace(/^\/+|\/+$/g, '');
    const cleanRoutePath = routePath.replace(/^\/+|\/+$/g, '');

    let fullPath = '';
    if (cleanControllerPrefix) {
      fullPath += `/${cleanControllerPrefix}`;
    }
    if (cleanRoutePath) {
      fullPath += `/${cleanRoutePath}`;
    }

    // 如果路径为空，返回根路径
    return fullPath || '/';
  }

  /**
   * 包装控制器方法，统一处理响应格式
   */
  private wrapControllerMethod(instance: any, methodName: string) {
    return async (ctx: Koa.Context, next: Koa.Next) => {
      // 调用控制器方法
      const method = instance[methodName];
      if (typeof method !== 'function') {
        ctx.throw(401, 'Not Found');
      }

      // 绑定this并调用方法
      const result = (await method.call(instance, ctx, next)) ?? null;

      ctx.body = createSuccessResponse(result);
    };
  }

  /**
   * 获取Koa路由器实例，用于应用到Koa应用中
   */
  getRouter(): KoaRouter {
    return this.router;
  }

  /**
   * 应用路由到Koa应用
   */
  applyToApp(app: Koa): void {
    app.use(this.router.routes());
    app.use(this.router.allowedMethods());
  }

  /**
   * 获取已注册的路由信息（用于调试）
   */
  getRegisteredRoutes(): Array<{
    method: string;
    path: string;
    controller: string;
    action: string;
  }> {
    const routes: Array<{
      method: string;
      path: string;
      controller: string;
      action: string;
    }> = [];

    this.controllers.forEach((ControllerClass) => {
      const controllerPrefix = getControllerPrefix(ControllerClass);
      const routeMetadata = getRouteMetadata(ControllerClass);

      routeMetadata.forEach((route) => {
        routes.push({
          method: route.method,
          path: this.buildFullPath(controllerPrefix, route.path),
          controller: ControllerClass.name,
          action: route.propertyKey,
        });
      });
    });

    return routes;
  }
}
