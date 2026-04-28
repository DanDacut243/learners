/**
 * Error and Success Messages
 */

export const ERROR_MESSAGES = {
  // Auth Errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  NOT_AUTHENTICATED: 'Please log in to continue',
  SESSION_EXPIRED: 'Your session has expired, please log in again',
  UNAUTHORIZED: 'You do not have permission to perform this action',

  // User Errors
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_TAKEN: 'This email is already in use',
  USER_CREATION_FAILED: 'Failed to create user',
  USER_UPDATE_FAILED: 'Failed to update user',
  USER_DELETE_FAILED: 'Failed to delete user',

  // Course Errors
  COURSE_NOT_FOUND: 'Course not found',
  COURSE_CREATION_FAILED: 'Failed to create course',
  COURSE_UPDATE_FAILED: 'Failed to update course',
  COURSE_DELETE_FAILED: 'Failed to delete course',
  COURSE_CAPACITY_EXCEEDED: 'Course is at full capacity',

  // Enrollment Errors
  ALREADY_ENROLLED: 'You are already enrolled in this course',
  ENROLLMENT_FAILED: 'Failed to enroll in course',
  UNENROLL_FAILED: 'Failed to unenroll from course',

  // Grade Errors
  GRADE_NOT_FOUND: 'Grade not found',
  INVALID_GRADE: 'Grade must be between 0 and 100',
  GRADE_POSTING_FAILED: 'Failed to post grade',

  // Network Errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  REQUEST_TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',

  // Validation Errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_ROLE: 'Invalid role selected',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  COURSE_CREATED: 'Course created successfully',
  COURSE_UPDATED: 'Course updated successfully',
  COURSE_DELETED: 'Course deleted successfully',
  COURSE_PUBLISHED: 'Course published successfully',
  COURSE_ARCHIVED: 'Course archived successfully',
  ENROLLED_SUCCESS: 'Enrolled in course successfully',
  UNENROLLED_SUCCESS: 'Unenrolled from course successfully',
  GRADE_POSTED: 'Grade posted successfully',
  GRADE_UPDATED: 'Grade updated successfully',
  NOTIFICATION_READ: 'Notification marked as read',
  ANNOUNCEMENT_CREATED: 'Announcement created successfully',
};

export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  CONFIRM_DELETE: 'Are you sure you want to delete this item?',
  CONFIRM_LOGOUT: 'Are you sure you want to logout?',
  SESSION_ENDING: 'Your session is about to end',
};
