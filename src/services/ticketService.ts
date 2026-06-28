import { axiosClient } from './api/axiosClient';
import { TicketDto, TicketLogDto, Page } from '../types';

export interface TicketParams {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface CreateTicketRequest {
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  equipmentId: number;
  dueDate?: string;
}

export interface UpdateStatusRequest {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolutionComment?: string;
}

export interface AssignTicketRequest {
  technicianId: number;
}

export const ticketService = {
  async getAll(params?: TicketParams): Promise<Page<TicketDto>> {
    const res = await axiosClient.get<Page<TicketDto>>('/api/tickets', { params });
    return res.data;
  },

  async getById(id: number): Promise<TicketDto> {
    const res = await axiosClient.get<TicketDto>(`/api/tickets/${id}`);
    return res.data;
  },

  async getLogs(id: number): Promise<TicketLogDto[]> {
    const res = await axiosClient.get<TicketLogDto[]>(`/api/tickets/${id}/logs`);
    return res.data;
  },

  async create(data: CreateTicketRequest): Promise<TicketDto> {
    const res = await axiosClient.post<TicketDto>('/api/tickets', data);
    return res.data;
  },

  async updateStatus(id: number, data: UpdateStatusRequest): Promise<TicketDto> {
    const res = await axiosClient.patch<TicketDto>(`/api/tickets/${id}/status`, data);
    return res.data;
  },

  async assignTechnician(id: number, data: AssignTicketRequest): Promise<TicketDto> {
    const res = await axiosClient.patch<TicketDto>(`/api/tickets/${id}/assign`, data);
    return res.data;
  },

  async uploadPhoto(id: number, file: File): Promise<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await axiosClient.post<{ photoUrl: string }>(`/api/tickets/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};
