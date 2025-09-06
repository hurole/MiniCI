import type { APIResponse } from '@shared';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  active: boolean;
}

export type AuthURLResponse = APIResponse<{
  url: string;
}>;

export type AuthLoginResponse = APIResponse<User>;
