import { Controller, Get, Post } from '../../decorators/route.ts';
import type { Prisma } from '../../generated/client.ts';
import { prisma } from '../../libs/prisma.ts';
import type { Context } from 'koa';
import { listDeploymentsQuerySchema, createDeploymentSchema } from './dto.ts';

@Controller('/deployments')
export class DeploymentController {
  @Get('')
  async list(ctx: Context) {
    const { page, pageSize, projectId } = listDeploymentsQuerySchema.parse(ctx.query);
    const where: Prisma.DeploymentWhereInput = {
      valid: 1,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const result = await prisma.deployment.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await prisma.deployment.count({ where });

    return {
      data: result,
      page,
      pageSize,
      total,
    };
  }

  @Post('')
  async create(ctx: Context) {
    const body = createDeploymentSchema.parse(ctx.request.body);

    const result = await prisma.deployment.create({
      data: {
        branch: body.branch,
        commitHash: body.commitHash,
        commitMessage: body.commitMessage,
        status: 'pending',
        Project: {
          connect: { id: body.projectId },
        },
        pipelineId: body.pipelineId,
        env: body.env || 'dev',
        buildLog: '',
        createdBy: 'system', // TODO: get from user
        updatedBy: 'system',
        valid: 1,
      },
    });
    return result;
  }
}
