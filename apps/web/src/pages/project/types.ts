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
  valid: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  status: BuildStatus;
}
