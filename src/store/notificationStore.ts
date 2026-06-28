import { create } from 'zustand';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '../services/api/axiosClient';
import { useAuthStore } from './authStore';

// QueryClient import for invalidation
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient();

export interface LiveNotification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  payload?: any;
  read: boolean;
}

interface NotificationState {
  notifications: LiveNotification[];
  connected: boolean;
  addNotification: (type: string, message: string, payload?: any) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  connectWebSocket: (orgId: number, token: string) => void;
  disconnectWebSocket: () => void;
}

let stompClient: Client | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  connected: false,

  addNotification: (type, message, payload) => {
    const newNotif: LiveNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date().toISOString(),
      payload,
      read: false,
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 50), // Limit to 50
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),

  connectWebSocket: (orgId, token) => {
    if (stompClient?.active) {
      return;
    }

    console.log('Connecting to WebSocket...');
    
    // Create custom SockJS builder
    const socketFactory = () => new SockJS(`${API_BASE_URL}/ws`);

    stompClient = new Client({
      webSocketFactory: socketFactory,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log('[STOMP]', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
      console.log('Connected to STOMP WebSocket!', frame);
      set({ connected: true });

      // Subscribe to organization ticket updates
      stompClient?.subscribe(`/topic/org/${orgId}/tickets`, (message: IMessage) => {
        try {
          const body = JSON.parse(message.body);
          console.log('Ticket event received:', body);
          get().addNotification('TICKET_UPDATE', body.message || 'Mise à jour du ticket', body.payload);
          // Auto-invalidate react-query caches
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-my'] });
        } catch (e) {
          console.error('Error parsing ticket message:', e);
        }
      });

      // Subscribe to dashboard refresh triggers
      stompClient?.subscribe(`/topic/org/${orgId}/dashboard`, (message: IMessage) => {
        try {
          const body = JSON.parse(message.body);
          console.log('Dashboard refresh received:', body);
          get().addNotification('DASHBOARD_REFRESH', 'Actualisation du tableau de bord', body.payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-my'] });
        } catch (e) {
          console.error('Error parsing dashboard message:', e);
        }
      });

      // Subscribe to activity updates
      stompClient?.subscribe(`/topic/org/${orgId}/activity`, (message: IMessage) => {
        try {
          const body = JSON.parse(message.body);
          console.log('Activity event received:', body);
          get().addNotification('ACTIVITY', body.message || 'Nouvelle activité', body.payload);
          queryClient.invalidateQueries({ queryKey: ['activities'] });
        } catch (e) {
          console.error('Error parsing activity message:', e);
        }
      });
    };

    stompClient.onDisconnect = () => {
      console.log('Disconnected from WebSocket');
      set({ connected: false });
    };

    stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    stompClient.activate();
  },

  disconnectWebSocket: () => {
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
      set({ connected: false });
      console.log('WebSocket deactivated');
    }
  },
}));
