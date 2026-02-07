import type { User } from '@pages/login/types';
import { net } from '@utils';
import { create } from 'zustand';
import type { GlobalStore } from './types';

export const useGlobalStore = create<GlobalStore>((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  async refreshUser() {
    const { data } = await net.request<User>({
      method: 'GET',
      url: '/api/auth/info',
    });
    set({ user: data });
  },
}));
