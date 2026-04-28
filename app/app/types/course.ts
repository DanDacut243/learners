/**
 * Course Types and Interfaces
 */

import type { User } from './user';
import type { Enrollment } from './enrollment';

export type CourseStatus = 'draft' | 'active' | 'archived';

export interface Course {
  id: number;
  name: string;
  description: string | null;
  instructor_id: number;
  instructor?: User;
  capacity: number;
  status: CourseStatus;
  start_date: string | null;
  end_date: string | null;
  created_at?: string;
  updated_at?: string;
  enrollments?: Enrollment[];
}

export interface CourseCreateInput {
  name: string;
  description?: string;
  capacity?: number;
  start_date?: string;
  end_date?: string;
  status?: CourseStatus;
}

export interface CourseUpdateInput {
  name?: string;
  description?: string;
  capacity?: number;
  status?: CourseStatus;
  start_date?: string;
  end_date?: string;
}

export interface CourseListResponse {
  data: Course[];
}
