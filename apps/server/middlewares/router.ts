import KoaRouter from '@koa/router';
import type Koa from 'koa';
import type { Middleware } from './types.ts';
import * as application from '../controllers/application.ts';

export class Router implements Middleware {
  private router: KoaRouter;
  constructor() {
    this.router = new KoaRouter({
      prefix: '/api',
    });
    this.router.get('/application/list', application.list);
  }

  apply(app: Koa) {
    app.use(this.router.routes());
    app.use(this.router.allowedMethods());
  }
}
