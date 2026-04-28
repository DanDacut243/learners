/**
 * Class Names Utility for conditional className combining
 */

type ClassValue = string | undefined | null | false | Record<string, boolean>;
type ClassArray = ClassValue[];

/**
 * Combine classNames conditionally
 * Useful for Tailwind CSS and other className utilities
 *
 * @example
 * classNames('px-2 py-1', isActive && 'bg-blue-500', { 'text-white': isDark })
 */
export const classNames = (...classes: (ClassValue | ClassArray)[]): string => {
  return classes
    .flat()
    .reduce((acc: string[], cls) => {
      if (typeof cls === 'string') {
        acc.push(cls);
      } else if (typeof cls === 'object' && cls !== null) {
        Object.entries(cls).forEach(([key, value]) => {
          if (value) acc.push(key);
        });
      }
      return acc;
    }, [])
    .filter(Boolean)
    .join(' ');
};

/**
 * Merge multiple classNames strings
 * Removes duplicates while preserving order
 */
export const mergeClasses = (...classes: string[]): string => {
  const classSet = new Set<string>();
  classes.forEach((cls) => {
    cls.split(' ').forEach((c) => {
      if (c) classSet.add(c);
    });
  });
  return Array.from(classSet).join(' ');
};

/**
 * Toggle a class in a className string
 */
export const toggleClass = (className: string, toggle: string, condition: boolean): string => {
  const classes = className.split(' ').filter(Boolean);
  const index = classes.indexOf(toggle);

  if (condition && index === -1) {
    classes.push(toggle);
  } else if (!condition && index !== -1) {
    classes.splice(index, 1);
  }

  return classes.join(' ');
};

/**
 * Remove classes from className string
 */
export const removeClasses = (className: string, toRemove: string | string[]): string => {
  const removeSet = new Set(Array.isArray(toRemove) ? toRemove : [toRemove]);
  return className
    .split(' ')
    .filter((cls) => !removeSet.has(cls))
    .join(' ');
};

/**
 * Check if className contains a specific class
 */
export const hasClass = (className: string, cls: string): boolean => {
  return className.split(' ').includes(cls);
};

/**
 * Get responsive Tailwind classes based on breakpoint
 */
export const responsiveClasses = (
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string => {
  return classNames(base, sm && `sm:${sm}`, md && `md:${md}`, lg && `lg:${lg}`, xl && `xl:${xl}`);
};

/**
 * Create variant classes (like Radix UI variants)
 */
export const createVariants = <T extends Record<string, Record<string, string>>>(
  variants: T,
  base: string = ''
) => {
  return (variant: keyof T | undefined, value: keyof T[keyof T] | undefined): string => {
    const variantClass = variant && variants[variant] ? variants[variant][value as string] : '';
    return classNames(base, variantClass);
  };
};

/**
 * Status color classes (for badges, tags, etc.)
 */
export const getStatusColorClass = (status: string, variant: 'bg' | 'text' | 'border' = 'bg'): string => {
  const colorMap: Record<string, Record<string, string>> = {
    bg: {
      active: 'bg-green-100',
      inactive: 'bg-gray-100',
      pending: 'bg-yellow-100',
      success: 'bg-green-100',
      error: 'bg-red-100',
      warning: 'bg-yellow-100',
      info: 'bg-blue-100',
    },
    text: {
      active: 'text-green-700',
      inactive: 'text-gray-700',
      pending: 'text-yellow-700',
      success: 'text-green-700',
      error: 'text-red-700',
      warning: 'text-yellow-700',
      info: 'text-blue-700',
    },
    border: {
      active: 'border-green-300',
      inactive: 'border-gray-300',
      pending: 'border-yellow-300',
      success: 'border-green-300',
      error: 'border-red-300',
      warning: 'border-yellow-300',
      info: 'border-blue-300',
    },
  };

  return colorMap[variant][status.toLowerCase()] || colorMap[variant]['info'];
};

/**
 * Role-based classes
 */
export const getRoleColorClass = (role: string, variant: 'bg' | 'text' | 'border' = 'bg'): string => {
  const colorMap: Record<string, Record<string, string>> = {
    bg: {
      admin: 'bg-red-100',
      instructor: 'bg-blue-100',
      student: 'bg-purple-100',
    },
    text: {
      admin: 'text-red-700',
      instructor: 'text-blue-700',
      student: 'text-purple-700',
    },
    border: {
      admin: 'border-red-300',
      instructor: 'border-blue-300',
      student: 'border-purple-300',
    },
  };

  return colorMap[variant][role.toLowerCase()] || colorMap[variant]['student'];
};
