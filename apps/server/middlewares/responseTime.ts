import type { Middleware } from './types.ts';
import type Koa from 'koa';

export class ResponseTime implements Middleware {
  apply(app: Koa): void {
    app.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      ctx.set('X-Response-Time', `${ms}ms`);
    });
  }
}
