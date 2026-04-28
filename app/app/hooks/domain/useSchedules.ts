/**
 * Hook for managing schedule operations
 */

import { useFetch } from '../useFetch';
import { useAsync } from '../useAsync';
import { schedulesApi } from '../../../services/api';
import type { Schedule } from '../../types';

export const useSchedules = () => {
  const { data: schedules, loading, error, refetch } = useFetch<Schedule[]>(
    () => schedulesApi.getAll().then((res: any) => res.data),
    { immediate: true }
  );

  const { execute: createSchedule } = useAsync((data: any) =>
    schedulesApi.create(data).then((res: any) => res.data)
  );

  const { execute: updateSchedule } = useAsync((id: number, data: any) =>
    schedulesApi.update(id, data).then((res: any) => res.data)
  );

  const { execute: deleteSchedule } = useAsync((id: number) =>
    schedulesApi.delete(id).then((res: any) => res.data)
  );

  const { data: schedulesByCourse, execute: getSchedulesByCourse } = useAsync((courseId: number) =>
    schedulesApi.getByCourse(courseId).then((res: any) => res.data)
  );

  return {
    schedules: schedules || [],
    loading,
    error,
    refetch,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByCourse,
    currentCourseSchedules: schedulesByCourse,
  };
};
