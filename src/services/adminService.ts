import { axiosClient } from './api/axiosClient';
import { Organization, UserProfileDto, TicketDto, PlatformStatsDto, Page } from '../types';

export interface AdminOrgParams {
  active?: boolean;
  search?: string;
  page?: number;
  size?: number;
}

export interface CreateOrganizationRequest {
  organizationName: string;
  adminUsername: string;
  adminPassword: string;
}

export const adminService = {
  async getOrganizations(params?: AdminOrgParams): Promise<Page<Organization>> {
    const res = await axiosClient.get<Page<Organization>>('/api/admin/organizations', { params });
    return res.data;
  },

  async createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    const res = await axiosClient.post<Organization>('/api/admin/organizations', data);
    return res.data;
  },

  async getOrganizationDetails(id: number): Promise<Organization> {
    const res = await axiosClient.get<Organization>(`/api/admin/organizations/${id}`);
    return res.data;
  },

  async toggleOrganizationStatus(id: number, data: { active: boolean }): Promise<Organization> {
    const res = await axiosClient.patch<Organization>(`/api/admin/organizations/${id}/status`, data);
    return res.data;
  },

  async getOrganizationUsers(id: number): Promise<UserProfileDto[]> {
    const res = await axiosClient.get<UserProfileDto[]>(`/api/admin/organizations/${id}/users`);
    return res.data;
  },

  async getOrganizationTickets(id: number, params?: { page?: number; size?: number }): Promise<Page<TicketDto>> {
    const res = await axiosClient.get<Page<TicketDto>>(`/api/admin/organizations/${id}/tickets`, { params });
    return res.data;
  },

  async getPlatformStats(): Promise<PlatformStatsDto> {
    const res = await axiosClient.get<PlatformStatsDto>('/api/admin/stats');
    return res.data;
  },

  async getRecentPlatformActivity(): Promise<any[]> {
    const res = await axiosClient.get<any[]>('/api/admin/activity');
    return res.data;
  }
};
