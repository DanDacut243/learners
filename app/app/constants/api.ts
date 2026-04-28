/**
 * API Configuration Constants
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',

  // Users
  USERS: '/users',
  USER_BY_ID: (id: number) => `/users/${id}`,

  // Courses
  COURSES: '/courses',
  COURSE_BY_ID: (id: number) => `/courses/${id}`,
  COURSE_ENROLLMENTS: (courseId: number) => `/courses/${courseId}/enrollments`,
  COURSE_SCHEDULES: (courseId: number) => `/courses/${courseId}/schedules`,
  COURSE_GRADES: (courseId: number) => `/courses/${courseId}/grades`,

  // Enrollments
  ENROLLMENTS: '/enrollments',
  ENROLLMENT_BY_ID: (id: number) => `/enrollments/${id}`,

  // Grades
  GRADES: '/grades',
  GRADE_BY_ID: (id: number) => `/grades/${id}`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_MARK_READ: (id: number) => `/notifications/${id}/read`,
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/read-all',

  // Announcements
  ANNOUNCEMENTS: '/announcements',
  ANNOUNCEMENT_BY_ID: (id: number) => `/announcements/${id}`,

  // Schedules
  SCHEDULES: '/schedules',
  SCHEDULE_BY_ID: (id: number) => `/schedules/${id}`,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
};

// Polling Intervals
export const POLLING_INTERVALS = {
  NOTIFICATIONS: 30000, // 30 seconds
  ANNOUNCEMENTS: 60000, // 1 minute
  DATA_REFRESH: 300000, // 5 minutes
};
