export type UserRole = 'Admin' | 'User';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
  accessToken: string;
  tokenType: string;
  expiresAt: string;
}
