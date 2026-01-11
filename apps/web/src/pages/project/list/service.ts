import { net } from '../../../utils';
import type { Project } from '../types';

class ProjectService {
  async list(params?: ProjectQueryParams) {
    const { data } = await net.request<Project[] | ProjectListResponse>({
      method: 'GET',
      url: '/api/projects',
      params,
    });
    return Array.isArray(data)
      ? { list: data, page: 1, pageSize: data.length, total: data.length }
      : data;
  }

  async show(id: string) {
    const { data } = await net.request<Project>({
      method: 'GET',
      url: `/api/projects/${id}`,
    });
    return data;
  }

  async create(project: {
    name: string;
    description?: string;
    repository: string;
  }) {
    const { data } = await net.request<Project>({
      method: 'POST',
      url: '/api/projects',
      data: project,
    });
    return data;
  }

  async update(
    id: string,
    project: Partial<{ name: string; description: string; repository: string }>,
  ) {
    const { data } = await net.request<Project>({
      method: 'PUT',
      url: `/api/projects/${id}`,
      data: project,
    });
    return data;
  }

  async delete(id: string) {
    await net.request({
      method: 'DELETE',
      url: `/api/projects/${id}`,
    });
    // DELETE 成功返回 204，无内容
  }
}

export const projectService = new ProjectService();

interface ProjectListResponse {
  list: Project[];
  page: number;
  pageSize: number;
  total: number;
}

interface ProjectQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
}
