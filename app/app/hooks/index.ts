/**
 * Central export for all custom hooks
 */

// Generic hooks
export { useFetch } from './useFetch';
export { useForm } from './useForm';
export { usePagination } from './usePagination';
export { useLocalStorage } from './useLocalStorage';
export { useDebounce } from './useDebounce';
export { useAsync } from './useAsync';
export { useMount, useUnmount } from './useMount';
export { useToggle } from './useToggle';
export { usePrevious } from './usePrevious';

// Domain hooks
export { useCourses, useUsers, useEnrollments, useGrades, useNotifications, useAnnouncements, useSchedules } from './domain';
