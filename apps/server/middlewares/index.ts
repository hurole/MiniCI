import { Router } from './router.ts';
import { ResponseTime } from './responseTime.ts';
import type Koa from 'koa';

export function registerMiddlewares(app: Koa) {
  const router = new Router();
  const responseTime = new ResponseTime();
  responseTime.apply(app);
  router.apply(app);
}
