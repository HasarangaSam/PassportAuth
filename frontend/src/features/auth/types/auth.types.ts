export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: true;
  message?: string;
  accessToken: string;
  user: User;
}

export interface ProfileResponse {
  success: true;
  user: User;
}

export interface MessageResponse {
  success: true;
  message: string;
}
