/**
 * Hook for handling async operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAsyncOptions<T, E> {
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onSettled?: () => void;
}

interface UseAsyncReturn<T, E> {
  data: T | null;
  error: E | null;
  isLoading: boolean;
  execute: (...args: any[]) => Promise<T>;
}

export const useAsync = <T, E = Error>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T, E> = {}
): UseAsyncReturn<T, E> => {
  const { onSuccess, onError, onSettled } = options;
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]) => {
      setStatus('pending');
      setValue(null);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        if (isMountedRef.current) {
          setValue(result);
          setStatus('success');
          onSuccess?.(result);
        }
        return result;
      } catch (err) {
        if (isMountedRef.current) {
          setError(err as E);
          setStatus('error');
          onError?.(err as E);
        }
        throw err;
      } finally {
        if (isMountedRef.current) {
          onSettled?.();
        }
      }
    },
    [asyncFunction, onSuccess, onError, onSettled]
  );

  return {
    data: value,
    error,
    isLoading: status === 'pending',
    execute,
  };
};
