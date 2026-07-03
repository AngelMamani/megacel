export interface CustomerSessionOutput {
  authUid: string;
  platformUserId: string;
  code: string;
  name: string;
  email: string;
  role: 'cliente';
}

export interface LoginCustomerWithEmailInput {
  email: string;
  password: string;
}

export interface RegisterCustomerInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateCustomerProfileInput {
  platformUserId: string;
  name: string;
  phone?: string;
  address?: string;
  region?: string;
  documentType?: string;
  documentNumber?: string;
}
