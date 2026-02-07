import type { Context } from 'koa';
import { Controller, Delete, Get, Post, Put } from '../../decorators/route.ts';
import { log } from '../../libs/logger.ts';
import { prisma } from '../../libs/prisma.ts';
import { BusinessError } from '../../middlewares/exception.ts';
import {
  createProjectSchema,
  listProjectQuerySchema,
  projectIdSchema,
  updateProjectSchema,
} from './dto.ts';

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

    const isPagination =
      query?.page !== undefined && query?.pageSize !== undefined;

    const [total, projects] = await Promise.all([
      prisma.project.count({ where: whereCondition }),
      prisma.project.findMany({
        where: whereCondition,
        skip: isPagination ? (query.page! - 1) * query.pageSize! : 0,
        take: isPagination ? query.pageSize : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    if (isPagination) {
      return {
        list: projects,
        page: query.page,
        pageSize: query.pageSize,
        total,
      };
    }

    return projects;
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

    // 检查工作目录是否已被其他项目使用
    // const existingProject = await prisma.project.findFirst({
    //   where: {
    //     projectDir: validatedData.projectDir,
    //     valid: 1,
    //   },
    // });

    // if (existingProject) {
    //   throw new BusinessError('该工作目录已被其他项目使用', 1003, 400);
    // }

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || '',
        repository: validatedData.repository,
        projectDir: validatedData.projectDir,
        envPresets: validatedData.envPresets,
        createdBy: 'system',
        updatedBy: 'system',
        valid: 1,
      },
    });

    log.info(
      'project',
      'Created new project: %s with projectDir: %s',
      project.name,
      project.projectDir,
    );
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
    if (validatedData.envPresets !== undefined) {
      updateData.envPresets = validatedData.envPresets;
    }
    if (validatedData.webhookUrl !== undefined) {
      updateData.webhookUrl = validatedData.webhookUrl;
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
