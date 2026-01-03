import type Koa from 'koa';

export abstract class Middleware {
  abstract apply(app: Koa, options?: unknown): void;
}
