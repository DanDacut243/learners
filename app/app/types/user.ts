/**
 * User Types and Interfaces
 */

export type UserRole = 'admin' | 'instructor' | 'student';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  subtitle: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
  role: UserRole;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  role?: UserRole;
  avatar?: string;
  subtitle?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserListResponse {
  data: User[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}
