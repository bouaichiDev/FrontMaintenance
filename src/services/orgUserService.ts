import { axiosClient } from './api/axiosClient';
import { UserProfileDto, Page } from '../types';

export interface OrgUserParams {
  role?: string;
  active?: boolean;
  search?: string;
  page?: number;
  size?: number;
}

export interface CreateUserRequest {
  username: string;
  password?: string;
  role: 'ADMIN' | 'TECH' | 'USER';
}

export interface UpdateUserRoleRequest {
  role: 'ADMIN' | 'TECH' | 'USER';
}

export interface UpdateActiveRequest {
  active: boolean;
}

export const orgUserService = {
  async getAll(params?: OrgUserParams): Promise<Page<UserProfileDto>> {
    const res = await axiosClient.get<Page<UserProfileDto>>('/api/org/users', { params });
    return res.data;
  },

  async create(data: CreateUserRequest): Promise<UserProfileDto> {
    const res = await axiosClient.post<UserProfileDto>('/api/org/users', data);
    return res.data;
  },

  async updateRole(id: number, data: UpdateUserRoleRequest): Promise<UserProfileDto> {
    const res = await axiosClient.patch<UserProfileDto>(`/api/org/users/${id}/role`, data);
    return res.data;
  },

  async updateStatus(id: number, data: UpdateActiveRequest): Promise<UserProfileDto> {
    const res = await axiosClient.patch<UserProfileDto>(`/api/org/users/${id}/status`, data);
    return res.data;
  }
};
