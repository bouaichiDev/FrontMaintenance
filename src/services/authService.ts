import { axiosClient } from './api/axiosClient';
import { AuthResponse, UserProfileDto } from '../types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  organizationName: string;
  adminUsername: string;
  adminPassword: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await axiosClient.post<AuthResponse>('/api/auth/login', data);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await axiosClient.post<AuthResponse>('/api/auth/register', data);
    return res.data;
  },

  async getProfile(): Promise<UserProfileDto> {
    const res = await axiosClient.get<UserProfileDto>('/api/user/profile');
    return res.data;
  }
};
