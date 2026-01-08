import { z } from 'zod';

export const loginSchema = z.object({
  code: z.string().min(1, { message: 'Code不能为空' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
