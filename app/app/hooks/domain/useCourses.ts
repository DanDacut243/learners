/**
 * Hook for managing course operations
 */

import { useFetch } from '../useFetch';
import { useAsync } from '../useAsync';
import { coursesApi } from '../../../services/api';
import type { Course } from '../../types';

export const useCourses = () => {
  const { data: courses, loading, error, refetch } = useFetch<Course[]>(
    () => coursesApi.getAll().then((res: any) => res.data),
    { immediate: true }
  );

  const { execute: createCourse } = useAsync((data: any) =>
    coursesApi.create(data).then((res: any) => res.data)
  );

  const { execute: updateCourse } = useAsync((id: number, data: any) =>
    coursesApi.update(id, data).then((res: any) => res.data)
  );

  const { execute: deleteCourse } = useAsync((id: number) =>
    coursesApi.delete(id).then((res: any) => res.data)
  );

  const { data: course, execute: getCourseById } = useAsync((id: number) =>
    coursesApi.getById(id).then((res: any) => res.data)
  );

  return {
    courses: courses || [],
    loading,
    error,
    refetch,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
    currentCourse: course,
  };
};
