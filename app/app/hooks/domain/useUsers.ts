/**
 * Hook for managing user operations
 */

import { useFetch } from '../useFetch';
import { useAsync } from '../useAsync';
import { usersApi } from '../../../services/api';
import type { User } from '../../types';

export const useUsers = () => {
  const { data: users, loading, error, refetch } = useFetch<User[]>(
    () => usersApi.getAll().then((res: any) => res.data),
    { immediate: true }
  );

  const { execute: createUser } = useAsync((data: any) =>
    usersApi.create(data).then((res: any) => res.data)
  );

  const { execute: updateUser } = useAsync((id: number, data: any) =>
    usersApi.update(id, data).then((res: any) => res.data)
  );

  const { execute: deleteUser } = useAsync((id: number) =>
    usersApi.delete(id).then((res: any) => res.data)
  );

  const { data: user, execute: getUserById } = useAsync((id: number) =>
    usersApi.getById(id).then((res: any) => res.data)
  );

  return {
    users: users || [],
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    currentUser: user,
  };
};
