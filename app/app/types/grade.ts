/**
 * Grade Types and Interfaces
 */

import type { User } from './user';
import type { Course } from './course';

export interface Grade {
  id: number;
  user_id: number;
  course_id: number;
  grade: number;
  comment?: string;
  user?: User;
  course?: Course;
  created_at?: string;
  updated_at?: string;
}

export interface GradeCreateInput {
  user_id: number;
  course_id: number;
  grade: number;
  comment?: string;
}

export interface GradeUpdateInput {
  grade?: number;
  comment?: string;
}

export interface GradeListResponse {
  data: Grade[];
}
