/**
 * Hook for managing notification operations
 */

import { useFetch } from '../useFetch';
import { useAsync } from '../useAsync';
import { notificationsApi } from '../../../services/api';
import type { Notification } from '../../types';

export const useNotifications = () => {
  const { data: notifications, loading, error, refetch } = useFetch<Notification[]>(
    () => notificationsApi.getAll().then((res: any) => res.data),
    { immediate: true }
  );

  const { execute: markAsRead } = useAsync((id: number) =>
    notificationsApi.markAsRead(id).then((res: any) => res.data)
  );

  const { execute: markAllAsRead } = useAsync(() =>
    notificationsApi.markAllAsRead().then((res: any) => res.data)
  );

  const unreadCount = notifications?.filter((n) => !n.read_at).length || 0;

  return {
    notifications: notifications || [],
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    unreadCount,
  };
};
