import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'trade' | 'price_alert' | 'market' | 'system' | 'achievement';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  icon?: string;
  actionUrl?: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (n) => {
        const notification: AppNotification = {
          ...n,
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          timestamp: Date.now(),
          read: false,
        };
        set((s) => ({
          notifications: [notification, ...s.notifications].slice(0, 100), // Keep max 100
          unreadCount: s.unreadCount + 1,
        }));
      },
      markRead: (id) =>
        set((s) => {
          const n = s.notifications.find((x) => x.id === id);
          if (!n || n.read) return s;
          return {
            notifications: s.notifications.map((x) => (x.id === id ? { ...x, read: true } : x)),
            unreadCount: Math.max(0, s.unreadCount - 1),
          };
        }),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((x) => ({ ...x, read: true })),
          unreadCount: 0,
        })),
      clearAll: () => set({ notifications: [], unreadCount: 0 }),
      removeNotification: (id) =>
        set((s) => {
          const n = s.notifications.find((x) => x.id === id);
          return {
            notifications: s.notifications.filter((x) => x.id !== id),
            unreadCount: n && !n.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
          };
        }),
    }),
    { name: 'sharesathi-notifications' }
  )
);
