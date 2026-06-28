import { axiosClient } from './api/axiosClient';
import { DashboardStatsDto, PersonalDashboardDto } from '../types';

export const dashboardService = {
  async getOrgStats(): Promise<DashboardStatsDto> {
    const res = await axiosClient.get<DashboardStatsDto>('/api/dashboard/stats');
    return res.data;
  },

  async getMyStats(): Promise<PersonalDashboardDto> {
    const res = await axiosClient.get<PersonalDashboardDto>('/api/dashboard/my');
    return res.data;
  }
};
