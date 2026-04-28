/**
 * Hook for managing grade operations
 */

import { useFetch } from '../useFetch';
import { useAsync } from '../useAsync';
import { gradesApi } from '../../../services/api';
import type { Grade } from '../../types';

export const useGrades = () => {
  const { data: grades, loading, error, refetch } = useFetch<Grade[]>(
    () => gradesApi.getAll().then((res: any) => res.data),
    { immediate: true }
  );

  const { execute: createGrade } = useAsync((data: any) =>
    gradesApi.create(data).then((res: any) => res.data)
  );

  const { execute: updateGrade } = useAsync((id: number, data: any) =>
    gradesApi.update(id, data).then((res: any) => res.data)
  );

  const { data: gradesByCourse, execute: getGradesByCourse } = useAsync((courseId: number) =>
    gradesApi.getByCourse(courseId).then((res: any) => res.data)
  );

  return {
    grades: grades || [],
    loading,
    error,
    refetch,
    createGrade,
    updateGrade,
    getGradesByCourse,
    currentCourseGrades: gradesByCourse,
  };
};
