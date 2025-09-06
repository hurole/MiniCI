import { net, type APIResponse } from '@shared';
import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  active: boolean;
}

interface GlobalStore {
  user: User | null;
  refreshUser: () => Promise<void>;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  user: null,
  async refreshUser() {
    const { data } = await net.request<APIResponse<User>>({
      method: 'GET',
      url: '/api/auth/info',
    });
    set({ user: data });
  },
}));
