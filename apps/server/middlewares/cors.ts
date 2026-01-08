import cors from '@koa/cors';
import type Koa from 'koa';
import type { Middleware } from './types.ts';

export class CORS implements Middleware {
  apply(app: Koa) {
    app.use(
      cors({
        credentials: true,
        allowHeaders: ['Content-Type'],
        origin(ctx) {
          return ctx.get('Origin') || '*';
        },
      }),
    );
  }
}
