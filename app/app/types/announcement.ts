/**
 * Announcement Types and Interfaces
 */

import type { User } from './user';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  created_by: number;
  creator?: User;
  created_at?: string;
  updated_at?: string;
}

export interface AnnouncementCreateInput {
  title: string;
  content: string;
}

export interface AnnouncementListResponse {
  data: Announcement[];
}
