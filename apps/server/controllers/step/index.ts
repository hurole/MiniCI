import type { Context } from 'koa';
import { prisma } from '../../libs/prisma.ts';
import { log } from '../../libs/logger.ts';
import { BusinessError } from '../../middlewares/exception.ts';
import { Controller, Get, Post, Put, Delete } from '../../decorators/route.ts';
import { z } from 'zod';

// 定义验证架构
const createStepSchema = z.object({
  name: z
    .string({
      message: '步骤名称必须是字符串',
    })
    .min(1, { message: '步骤名称不能为空' })
    .max(100, { message: '步骤名称不能超过100个字符' }),

  description: z
    .string({
      message: '步骤描述必须是字符串',
    })
    .max(500, { message: '步骤描述不能超过500个字符' })
    .optional(),

  order: z
    .number({
      message: '步骤顺序必须是数字',
    })
    .int()
    .min(0, { message: '步骤顺序必须是非负整数' }),

  script: z
    .string({
      message: '脚本命令必须是字符串',
    })
    .min(1, { message: '脚本命令不能为空' }),

  pipelineId: z
    .number({
      message: '流水线ID必须是数字',
    })
    .int()
    .positive({ message: '流水线ID必须是正整数' }),
});

const updateStepSchema = z.object({
  name: z
    .string({
      message: '步骤名称必须是字符串',
    })
    .min(1, { message: '步骤名称不能为空' })
    .max(100, { message: '步骤名称不能超过100个字符' })
    .optional(),

  description: z
    .string({
      message: '步骤描述必须是字符串',
    })
    .max(500, { message: '步骤描述不能超过500个字符' })
    .optional(),

  order: z
    .number({
      message: '步骤顺序必须是数字',
    })
    .int()
    .min(0, { message: '步骤顺序必须是非负整数' })
    .optional(),

  script: z
    .string({
      message: '脚本命令必须是字符串',
    })
    .min(1, { message: '脚本命令不能为空' })
    .optional(),
});

const stepIdSchema = z.object({
  id: z.coerce.number().int().positive({ message: '步骤 ID 必须是正整数' }),
});

const listStepsQuerySchema = z
  .object({
    pipelineId: z.coerce
      .number()
      .int()
      .positive({ message: '流水线ID必须是正整数' })
      .optional(),
    page: z.coerce
      .number()
      .int()
      .min(1, { message: '页码必须大于0' })
      .optional()
      .default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, { message: '每页数量必须大于0' })
      .max(100, { message: '每页数量不能超过100' })
      .optional()
      .default(10),
  })
  .optional();

// TypeScript 类型
type CreateStepInput = z.infer<typeof createStepSchema>;
type UpdateStepInput = z.infer<typeof updateStepSchema>;
type StepIdParams = z.infer<typeof stepIdSchema>;
type ListStepsQuery = z.infer<typeof listStepsQuerySchema>;

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

    const [total, steps] = await Promise.all([
      prisma.step.count({ where: whereCondition }),
      prisma.step.findMany({
        where: whereCondition,
        skip: query ? (query.page - 1) * query.limit : 0,
        take: query?.limit,
        orderBy: {
          order: 'asc',
        },
      }),
    ]);

    return {
      data: steps,
      pagination: {
        page: query?.page || 1,
        limit: query?.limit || 10,
        total,
        totalPages: Math.ceil(total / (query?.limit || 10)),
      },
    };
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
        description: validatedData.description || '',
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
