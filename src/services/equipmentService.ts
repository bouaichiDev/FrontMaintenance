import { axiosClient } from './api/axiosClient';
import { EquipmentDto, Page } from '../types';

export interface EquipmentParams {
  status?: string;
  room?: string;
  page?: number;
  size?: number;
}

export interface CreateEquipmentRequest {
  name: string;
  room: string;
  type: string;
  status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE';
}

export const equipmentService = {
  async getAll(params?: EquipmentParams): Promise<Page<EquipmentDto>> {
    const res = await axiosClient.get<Page<EquipmentDto>>('/api/equipments', { params });
    return res.data;
  },

  async getById(id: number): Promise<EquipmentDto> {
    const res = await axiosClient.get<EquipmentDto>(`/api/equipments/${id}`);
    return res.data;
  },

  async create(data: CreateEquipmentRequest): Promise<EquipmentDto> {
    const res = await axiosClient.post<EquipmentDto>('/api/equipments', data);
    return res.data;
  },

  async update(id: number, data: Partial<CreateEquipmentRequest>): Promise<EquipmentDto> {
    const res = await axiosClient.put<EquipmentDto>(`/api/equipments/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await axiosClient.delete(`/api/equipments/${id}`);
  }
};
