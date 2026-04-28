/**
 * Validation Utility Functions
 */

import { VALIDATION_RULES } from '../constants';

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL_PATTERN.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) return false;
  if (VALIDATION_RULES.PASSWORD_REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) return false;
  if (VALIDATION_RULES.PASSWORD_REQUIRES_LOWERCASE && !/[a-z]/.test(password)) return false;
  if (VALIDATION_RULES.PASSWORD_REQUIRES_DIGITS && !/[0-9]/.test(password)) return false;

  return true;
};

/**
 * Validate name field
 */
export const isValidName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= VALIDATION_RULES.NAME_MIN_LENGTH && trimmed.length <= VALIDATION_RULES.NAME_MAX_LENGTH;
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate grade (0-100)
 */
export const isValidGrade = (grade: number): boolean => {
  return grade >= VALIDATION_RULES.GRADE_MIN && grade <= VALIDATION_RULES.GRADE_MAX;
};

/**
 * Validate course capacity
 */
export const isValidCapacity = (capacity: number): boolean => {
  return capacity >= VALIDATION_RULES.CAPACITY_MIN && capacity <= VALIDATION_RULES.CAPACITY_MAX;
};

/**
 * Validate required field (not empty)
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate min length
 */
export const minLength = (value: string, length: number): boolean => {
  return value.length >= length;
};

/**
 * Validate max length
 */
export const maxLength = (value: string, length: number): boolean => {
  return value.length <= length;
};

/**
 * Validate pattern match
 */
export const matchesPattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value);
};

/**
 * Validate passwords match
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && isValidPassword(password);
};

/**
 * Generic validator with error message
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validate = (value: any, rules: Record<string, any>): ValidationResult => {
  // Check required
  if (rules.required && !isRequired(value)) {
    return { isValid: false, message: 'This field is required' };
  }

  // Check email
  if (rules.email && !isValidEmail(value)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  // Check min length
  if (rules.minLength && !minLength(value, rules.minLength)) {
    return { isValid: false, message: `Minimum length is ${rules.minLength} characters` };
  }

  // Check max length
  if (rules.maxLength && !maxLength(value, rules.maxLength)) {
    return { isValid: false, message: `Maximum length is ${rules.maxLength} characters` };
  }

  return { isValid: true };
};
