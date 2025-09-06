import type Koa from 'koa';
import type { Middleware } from './types.ts';

export class Authorization implements Middleware {
  private readonly ignoreAuth = [
    '/api/auth/login',
    '/api/auth/info',
    '/api/auth/url',
  ];

  apply(app: Koa) {
    app.use(async (ctx: Koa.Context, next: Koa.Next) => {
      if (this.ignoreAuth.includes(ctx.path)) {
        return next();
      }
      if (ctx.session.user == null) {
        ctx.throw(401, 'Unauthorized');
      }
      await next();
    });
  }
}
