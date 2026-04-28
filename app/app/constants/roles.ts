/**
 * User Role and Permission Constants
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
} as const;

export const ROLE_LABELS = {
  admin: 'Administrator',
  instructor: 'Instructor',
  student: 'Student',
} as const;

export const ROLE_DESCRIPTIONS = {
  admin: 'Full system access, user management, analytics',
  instructor: 'Create and manage courses, grade students',
  student: 'Enroll in courses, view grades',
} as const;

// Permissions by role
export const PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageCourses: true,
    canViewAnalytics: true,
    canCreateAnnouncements: true,
    canGradeStudents: true,
    canDeleteCourses: true,
  },
  instructor: {
    canManageUsers: false,
    canManageCourses: true,
    canViewAnalytics: false,
    canCreateAnnouncements: false,
    canGradeStudents: true,
    canDeleteCourses: false,
  },
  student: {
    canManageUsers: false,
    canManageCourses: false,
    canViewAnalytics: false,
    canCreateAnnouncements: false,
    canGradeStudents: false,
    canDeleteCourses: false,
  },
} as const;

// Course Status
export const COURSE_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export const COURSE_STATUS_LABELS = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
} as const;

// Enrollment Status
export const ENROLLMENT_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
} as const;

export const ENROLLMENT_STATUS_LABELS = {
  active: 'Active',
  completed: 'Completed',
  dropped: 'Dropped',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;
