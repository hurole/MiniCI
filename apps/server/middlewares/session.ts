import type Koa from 'koa';
import session from 'koa-session';
import type { Middleware } from './types.ts';

export class Session implements Middleware {
  apply(app: Koa): void {
    app.keys = ['mini-ci'];
    app.use(
      session(
        {
          key: 'mini-ci.sid',
          maxAge: 3600000,
          autoCommit: true /** (boolean) automatically commit headers (default true) */,
          overwrite: true /** (boolean) can overwrite or not (default true) */,
          httpOnly: true /** (boolean) httpOnly or not (default true) */,
          signed: true /** (boolean) signed or not (default true) */,
          rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
          renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/,
        },
        app,
      ),
    );
  }
}
