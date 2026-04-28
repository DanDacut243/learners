/**
 * Hook for managing announcement operations
 */

import { useFetch } from '../useFetch';
import { useAsync } from '../useAsync';
import { announcementsApi } from '../../../services/api';
import type { Announcement } from '../../types';

export const useAnnouncements = () => {
  const { data: announcements, loading, error, refetch } = useFetch<Announcement[]>(
    () => announcementsApi.getAll().then((res: any) => res.data),
    { immediate: true }
  );

  const { execute: createAnnouncement } = useAsync((data: any) =>
    announcementsApi.create(data).then((res: any) => res.data)
  );

  const { execute: updateAnnouncement } = useAsync((id: number, data: any) =>
    announcementsApi.update(id, data).then((res: any) => res.data)
  );

  const { execute: deleteAnnouncement } = useAsync((id: number) =>
    announcementsApi.delete(id).then((res: any) => res.data)
  );

  return {
    announcements: announcements || [],
    loading,
    error,
    refetch,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
};
