enum AppStatus {
  Idle = "Pending",
  Running = "Running",
  Stopped = "Stopped",
}

export interface Application {
  id: string;
  name: string;
  description: string;
  git: string;
  env: Record<string, string>;
  createdAt: string;
  status: AppStatus;
}
