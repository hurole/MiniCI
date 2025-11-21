import { Controller, Get, Post } from '../../decorators/route.ts';
import type { Prisma } from '../../generated/prisma/index.js';
import { prisma } from '../../libs/prisma.ts';
import type { Context } from 'koa';

@Controller('/deployments')
export class DeploymentController {
  @Get('')
  async list(ctx: Context) {
    const { page = 1, pageSize = 10 } = ctx.query;
    const result = await prisma.deployment.findMany({
      where: {
        valid: 1,
      },
      take: Number(pageSize),
      skip: (Number(page) - 1) * Number(pageSize),
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await prisma.deployment.count();

    return {
      data: result,
      page: Number(page),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  @Post('')
  async create(ctx: Context) {
    const body = ctx.request.body as Prisma.DeploymentCreateInput;

    prisma.deployment.create({
      data: {
        branch: body.branch,
        commitHash: body.commitHash,
        commitMessage: body.commitMessage,

        valid: 1,
      },
    });
  }
}
