import type { Context } from 'koa';
import {prisma} from '../../libs/prisma.ts';
import { log } from '../../libs/logger.ts';
import { BusinessError } from '../../middlewares/exception.ts';
import { Controller, Get, Post, Put, Delete } from '../../decorators/route.ts';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectQuerySchema,
  projectIdSchema,
} from './schema.ts';

@Controller('/projects')
export class ProjectController {
  // GET /api/projects - 获取项目列表
  @Get('')
  async list(ctx: Context) {
    const query = listProjectQuerySchema.parse(ctx.query);

    const whereCondition: any = {
      valid: 1,
    };

    // 如果提供了名称搜索参数
    if (query?.name) {
      whereCondition.name = {
        contains: query.name,
      };
    }

    const [total, projects] = await Promise.all([
      prisma.project.count({ where: whereCondition }),
      prisma.project.findMany({
        where: whereCondition,
        skip: query ? (query.page - 1) * query.limit : 0,
        take: query?.limit,
        orderBy: {
          createdAt: 'desc',
        },
      })
    ]);

    return {
      data: projects,
      pagination: {
        page: query?.page || 1,
        limit: query?.limit || 10,
        total,
        totalPages: Math.ceil(total / (query?.limit || 10)),
      }
    };
  }

  // GET /api/projects/:id - 获取单个项目
  @Get(':id')
  async show(ctx: Context) {
    const { id } = projectIdSchema.parse(ctx.params);

    const project = await prisma.project.findFirst({
      where: {
        id,
        valid: 1,
      },
    });

    if (!project) {
      throw new BusinessError('项目不存在', 1002, 404);
    }

    return project;
  }

  // POST /api/projects - 创建项目
  @Post('')
  async create(ctx: Context) {
    const validatedData = createProjectSchema.parse(ctx.request.body);

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || '',
        repository: validatedData.repository,
        createdBy: 'system',
        updatedBy: 'system',
        valid: 1,
      },
    });

    log.info('project', 'Created new project: %s', project.name);
    return project;
  }

  // PUT /api/projects/:id - 更新项目
  @Put(':id')
  async update(ctx: Context) {
    const { id } = projectIdSchema.parse(ctx.params);
    const validatedData = updateProjectSchema.parse(ctx.request.body);

    // 检查项目是否存在
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        valid: 1,
      },
    });

    if (!existingProject) {
      throw new BusinessError('项目不存在', 1002, 404);
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
    if (validatedData.repository !== undefined) {
      updateData.repository = validatedData.repository;
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    log.info('project', 'Updated project: %s', project.name);
    return project;
  }

  // DELETE /api/projects/:id - 删除项目（软删除）
  @Delete(':id')
  async destroy(ctx: Context) {
    const { id } = projectIdSchema.parse(ctx.params);

    // 检查项目是否存在
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        valid: 1,
      },
    });

    if (!existingProject) {
      throw new BusinessError('项目不存在', 1002, 404);
    }

    // 软删除：将 valid 设置为 0
    await prisma.project.update({
      where: { id },
      data: {
        valid: 0,
        updatedBy: 'system',
      },
    });

    log.info('project', 'Deleted project: %s', existingProject.name);

    // RESTful 删除成功返回 204 No Content
    ctx.status = 204;
    return null;
  }
}
