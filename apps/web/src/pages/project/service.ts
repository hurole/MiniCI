import { net, type APIResponse } from "@shared";
import type { Project } from "./types";


class ProjectService {

  async list() {
    const { data } = await net.request<APIResponse<Project[]>>({
      method: 'GET',
      url: '/api/project/list',
    })
    return data;
  }
}

export const projectService = new ProjectService();
