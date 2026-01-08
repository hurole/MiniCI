import type Koa from 'koa';
import { Authorization } from './authorization.ts';
import { BodyParser } from './body-parser.ts';
import { CORS } from './cors.ts';
import { Exception } from './exception.ts';
import { HttpLogger } from './logger.ts';
import { Router } from './router.ts';
import { Session } from './session.ts';

/**
 * 初始化中间件
 * @param app Koa
 */
export function initMiddlewares(app: Koa) {
  // 日志中间件需要最早注册，记录所有请求
  new HttpLogger().apply(app);

  // 全局异常处理中间件必须最先注册
  new Exception().apply(app);

  // Session 中间件需要在请求体解析之前注册
  new Session().apply(app);

  new CORS().apply(app);

  new Authorization().apply(app);

  // 请求体解析中间件
  new BodyParser().apply(app);

  new Router().apply(app);
}
