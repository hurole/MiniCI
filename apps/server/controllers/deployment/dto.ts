import { z } from 'zod';

export const listDeploymentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  projectId: z.coerce.number().int().positive().optional(),
});

export const createDeploymentSchema = z.object({
  projectId: z.number().int().positive({ message: '项目ID必须是正整数' }),
  pipelineId: z.number().int().positive({ message: '流水线ID必须是正整数' }),
  branch: z.string().min(1, { message: '分支不能为空' }),
  commitHash: z.string().min(1, { message: '提交哈希不能为空' }),
  commitMessage: z.string().min(1, { message: '提交信息不能为空' }),
  env: z.string().optional(),
});

export type ListDeploymentsQuery = z.infer<typeof listDeploymentsQuerySchema>;
export type CreateDeploymentInput = z.infer<typeof createDeploymentSchema>;
