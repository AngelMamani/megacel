export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}


