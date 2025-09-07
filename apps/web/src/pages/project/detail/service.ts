import { net, type APIResponse } from '@shared';
import type { Project } from '../types';

class DetailService {
  async getProject(id: string) {
    const { code, data } = await net.request<APIResponse<Project>>({
      url: `/api/projects/${id}`,
    });
    return data;
  }
}

export const detailService = new DetailService();
