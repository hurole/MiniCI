import type Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import type { Middleware } from './types.ts';

/**
 * 请求体解析中间件
 */
export class BodyParser implements Middleware {
  apply(app: Koa): void {
    app.use(bodyParser());
  }
}
