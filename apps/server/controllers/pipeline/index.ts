import type { Context } from 'koa';
import { Controller, Delete, Get, Post, Put } from '../../decorators/route.ts';
import { log } from '../../libs/logger.ts';
import {
  createPipelineFromTemplate,
  getAvailableTemplates,
} from '../../libs/pipeline-template.ts';
import { prisma } from '../../libs/prisma.ts';
import { BusinessError } from '../../middlewares/exception.ts';
import {
  createPipelineSchema,
  listPipelinesQuerySchema,
  pipelineIdSchema,
  updatePipelineSchema,
} from './dto.ts';

@Controller('/pipelines')
export class PipelineController {
  // GET /api/pipelines - 获取流水线列表
  @Get('')
  async list(ctx: Context) {
    const query = listPipelinesQuerySchema.parse(ctx.query);

    const whereCondition: any = {
      valid: 1,
    };

    // 如果提供了项目ID参数
    if (query?.projectId) {
      whereCondition.projectId = query.projectId;
    }

    const pipelines = await prisma.pipeline.findMany({
      where: whereCondition,
      include: {
        steps: {
          where: {
            valid: 1,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return pipelines;
  }

  // GET /api/pipelines/templates - 获取可用的流水线模板
  @Get('/templates')
  async getTemplates(_ctx: Context) {
    try {
      const templates = await getAvailableTemplates();
      return templates;
    } catch (error) {
      log.error('pipeline', 'Failed to get templates:', error);
      throw new BusinessError('获取模板失败', 3002, 500);
    }
  }

  // GET /api/pipelines/:id - 获取单个流水线
  @Get('/:id')
  async get(ctx: Context) {
    const { id } = pipelineIdSchema.parse(ctx.params);

    const pipeline = await prisma.pipeline.findFirst({
      where: {
        id,
        valid: 1,
      },
      include: {
        steps: {
          where: {
            valid: 1,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!pipeline) {
      throw new BusinessError('流水线不存在', 3001, 404);
    }

    return pipeline;
  }

  // POST /api/pipelines - 创建流水线
  @Post('')
  async create(ctx: Context) {
    const validatedData = createPipelineSchema.parse(ctx.request.body);

    const pipeline = await prisma.pipeline.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || '',
        projectId: validatedData.projectId,
        createdBy: 'system',
        updatedBy: 'system',
        valid: 1,
      },
    });

    log.info('pipeline', 'Created new pipeline: %s', pipeline.name);
    return pipeline;
  }

  // POST /api/pipelines/from-template - 基于模板创建流水线
  @Post('/from-template')
  async createFromTemplate(ctx: Context) {
    try {
      const { templateId, projectId, name, description } = ctx.request.body as {
        templateId: number;
        projectId: number;
        name: string;
        description?: string;
      };

      // 验证必要参数
      if (!templateId || !projectId || !name) {
        throw new BusinessError('缺少必要参数', 3003, 400);
      }

      // 基于模板创建流水线
      const newPipelineId = await createPipelineFromTemplate(
        templateId,
        projectId,
        name,
        description || '',
      );

      // 返回新创建的流水线
      const pipeline = await prisma.pipeline.findUnique({
        where: { id: newPipelineId },
        include: {
          steps: {
            where: {
              valid: 1,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (!pipeline) {
        throw new BusinessError('创建流水线失败', 3004, 500);
      }

      log.info('pipeline', 'Created pipeline from template: %s', pipeline.name);
      return pipeline;
    } catch (error) {
      log.error('pipeline', 'Failed to create pipeline from template:', error);
      if (error instanceof BusinessError) {
        throw error;
      }
      throw new BusinessError('基于模板创建流水线失败', 3005, 500);
    }
  }

  // PUT /api/pipelines/:id - 更新流水线
  @Put('/:id')
  async update(ctx: Context) {
    const { id } = pipelineIdSchema.parse(ctx.params);
    const validatedData = updatePipelineSchema.parse(ctx.request.body);

    // 检查流水线是否存在
    const existingPipeline = await prisma.pipeline.findFirst({
      where: {
        id,
        valid: 1,
      },
    });

    if (!existingPipeline) {
      throw new BusinessError('流水线不存在', 3001, 404);
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

    const pipeline = await prisma.pipeline.update({
      where: { id },
      data: updateData,
    });

    log.info('pipeline', 'Updated pipeline: %s', pipeline.name);
    return pipeline;
  }

  // DELETE /api/pipelines/:id - 删除流水线（软删除）
  @Delete('/:id')
  async destroy(ctx: Context) {
    const { id } = pipelineIdSchema.parse(ctx.params);

    // 检查流水线是否存在
    const existingPipeline = await prisma.pipeline.findFirst({
      where: {
        id,
        valid: 1,
      },
    });

    if (!existingPipeline) {
      throw new BusinessError('流水线不存在', 3001, 404);
    }

    // 软删除：将 valid 设置为 0
    await prisma.pipeline.update({
      where: { id },
      data: {
        valid: 0,
        updatedBy: 'system',
      },
    });

    // 同时软删除关联的步骤
    await prisma.step.updateMany({
      where: { pipelineId: id },
      data: {
        valid: 0,
        updatedBy: 'system',
      },
    });

    log.info('pipeline', 'Deleted pipeline: %s', existingPipeline.name);

    // RESTful 删除成功返回 204 No Content
    ctx.status = 204;
    return null;
  }
}
