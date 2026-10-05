import api from "../../../api/axios.js";

import type {
  AuthResponse,
  ChangePasswordInput,
  LoginInput,
  MessageResponse,
  ProfileResponse,
  RegisterInput,
} from "../types/auth.types.js";

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", input);

  return response.data;
};

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", input);

  return response.data;
};

export const refreshAccessToken = async (): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/refresh");

  return response.data;
};

export const logout = async (): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>("/auth/logout");

  return response.data;
};

export const logoutAllDevices = async (): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>("/auth/logout-all");

  return response.data;
};

export const changePassword = async (
  input: ChangePasswordInput,
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>(
    "/auth/change-password",
    input,
  );

  return response.data;
};

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>("/auth/profile");

  return response.data;
};

export const exchangeGoogleCode = async (
  code: string,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/google/exchange", {
    code,
  });

  return response.data;
};
