import type { Context } from 'koa';
import { Controller, Get, Post } from '../../decorators/route.ts';
import prisma from '../../libs/db.ts';

@Controller('/pipelines')
export class PipelineController {
  @Get('/:id')
  async get(ctx: Context) {
    const id = ctx.params.id;
    const pipeline = await prisma.pipeline.findUnique({
      where: {
        id: id,
      },
    });
    return pipeline;
  }

  @Post('')
  async create(ctx: Context) {

  }
}
