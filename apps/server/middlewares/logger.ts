import { log } from '../libs/logger.ts';
import type { Middleware } from './types.ts';
import type Koa from 'koa';
import type { Context } from 'koa';

export class HttpLogger implements Middleware {
  apply(app: Koa): void {
    app.use(async (ctx: Context, next: Koa.Next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      log.info('HTTP', `${ctx.method} ${ctx.url} - ${ms}ms`);
    });
  }
}
