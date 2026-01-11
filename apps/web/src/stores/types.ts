interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  active: boolean;
}

export interface GlobalStore {
  user: User | null;
  setUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}