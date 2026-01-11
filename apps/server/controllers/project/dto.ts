import { z } from 'zod';
import { projectDirSchema } from '../../libs/path-validator.js';

/**
 * 创建项目验证架构
 */
export const createProjectSchema = z.object({
  name: z
    .string({
      message: '项目名称必须是字符串',
    })
    .min(2, { message: '项目名称至少2个字符' })
    .max(50, { message: '项目名称不能超过50个字符' }),

  description: z
    .string({
      message: '项目描述必须是字符串',
    })
    .max(200, { message: '项目描述不能超过200个字符' })
    .optional(),

  repository: z
    .string({
      message: '仓库地址必须是字符串',
    })
    .url({ message: '请输入有效的仓库地址' })
    .min(1, { message: '仓库地址不能为空' }),

  projectDir: projectDirSchema,

  envPresets: z.string().optional(), // JSON 字符串格式
});

/**
 * 更新项目验证架构
 */
export const updateProjectSchema = z.object({
  name: z
    .string({
      message: '项目名称必须是字符串',
    })
    .min(2, { message: '项目名称至少2个字符' })
    .max(50, { message: '项目名称不能超过50个字符' })
    .optional(),

  description: z
    .string({
      message: '项目描述必须是字符串',
    })
    .max(200, { message: '项目描述不能超过200个字符' })
    .optional(),

  repository: z
    .string({
      message: '仓库地址必须是字符串',
    })
    .url({ message: '请输入有效的仓库地址' })
    .min(1, { message: '仓库地址不能为空' })
    .optional(),

  envPresets: z.string().optional(), // JSON 字符串格式
});

/**
 * 项目列表查询参数验证架构
 */
export const listProjectQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
    name: z.string().optional(),
  })
  .optional();

/**
 * 项目ID验证架构
 */
export const projectIdSchema = z.object({
  id: z.coerce.number().int().positive({ message: '项目 ID 必须是正整数' }),
});

// TypeScript 类型导出
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectQuery = z.infer<typeof listProjectQuerySchema>;
export type ProjectIdParams = z.infer<typeof projectIdSchema>;
