import { z } from 'zod';

// 定义验证架构
export const createStepSchema = z.object({
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

export const updateStepSchema = z.object({
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

export const stepIdSchema = z.object({
  id: z.coerce.number().int().positive({ message: '步骤 ID 必须是正整数' }),
});

export const listStepsQuerySchema = z
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
      .optional(),
    pageSize: z.coerce
      .number()
      .int()
      .min(1, { message: '每页数量必须大于0' })
      .max(100, { message: '每页数量不能超过100' })
      .optional(),
  })
  .optional();

export const reorderStepsSchema = z.object({
  ids: z
    .array(z.number().int().positive())
    .min(1, { message: '步骤ID列表不能为空' }),
});

// TypeScript 类型
export type CreateStepInput = z.infer<typeof createStepSchema>;
export type UpdateStepInput = z.infer<typeof updateStepSchema>;
export type StepIdParams = z.infer<typeof stepIdSchema>;
export type ListStepsQuery = z.infer<typeof listStepsQuerySchema>;
export type ReorderStepsInput = z.infer<typeof reorderStepsSchema>;
