/**
 * API and Common Types
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
