export interface CustomerAuthUser {
  authUid: string;
  platformUserId: string;
  code: string;
  name: string;
  email: string;
  role: 'cliente';
}

export interface CustomerAuthContextValue {
  user: CustomerAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
}
