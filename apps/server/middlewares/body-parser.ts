import type Koa from 'koa';
import type { Middleware } from './types.ts';

/**
 * 请求体解析中间件
 */
export class BodyParser implements Middleware {
  apply(app: Koa): void {
    // 使用动态导入来避免类型问题
    app.use(async (ctx, next) => {
      if (ctx.request.method === 'POST' ||
          ctx.request.method === 'PUT' ||
          ctx.request.method === 'PATCH') {

        // 简单的JSON解析
        if (ctx.request.type === 'application/json') {
          try {
            const chunks: Buffer[] = [];

            ctx.req.on('data', (chunk) => {
              chunks.push(chunk);
            });

            await new Promise((resolve) => {
              ctx.req.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                try {
                  (ctx.request as any).body = JSON.parse(body);
                } catch {
                  (ctx.request as any).body = {};
                }
                resolve(void 0);
              });
            });
          } catch (error) {
            (ctx.request as any).body = {};
          }
        } else {
          (ctx.request as any).body = {};
        }
      }

      await next();
    });
  }
}
