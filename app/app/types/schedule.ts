/**
 * Schedule Types and Interfaces
 */

import type { Course } from './course';

export interface Schedule {
  id: number;
  course_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course?: Course;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleCreateInput {
  course_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export interface ScheduleListResponse {
  data: Schedule[];
}
