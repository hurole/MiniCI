enum BuildStatus {
  Idle = "Pending",
  Running = "Running",
  Stopped = "Stopped",
}

export interface Project {
  id: string;
  name: string;
  description: string;
  git: string;
  env: Record<string, string>;
  createdAt: string;
  status: BuildStatus;
}
