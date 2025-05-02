export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  refreshToken?: string;
}

export interface ResetPasswordInput {
  email: string;
}

export interface ConfirmResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ResetPasswordToken {
  id: string;
  token: string;
  expiresAt: Date;
  userId: string;
  createdAt: Date;
}