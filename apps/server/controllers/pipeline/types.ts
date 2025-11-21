import type { z } from 'zod';
import type {
  createPipelineSchema,
  updatePipelineSchema,
  pipelineIdSchema,
  listPipelinesQuerySchema
} from './schema.js';

// TypeScript 类型
export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;
export type PipelineIdParams = z.infer<typeof pipelineIdSchema>;
export type ListPipelinesQuery = z.infer<typeof listPipelinesQuerySchema>;
