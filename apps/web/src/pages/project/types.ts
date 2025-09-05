enum BuildStatus {
  Idle = "Pending",
  Running = "Running",
  Stopped = "Stopped",
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repository: string;
  env: Record<string, string>;
  createdAt: string;
  status: BuildStatus;
}
