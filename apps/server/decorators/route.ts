import 'reflect-metadata';

/**
 * 路由元数据键
 */
export const ROUTE_METADATA_KEY = Symbol('route');

/**
 * HTTP 方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * 路由元数据接口
 */
export interface RouteMetadata {
  method: HttpMethod;
  path: string;
  propertyKey: string;
}

/**
 * 创建HTTP方法装饰器的工厂函数
 */
function createMethodDecorator(method: HttpMethod) {
  return function (path: string = '') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      // 获取现有的路由元数据
      const existingRoutes: RouteMetadata[] = (Reflect as any).getMetadata(ROUTE_METADATA_KEY, target.constructor) || [];

      // 添加新的路由元数据
      const newRoute: RouteMetadata = {
        method,
        path,
        propertyKey
      };

      existingRoutes.push(newRoute);

      // 保存路由元数据到类的构造函数上
      (Reflect as any).defineMetadata(ROUTE_METADATA_KEY, existingRoutes, target.constructor);

      return descriptor;
    };
  };
}

/**
 * GET 请求装饰器
 * @param path 路由路径
 */
export const Get = createMethodDecorator('GET');

/**
 * POST 请求装饰器
 * @param path 路由路径
 */
export const Post = createMethodDecorator('POST');

/**
 * PUT 请求装饰器
 * @param path 路由路径
 */
export const Put = createMethodDecorator('PUT');

/**
 * DELETE 请求装饰器
 * @param path 路由路径
 */
export const Delete = createMethodDecorator('DELETE');

/**
 * PATCH 请求装饰器
 * @param path 路由路径
 */
export const Patch = createMethodDecorator('PATCH');

/**
 * 控制器装饰器
 * @param prefix 路由前缀
 */
export function Controller(prefix: string = '') {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // 保存控制器前缀到元数据
    (Reflect as any).defineMetadata('prefix', prefix, constructor);
    return constructor;
  };
}

/**
 * 获取控制器的路由元数据
 */
export function getRouteMetadata(constructor: any): RouteMetadata[] {
  return (Reflect as any).getMetadata(ROUTE_METADATA_KEY, constructor) || [];
}

/**
 * 获取控制器的路由前缀
 */
export function getControllerPrefix(constructor: any): string {
  return (Reflect as any).getMetadata('prefix', constructor) || '';
}
