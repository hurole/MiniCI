import type { Context } from 'koa';
import { Controller, Delete, Get, Post, Put } from '../../decorators/route.ts';
import { log } from '../../libs/logger.ts';
import { prisma } from '../../libs/prisma.ts';
import { BusinessError } from '../../middlewares/exception.ts';
import {
  createStepSchema,
  listStepsQuerySchema,
  stepIdSchema,
  updateStepSchema,
} from './dto.ts';

@Controller('/steps')
export class StepController {
  // GET /api/steps - 获取步骤列表
  @Get('')
  async list(ctx: Context) {
    const query = listStepsQuerySchema.parse(ctx.query);

    const whereCondition: any = {
      valid: 1,
    };

    // 如果提供了流水线ID参数
    if (query?.pipelineId) {
      whereCondition.pipelineId = query.pipelineId;
    }

    const isPagination = query?.page !== undefined && query?.pageSize !== undefined;

    const [total, steps] = await Promise.all([
      prisma.step.count({ where: whereCondition }),
      prisma.step.findMany({
        where: whereCondition,
        skip: isPagination ? (query.page! - 1) * query.pageSize! : 0,
        take: isPagination ? query.pageSize : undefined,
        orderBy: {
          order: 'asc',
        },
      }),
    ]);

    if (isPagination) {
      return {
        list: steps,
        page: query.page,
        pageSize: query.pageSize,
        total,
      };
    }

    return steps;
  }

  // GET /api/steps/:id - 获取单个步骤
  @Get(':id')
  async show(ctx: Context) {
    const { id } = stepIdSchema.parse(ctx.params);

    const step = await prisma.step.findFirst({
      where: {
        id,
        valid: 1,
      },
    });

    if (!step) {
      throw new BusinessError('步骤不存在', 2001, 404);
    }

    return step;
  }

  // POST /api/steps - 创建步骤
  @Post('')
  async create(ctx: Context) {
    const validatedData = createStepSchema.parse(ctx.request.body);

    // 检查关联的流水线是否存在
    const pipeline = await prisma.pipeline.findFirst({
      where: {
        id: validatedData.pipelineId,
        valid: 1,
      },
    });

    if (!pipeline) {
      throw new BusinessError('关联的流水线不存在', 2002, 404);
    }

    const step = await prisma.step.create({
      data: {
        name: validatedData.name,
        order: validatedData.order,
        script: validatedData.script,
        pipelineId: validatedData.pipelineId,
        createdBy: 'system',
        updatedBy: 'system',
        valid: 1,
      },
    });

    log.info('step', 'Created new step: %s', step.name);
    return step;
  }

  // PUT /api/steps/:id - 更新步骤
  @Put(':id')
  async update(ctx: Context) {
    const { id } = stepIdSchema.parse(ctx.params);
    const validatedData = updateStepSchema.parse(ctx.request.body);

    // 检查步骤是否存在
    const existingStep = await prisma.step.findFirst({
      where: {
        id,
        valid: 1,
      },
    });

    if (!existingStep) {
      throw new BusinessError('步骤不存在', 2001, 404);
    }

    // 只更新提供的字段
    const updateData: any = {
      updatedBy: 'system',
    };

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    if (validatedData.order !== undefined) {
      updateData.order = validatedData.order;
    }
    if (validatedData.script !== undefined) {
      updateData.script = validatedData.script;
    }

    const step = await prisma.step.update({
      where: { id },
      data: updateData,
    });

    log.info('step', 'Updated step: %s', step.name);
    return step;
  }

  // DELETE /api/steps/:id - 删除步骤（软删除）
  @Delete(':id')
  async destroy(ctx: Context) {
    const { id } = stepIdSchema.parse(ctx.params);

    // 检查步骤是否存在
    const existingStep = await prisma.step.findFirst({
      where: {
        id,
        valid: 1,
      },
    });

    if (!existingStep) {
      throw new BusinessError('步骤不存在', 2001, 404);
    }

    // 软删除：将 valid 设置为 0
    await prisma.step.update({
      where: { id },
      data: {
        valid: 0,
        updatedBy: 'system',
      },
    });

    log.info('step', 'Deleted step: %s', existingStep.name);

    // RESTful 删除成功返回 204 No Content
    ctx.status = 204;
    return null;
  }
}
