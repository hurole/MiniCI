import { z } from 'zod';

export const getCommitsQuerySchema = z.object({
  projectId: z.coerce
    .number()
    .int()
    .positive({ message: 'Project ID is required' }),
  branch: z.string().optional(),
});

export const getBranchesQuerySchema = z.object({
  projectId: z.coerce
    .number()
    .int()
    .positive({ message: 'Project ID is required' }),
});

export type GetCommitsQuery = z.infer<typeof getCommitsQuerySchema>;
export type GetBranchesQuery = z.infer<typeof getBranchesQuerySchema>;
