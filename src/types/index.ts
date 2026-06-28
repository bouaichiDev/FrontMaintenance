export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TECH' | 'USER';

export interface Role {
  id: number;
  name: string; // e.g. 'ROLE_USER', 'ROLE_ADMIN', 'ROLE_TECH', 'ROLE_SUPER_ADMIN'
}

export interface Organization {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  active: boolean;
  organization?: Organization;
  roles: Role[];
}

export interface UserProfileDto {
  id: number;
  username: string;
  active: boolean;
  organizationId?: number;
  organizationName?: string;
  role: UserRole; // Primay role without 'ROLE_' prefix
}

export interface Equipment {
  id: number;
  name: string;
  room: string;
  type: string;
  status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE';
  createdAt: string;
}

export interface EquipmentDto extends Equipment {
  organizationId?: number;
}

export interface Ticket {
  id: number;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  photoUrl?: string;
  resolutionComment?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  equipment: Equipment;
  reporter: User;
  technician?: User;
}

export interface TicketDto {
  id: number;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  photoUrl?: string;
  resolutionComment?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  equipmentId: number;
  equipmentName: string;
  equipmentRoom: string;
  reporterId: number;
  reporterUsername: string;
  technicianId?: number;
  technicianUsername?: string;
}

export interface TicketLogDto {
  id: number;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  ticketId: number;
  username: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityId?: number;
  details?: string;
  createdAt: string;
  username: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface DashboardStatsDto {
  ticketCountsByStatus: Record<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED', number>;
  ticketCountsByPriority: Record<'LOW' | 'MEDIUM' | 'HIGH', number>;
  equipmentCount: number;
  overdueTicketsCount: number;
  topEquipmentsWithMostTickets: Array<{
    equipmentName: string;
    ticketCount: number;
  }>;
}

export interface PersonalDashboardDto {
  createdTicketsCount: number;
  assignedTicketsCount: number;
  overdueTicketsCount: number;
  myRecentTickets: TicketDto[];
}

export interface PlatformStatsDto {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  totalTickets: number;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: UserRole;
  organizationId?: number;
  organizationName?: string;
}
