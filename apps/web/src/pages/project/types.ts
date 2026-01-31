enum BuildStatus {
  Idle = 'Pending',
  Running = 'Running',
  Stopped = 'Stopped',
}

// 工作目录状态枚举
export enum WorkspaceDirStatus {
  NOT_CREATED = 'not_created',
  EMPTY = 'empty',
  NO_GIT = 'no_git',
  READY = 'ready',
}

// Git 仓库信息
export interface GitInfo {
  branch?: string;
  lastCommit?: string;
  lastCommitMessage?: string;
}

// 工作目录状态信息
export interface WorkspaceStatus {
  status: WorkspaceDirStatus;
  exists: boolean;
  isEmpty?: boolean;
  hasGit?: boolean;
  size?: number;
  gitInfo?: GitInfo;
  error?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repository: string;
  projectDir: string; // 项目工作目录路径（必填）
  envPresets?: string; // 环境预设配置（JSON格式）
  webhookUrl?: string; // Webhook 通知地址
  valid: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  status: BuildStatus;
  workspaceStatus?: WorkspaceStatus; // 工作目录状态信息
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
  envVars?: string; // JSON 字符串
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

// 创建部署请求的类型定义
export interface CreateDeploymentRequest {
  projectId: number;
  pipelineId: number;
  branch: string;
  commitHash: string;
  commitMessage: string;
  envVars?: Record<string, string>; // 环境变量 key-value 对象
}
