/**
 * Generic hook for fetching data from API
 * Handles loading, error, and data states
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { FetchState } from '../types';

interface UseFetchOptions {
  immediate?: boolean;
  dependencies?: unknown[];
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useFetch = <T = any>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
): FetchState<T> & {
  refetch: () => Promise<void>;
} => {
  const { immediate = true, dependencies = [], onSuccess, onError } = options;
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const isMountedRef = useRef(true);

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await fetchFn();
      if (isMountedRef.current) {
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
      }
    } catch (error) {
      if (isMountedRef.current) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setState({ data: null, loading: false, error: errorMessage });
        onError?.(errorMessage);
      }
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    isMountedRef.current = true;
    if (immediate) {
      execute();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [immediate, execute, ...dependencies]);

  return {
    ...state,
    refetch: execute,
  };
};
