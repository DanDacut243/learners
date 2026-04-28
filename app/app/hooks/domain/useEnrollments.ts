/**
 * Hook for managing enrollment operations
 */

import { useFetch } from '../useFetch';
import { useAsync } from '../useAsync';
import { enrollmentsApi } from '../../../services/api';
import type { Enrollment } from '../../types';

export const useEnrollments = () => {
  const { data: enrollments, loading, error, refetch } = useFetch<Enrollment[]>(
    () => enrollmentsApi.getAll().then((res: any) => res.data),
    { immediate: true }
  );

  const { execute: createEnrollment } = useAsync((data: any) =>
    enrollmentsApi.create(data).then((res: any) => res.data)
  );

  const { execute: deleteEnrollment } = useAsync((id: number) =>
    enrollmentsApi.delete(id).then((res: any) => res.data)
  );

  const { data: enrollmentsByCourse, execute: getEnrollmentsByCourse } = useAsync((courseId: number) =>
    enrollmentsApi.getByCourse(courseId).then((res: any) => res.data)
  );

  return {
    enrollments: enrollments || [],
    loading,
    error,
    refetch,
    createEnrollment,
    deleteEnrollment,
    getEnrollmentsByCourse,
    currentCourseEnrollments: enrollmentsByCourse,
  };
};
