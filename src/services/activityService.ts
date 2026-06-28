import { axiosClient } from './api/axiosClient';
import { ActivityLog, Page } from '../types';

export interface ActivityParams {
  type?: string; // Filter by entityType (e.g. USER, EQUIPMENT, TICKET)
  page?: number;
  size?: number;
}

export const activityService = {
  async getOrgActivity(params?: ActivityParams): Promise<Page<ActivityLog>> {
    const res = await axiosClient.get<Page<ActivityLog>>('/api/activity', { 
      params: { size: 20, ...params } 
    });
    return res.data;
  }
};
