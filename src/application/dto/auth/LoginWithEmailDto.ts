export interface LoginWithEmailInput {
  email: string;
  password: string;
}

export interface LoginWithEmailOutput {
  sessionId: string;
  name: string;
  email: string;
}
