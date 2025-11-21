import { type APIResponse, net } from '@shared';
import type { Pipeline, Project, Step } from '../types';

class DetailService {
  async getProject(id: string) {
    const { data } = await net.request<APIResponse<Project>>({
      url: `/api/projects/${id}`,
    });
    return data;
  }

  // 获取项目的所有流水线
  async getPipelines(projectId: number) {
    const { data } = await net.request<APIResponse<Pipeline[]>>({
      url: `/api/pipelines?projectId=${projectId}`,
    });
    return data;
  }

  // 创建流水线
  async createPipeline(
    pipeline: Omit<
      Pipeline,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'createdBy'
      | 'updatedBy'
      | 'valid'
      | 'steps'
    >,
  ) {
    const { data } = await net.request<APIResponse<Pipeline>>({
      url: '/api/pipelines',
      method: 'POST',
      data: pipeline,
    });
    return data;
  }

  // 更新流水线
  async updatePipeline(
    id: number,
    pipeline: Partial<
      Omit<
        Pipeline,
        | 'id'
        | 'createdAt'
        | 'updatedAt'
        | 'createdBy'
        | 'updatedBy'
        | 'valid'
        | 'steps'
      >
    >,
  ) {
    const { data } = await net.request<APIResponse<Pipeline>>({
      url: `/api/pipelines/${id}`,
      method: 'PUT',
      data: pipeline,
    });
    return data;
  }

  // 删除流水线
  async deletePipeline(id: number) {
    const { data } = await net.request<APIResponse<null>>({
      url: `/api/pipelines/${id}`,
      method: 'DELETE',
    });
    return data;
  }

  // 获取流水线的所有步骤
  async getSteps(pipelineId: number) {
    const { data } = await net.request<APIResponse<Step[]>>({
      url: `/api/steps?pipelineId=${pipelineId}`,
    });
    return data;
  }

  // 创建步骤
  async createStep(
    step: Omit<
      Step,
      'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'valid'
    >,
  ) {
    const { data } = await net.request<APIResponse<Step>>({
      url: '/api/steps',
      method: 'POST',
      data: step,
    });
    return data;
  }

  // 更新步骤
  async updateStep(
    id: number,
    step: Partial<
      Omit<
        Step,
        'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'valid'
      >
    >,
  ) {
    const { data } = await net.request<APIResponse<Step>>({
      url: `/api/steps/${id}`,
      method: 'PUT',
      data: step,
    });
    return data;
  }

  // 删除步骤
  async deleteStep(id: number) {
    const { data } = await net.request<APIResponse<null>>({
      url: `/api/steps/${id}`,
      method: 'DELETE',
    });
    return data;
  }
}

export const detailService = new DetailService();
