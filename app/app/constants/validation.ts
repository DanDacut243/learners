/**
 * Validation Rules and Patterns
 */

export const VALIDATION_RULES = {
  // Email
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_MIN_LENGTH: 5,
  EMAIL_MAX_LENGTH: 255,

  // Password
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 255,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, // At least one uppercase, lowercase, and digit
  PASSWORD_REQUIRES_UPPERCASE: true,
  PASSWORD_REQUIRES_LOWERCASE: true,
  PASSWORD_REQUIRES_DIGITS: true,

  // User Name
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 255,

  // Course Name
  COURSE_NAME_MIN_LENGTH: 3,
  COURSE_NAME_MAX_LENGTH: 255,

  // Course Description
  COURSE_DESCRIPTION_MIN_LENGTH: 10,
  COURSE_DESCRIPTION_MAX_LENGTH: 5000,

  // Grade
  GRADE_MIN: 0,
  GRADE_MAX: 100,

  // Course Capacity
  CAPACITY_MIN: 1,
  CAPACITY_MAX: 500,

  // URL
  URL_PATTERN: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  EMAIL_TAKEN: 'This email is already registered',
  PASSWORD_WEAK: 'Password must contain uppercase, lowercase, and numbers',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_MISMATCH: 'Passwords do not match',
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Name must not exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
  COURSE_NAME_TOO_SHORT: `Course name must be at least ${VALIDATION_RULES.COURSE_NAME_MIN_LENGTH} characters`,
  COURSE_DESCRIPTION_TOO_SHORT: `Description must be at least ${VALIDATION_RULES.COURSE_DESCRIPTION_MIN_LENGTH} characters`,
  GRADE_OUT_OF_RANGE: `Grade must be between ${VALIDATION_RULES.GRADE_MIN} and ${VALIDATION_RULES.GRADE_MAX}`,
  CAPACITY_INVALID: `Capacity must be between ${VALIDATION_RULES.CAPACITY_MIN} and ${VALIDATION_RULES.CAPACITY_MAX}`,
  INVALID_URL: 'Please enter a valid URL',
};

// Field validation patterns
export const FIELD_PATTERNS = {
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
  numbersOnly: /^[0-9]+$/,
  specialCharacters: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g,
};
