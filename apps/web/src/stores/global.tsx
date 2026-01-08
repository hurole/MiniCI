import { type APIResponse, net } from '@shared';
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
  setUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  async refreshUser() {
    const { data } = await net.request<APIResponse<User>>({
      method: 'GET',
      url: '/api/auth/info',
    });
    set({ user: data });
  },
}));
