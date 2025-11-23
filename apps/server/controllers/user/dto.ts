import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive({ message: '用户ID必须是正整数' }),
});

export const createUserSchema = z.object({
  name: z.string().min(1, { message: '用户名不能为空' }),
  email: z.string().email({ message: '邮箱格式不正确' }),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const searchUserQuerySchema = z.object({
  keyword: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SearchUserQuery = z.infer<typeof searchUserQuerySchema>;
