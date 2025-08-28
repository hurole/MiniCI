import type { Context } from 'koa';
import prisma from '../libs/db.ts';

export async function list(ctx: Context) {
  const list = await prisma.application.findMany({
    where: {
      valid: 1,
    },
  });
  ctx.body = list;
}
