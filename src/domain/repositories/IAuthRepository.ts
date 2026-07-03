/** Sesión autenticada en Firebase Auth (sin rol de negocio). */
export interface AuthSession {
  id: string;
  name: string;
  email: string;
}

export interface IAuthRepository {
  loginWithEmail(email: string, password: string): Promise<AuthSession>;
  loginWithGoogle(): Promise<AuthSession>;
  registerWithEmail(email: string, password: string, displayName: string): Promise<AuthSession>;
  /** Crea cuenta en Firebase Auth sin alterar la sesión actual (p. ej. admin). */
  createUserWithEmail(email: string, password: string, displayName: string): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentSession(): AuthSession | null;
  updateDisplayName(name: string): Promise<void>;
  onSessionChange(callback: (session: AuthSession | null) => void): () => void;
}
