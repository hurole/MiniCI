// apps/server/controllers/git/dto.ts

export interface GetCommitsQuery {
  projectId: number;
  branch?: string;
  page?: number; // Added
  limit?: number; // Added
}

// Response structure remains the same (Array of Commits)
export type GetCommitsResponse = Commit[];

export interface Commit {
  url: string;
  sha: string;
  html_url: string;
  commit: {
    url: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      url: string;
      sha: string;
    };
    verification: {
      verified: boolean;
      reason: string;
      signature: string;
      payload: string;
    };
  };
  author: any;
  committer: any;
  parents: {
    url: string;
    sha: string;
  }[];
}
