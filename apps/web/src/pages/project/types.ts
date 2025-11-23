enum BuildStatus {
  Idle = 'Pending',
  Running = 'Running',
  Stopped = 'Stopped',
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repository: string;
  valid: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  status: BuildStatus;
}

// 流水线步骤类型定义
export interface Step {
  id: number;
  name: string;
  description?: string;
  order: number;
  script: string; // 执行的脚本命令
  valid: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  pipelineId: number;
}

// 流水线类型定义
export interface Pipeline {
  id: number;
  name: string;
  description?: string;
  valid: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  projectId?: number;
  steps?: Step[];
}

export interface Deployment {
  id: number;
  branch: string;
  env?: string;
  status: string;
  commitHash?: string;
  commitMessage?: string;
  buildLog?: string;
  startedAt: string;
  finishedAt?: string;
  valid: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  projectId: number;
}

export interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
}

export interface Branch {
  name: string;
  commit: {
    id: string;
    message: string;
    url: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
}
