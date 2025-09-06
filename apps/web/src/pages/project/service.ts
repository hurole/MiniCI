import { net, type APIResponse } from "@shared";
import type { Project } from "./types";

interface ProjectListResponse {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ProjectQueryParams {
  page?: number;
  limit?: number;
  name?: string;
}

class ProjectService {
  // GET /api/projects - 获取项目列表
  async list(params?: ProjectQueryParams) {
    const { data } = await net.request<APIResponse<ProjectListResponse>>({
      method: 'GET',
      url: '/api/projects',
      params,
    });
    return data;
  }

  // GET /api/projects/:id - 获取单个项目
  async show(id: string) {
    const { data } = await net.request<APIResponse<Project>>({
      method: 'GET',
      url: `/api/projects/${id}`,
    });
    return data;
  }

  // POST /api/projects - 创建项目
  async create(project: { name: string; description?: string; repository: string }) {
    const { data } = await net.request<APIResponse<Project>>({
      method: 'POST',
      url: '/api/projects',
      data: project,
    });
    return data;
  }

  // PUT /api/projects/:id - 更新项目
  async update(id: string, project: Partial<{ name: string; description: string; repository: string }>) {
    const { data } = await net.request<APIResponse<Project>>({
      method: 'PUT',
      url: `/api/projects/${id}`,
      data: project,
    });
    return data;
  }

  // DELETE /api/projects/:id - 删除项目
  async delete(id: string) {
    await net.request({
      method: 'DELETE',
      url: `/api/projects/${id}`,
    });
    // DELETE 成功返回 204，无内容
  }
}

export const projectService = new ProjectService();
