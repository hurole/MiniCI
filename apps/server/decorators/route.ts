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
 * 元数据存储（降级方案）
 */
const metadataStore = new WeakMap<any, Map<string | symbol, any>>();

/**
 * 设置元数据（降级方案）
 */
function setMetadata<T = any>(
  key: string | symbol,
  value: T,
  target: any,
): void {
  if (!metadataStore.has(target)) {
    metadataStore.set(target, new Map());
  }
  metadataStore.get(target)?.set(key, value);
}

/**
 * 获取元数据（降级方案）
 */
function getMetadata<T = any>(
  key: string | symbol,
  target: any,
): T | undefined {
  return metadataStore.get(target)?.get(key);
}

/**
 * 创建HTTP方法装饰器的工厂函数（TC39标准）
 */
function createMethodDecorator(method: HttpMethod) {
  return (path: string = '') =>
    <This, Args extends any[], Return>(
      target: (this: This, ...args: Args) => Return,
      context: ClassMethodDecoratorContext<
        This,
        (this: This, ...args: Args) => Return
      >,
    ) => {
      // 在类初始化时执行
      context.addInitializer(function () {
        // 使用 this.constructor 时需要类型断言
        const ctor = (this as any).constructor;

        // 获取现有的路由元数据
        const existingRoutes: RouteMetadata[] =
          getMetadata(ROUTE_METADATA_KEY, ctor) || [];

        // 添加新的路由元数据
        const newRoute: RouteMetadata = {
          method,
          path,
          propertyKey: String(context.name),
        };

        existingRoutes.push(newRoute);

        // 保存路由元数据到类的构造函数上
        setMetadata(ROUTE_METADATA_KEY, existingRoutes, ctor);
      });

      return target;
    };
}

/**
 * GET 请求装饰器（TC39标准）
 * @param path 路由路径
 */
export const Get = createMethodDecorator('GET');

/**
 * POST 请求装饰器（TC39标准）
 * @param path 路由路径
 */
export const Post = createMethodDecorator('POST');

/**
 * PUT 请求装饰器（TC39标准）
 * @param path 路由路径
 */
export const Put = createMethodDecorator('PUT');

/**
 * DELETE 请求装饰器（TC39标准）
 * @param path 路由路径
 */
export const Delete = createMethodDecorator('DELETE');

/**
 * PATCH 请求装饰器（TC39标准）
 * @param path 路由路径
 */
export const Patch = createMethodDecorator('PATCH');

/**
 * 控制器装饰器（TC39标准）
 * @param prefix 路由前缀
 */
export function Controller(prefix: string = '') {
  return <T extends abstract new (...args: any) => any>(
    target: T,
    context: ClassDecoratorContext<T>,
  ) => {
    // 在类初始化时保存控制器前缀
    context.addInitializer(function () {
      setMetadata('prefix', prefix, this);
    });

    return target;
  };
}

/**
 * 获取控制器的路由元数据
 */
export function getRouteMetadata(ctor: any): RouteMetadata[] {
  return getMetadata(ROUTE_METADATA_KEY, ctor) || [];
}

/**
 * 获取控制器的路由前缀
 */
export function getControllerPrefix(ctor: any): string {
  return getMetadata('prefix', ctor) || '';
}
