import type { Context } from 'koa';
import { Controller, Get, Post } from '../../decorators/route.ts';
import type { Prisma } from '../../generated/client.ts';
import { ExecutionQueue } from '../../libs/execution-queue.ts';
import { prisma } from '../../libs/prisma.ts';
import { createDeploymentSchema, listDeploymentsQuerySchema } from './dto.ts';

@Controller('/deployments')
export class DeploymentController {
  @Get('')
  async list(ctx: Context) {
    const { page, pageSize, projectId } = listDeploymentsQuerySchema.parse(
      ctx.query,
    );
    const where: Prisma.DeploymentWhereInput = {
      valid: 1,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const isPagination = page !== undefined && pageSize !== undefined;

    const result = await prisma.deployment.findMany({
      where,
      take: isPagination ? pageSize : undefined,
      skip: isPagination ? (page! - 1) * pageSize! : 0,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await prisma.deployment.count({ where });

    if (isPagination) {
      return {
        list: result,
        page,
        pageSize,
        total,
      };
    }

    return result;
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
        envVars: body.envVars ? JSON.stringify(body.envVars) : null,
        buildLog: '',
        createdBy: 'system', // TODO: get from user
        updatedBy: 'system',
        valid: 1,
      },
    });

    // 将新创建的部署任务添加到执行队列
    const executionQueue = ExecutionQueue.getInstance();
    await executionQueue.addTask(result.id, result.pipelineId);

    return result;
  }

  // 添加重新执行部署的接口
  @Post('/:id/retry')
  async retry(ctx: Context) {
    const { id } = ctx.params;

    // 获取原始部署记录
    const originalDeployment = await prisma.deployment.findUnique({
      where: { id: Number(id) },
    });

    if (!originalDeployment) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '部署记录不存在',
        data: null,
        timestamp: Date.now(),
      };
      return;
    }

    // 创建一个新的部署记录，复制原始记录的信息
    const newDeployment = await prisma.deployment.create({
      data: {
        branch: originalDeployment.branch,
        commitHash: originalDeployment.commitHash,
        commitMessage: originalDeployment.commitMessage,
        status: 'pending',
        projectId: originalDeployment.projectId,
        pipelineId: originalDeployment.pipelineId,
        envVars: originalDeployment.envVars,
        buildLog: '',
        createdBy: 'system',
        updatedBy: 'system',
        valid: 1,
      },
    });

    // 将新创建的部署任务添加到执行队列
    const executionQueue = ExecutionQueue.getInstance();
    await executionQueue.addTask(newDeployment.id, newDeployment.pipelineId);

    ctx.body = {
      code: 0,
      message: '重新执行任务已创建',
      data: newDeployment,
      timestamp: Date.now(),
    };
  }
}
