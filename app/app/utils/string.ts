/**
 * String Utility Functions
 */

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert string to title case
 */
export const titleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Convert string to camelCase
 */
export const camelCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
};

/**
 * Convert string to kebab-case
 */
export const kebabCase = (str: string): string => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
};

/**
 * Convert string to snake_case
 */
export const snakeCase = (str: string): string => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
};

/**
 * Reverse string
 */
export const reverseString = (str: string): string => {
  return str.split('').reverse().join('');
};

/**
 * Check if string is palindrome
 */
export const isPalindrome = (str: string): boolean => {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === reverseString(cleaned);
};

/**
 * Count occurrences of substring in string
 */
export const countOccurrences = (str: string, substr: string): number => {
  if (!substr) return 0;
  return str.split(substr).length - 1;
};

/**
 * Replace all occurrences of substring
 */
export const replaceAll = (str: string, find: string, replace: string): string => {
  return str.split(find).join(replace);
};

/**
 * Remove all whitespace from string
 */
export const removeWhitespace = (str: string): string => {
  return str.replace(/\s/g, '');
};

/**
 * Slug from string (for URLs)
 */
export const slug = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Check if string is empty or whitespace only
 */
export const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * Repeat string N times
 */
export const repeatString = (str: string, times: number): string => {
  return str.repeat(Math.max(0, times));
};

/**
 * Pad string to length
 */
export const padString = (str: string, length: number, padChar: string = ' '): string => {
  return str.length >= length ? str : str.padEnd(length, padChar);
};

/**
 * Get substring between two strings
 */
export const substringBetween = (str: string, start: string, end: string): string => {
  const startIndex = str.indexOf(start);
  if (startIndex === -1) return '';
  const afterStart = startIndex + start.length;
  const endIndex = str.indexOf(end, afterStart);
  if (endIndex === -1) return '';
  return str.substring(afterStart, endIndex);
};

/**
 * Check if string is numeric
 */
export const isNumeric = (str: string): boolean => {
  return !isNaN(parseFloat(str)) && isFinite(Number(str));
};
