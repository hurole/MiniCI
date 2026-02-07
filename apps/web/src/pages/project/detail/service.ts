import { net } from '@utils';
import type {
  Branch,
  Commit,
  CreateDeploymentRequest,
  Deployment,
  Pipeline,
  Project,
  Step,
} from '../types';

class DetailService {
  async getProject(id: string) {
    const { data } = await net.request<Project>({
      url: `/api/projects/${id}`,
    });
    return data;
  }

  // 获取项目的所有流水线
  async getPipelines(projectId: number) {
    const { data } = await net.request<Pipeline[] | { list: Pipeline[] }>({
      url: '/api/pipelines',
      params: { projectId },
    });
    return Array.isArray(data) ? data : data.list;
  }

  // 获取可用的流水线模板
  async getPipelineTemplates() {
    const { data } = await net.request<
      | { id: number; name: string; description: string }[]
      | { list: { id: number; name: string; description: string }[] }
    >({
      url: '/api/pipelines/templates',
    });
    return Array.isArray(data) ? data : data.list;
  }

  async getDeployments(
    projectId: number,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const { data } = await net.request<DeploymentListResponse>({
      url: '/api/deployments',
      params: {
        projectId,
        page,
        pageSize,
      },
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
    const { data } = await net.request<Pipeline>({
      url: '/api/pipelines',
      method: 'POST',
      data: pipeline,
    });
    return data;
  }

  // 基于模板创建流水线
  async createPipelineFromTemplate(
    templateId: number,
    projectId: number,
    name: string,
    description?: string,
  ) {
    const { data } = await net.request<Pipeline>({
      url: '/api/pipelines/from-template',
      method: 'POST',
      data: {
        templateId,
        projectId,
        name,
        description,
      },
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
    const { data } = await net.request<Pipeline>({
      url: `/api/pipelines/${id}`,
      method: 'PUT',
      data: pipeline,
    });
    return data;
  }

  // 删除流水线
  async deletePipeline(id: number) {
    const { data } = await net.request<null>({
      url: `/api/pipelines/${id}`,
      method: 'DELETE',
    });
    return data;
  }

  // 获取流水线的所有步骤
  async getSteps(pipelineId: number) {
    const { data } = await net.request<Step[] | { list: Step[] }>({
      url: '/api/steps',
      params: { pipelineId },
    });
    return Array.isArray(data) ? data : data.list;
  }

  // 创建步骤
  async createStep(
    step: Omit<
      Step,
      'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'valid'
    >,
  ) {
    const { data } = await net.request<Step>({
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
    const { data } = await net.request<Step>({
      url: `/api/steps/${id}`,
      method: 'PUT',
      data: step,
    });
    return data;
  }

  // 删除步骤
  async deleteStep(id: number) {
    // DELETE请求返回204状态码，通过拦截器处理为成功响应
    const { data } = await net.request<null>({
      url: `/api/steps/${id}`,
      method: 'DELETE',
    });
    return data;
  }

  // 重新排序步骤
  async reorderSteps(ids: number[]) {
    const { data } = await net.request<{ success: boolean }>({
      url: '/api/steps/reorder',
      method: 'POST',
      data: { ids },
    });
    return data;
  }

  // 获取项目的提交记录
  async getCommits(
    projectId: number,
    branch?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const { data } = await net.request<Commit[] | { list: Commit[] }>({
      url: '/api/git/commits',
      params: {
        projectId,
        branch,
        page,
        limit,
      },
    });
    return Array.isArray(data) ? data : data.list;
  }

  // 获取项目的分支列表
  async getBranches(projectId: number) {
    const { data } = await net.request<Branch[] | { list: Branch[] }>({
      url: '/api/git/branches',
      params: { projectId },
    });
    return Array.isArray(data) ? data : data.list;
  }

  // 创建部署
  async createDeployment(deployment: CreateDeploymentRequest) {
    const { data } = await net.request<Deployment>({
      url: '/api/deployments',
      method: 'POST',
      data: deployment,
    });
    return data;
  }

  // 重新执行部署
  async retryDeployment(deploymentId: number) {
    const { data } = await net.request<Deployment>({
      url: `/api/deployments/${deploymentId}/retry`,
      method: 'POST',
    });
    return data;
  }

  // 获取项目详情（包含工作目录状态）
  async getProjectDetail(id: number) {
    const { data } = await net.request<Project>({
      url: `/api/projects/${id}`,
    });
    return data;
  }

  // 更新项目
  async updateProject(id: number, project: Partial<Project>) {
    const { data } = await net.request<Project>({
      url: `/api/projects/${id}`,
      method: 'PUT',
      data: project,
    });
    return data;
  }

  // 删除项目
  async deleteProject(id: number) {
    await net.request({
      url: `/api/projects/${id}`,
      method: 'DELETE',
    });
  }
}

export const detailService = new DetailService();

export interface DeploymentListResponse {
  list: Deployment[];
  page: number;
  pageSize: number;
  total: number;
}
