import { z } from 'zod';

// 定义验证架构
export const createPipelineSchema = z.object({
  name: z
    .string({
      message: '流水线名称必须是字符串',
    })
    .min(1, { message: '流水线名称不能为空' })
    .max(100, { message: '流水线名称不能超过100个字符' }),

  description: z
    .string({
      message: '流水线描述必须是字符串',
    })
    .max(500, { message: '流水线描述不能超过500个字符' })
    .optional(),

  projectId: z
    .number({
      message: '项目ID必须是数字',
    })
    .int()
    .positive({ message: '项目ID必须是正整数' })
    .optional(),
});

export const updatePipelineSchema = z.object({
  name: z
    .string({
      message: '流水线名称必须是字符串',
    })
    .min(1, { message: '流水线名称不能为空' })
    .max(100, { message: '流水线名称不能超过100个字符' })
    .optional(),

  description: z
    .string({
      message: '流水线描述必须是字符串',
    })
    .max(500, { message: '流水线描述不能超过500个字符' })
    .optional(),
});

export const pipelineIdSchema = z.object({
  id: z.coerce.number().int().positive({ message: '流水线 ID 必须是正整数' }),
});

export const listPipelinesQuerySchema = z
  .object({
    projectId: z.coerce
      .number()
      .int()
      .positive({ message: '项目ID必须是正整数' })
      .optional(),
  })
  .optional();

// 类型
export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;
export type PipelineIdParams = z.infer<typeof pipelineIdSchema>;
export type ListPipelinesQuery = z.infer<typeof listPipelinesQuerySchema>;
