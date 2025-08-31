import { Router } from './router.ts';
import { ResponseTime } from './responseTime.ts';
import { Exception } from './exception.ts';
import { BodyParser } from './body-parser.ts';
import type Koa from 'koa';

/**
 * 初始化中间件
 * @param app Koa
 */
export function initMiddlewares(app: Koa) {
  // 全局异常处理中间件必须最先注册
  const exception = new Exception();
  exception.apply(app);

  // 请求体解析中间件
  const bodyParser = new BodyParser();
  bodyParser.apply(app);

  const responseTime = new ResponseTime();
  responseTime.apply(app);

  const router = new Router();
  router.apply(app);
}
