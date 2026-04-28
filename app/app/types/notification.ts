/**
 * Notification Types and Interfaces
 */

import type { User } from './user';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  read_at: string | null;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationCreateInput {
  user_id?: number;
  title: string;
  message: string;
  type?: NotificationType;
}

export interface NotificationListResponse {
  data: Notification[];
}
