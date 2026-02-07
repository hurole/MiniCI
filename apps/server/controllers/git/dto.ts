import { z } from 'zod';

export const getCommitsQuerySchema = z.object({
  projectId: z.coerce
    .number()
    .int()
    .positive({ message: 'Project ID is required' }),
  branch: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export const getBranchesQuerySchema = z.object({
  projectId: z.coerce
    .number()
    .int()
    .positive({ message: 'Project ID is required' }),
});

export type GetCommitsQuery = z.infer<typeof getCommitsQuerySchema>;
export type GetBranchesQuery = z.infer<typeof getBranchesQuerySchema>;
