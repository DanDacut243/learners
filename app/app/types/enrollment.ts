/**
 * Enrollment Types and Interfaces
 */

import type { User } from './user';
import type { Course } from './course';

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: EnrollmentStatus;
  enrolled_at: string;
  user?: User;
  course?: Course;
  created_at?: string;
  updated_at?: string;
}

export interface EnrollmentCreateInput {
  course_id: number;
  user_id?: number;
}

export interface EnrollmentListResponse {
  data: Enrollment[];
}
