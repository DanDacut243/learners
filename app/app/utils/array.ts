/**
 * Array Utility Functions
 */

/**
 * Remove duplicates from array
 */
export const uniqueArray = <T extends any>(arr: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(arr)];
  }

  const seen = new Set();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/**
 * Group array by key
 */
export const groupBy = <T extends any>(arr: T[], key: keyof T): Record<string, T[]> => {
  return arr.reduce(
    (acc, item) => {
      const k = String(item[key]);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
};

/**
 * Sort array by property
 */
export const sortBy = <T extends any>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  const sorted = [...arr].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
};

/**
 * Filter array by property value
 */
export const filterBy = <T extends any>(arr: T[], key: keyof T, value: any): T[] => {
  return arr.filter((item) => item[key] === value);
};

/**
 * Find item in array
 */
export const findItem = <T extends any>(arr: T[], key: keyof T, value: any): T | undefined => {
  return arr.find((item) => item[key] === value);
};

/**
 * Map array to new values
 */
export const mapArray = <T extends any, R>(arr: T[], callback: (item: T) => R): R[] => {
  return arr.map(callback);
};

/**
 * Chunk array into smaller arrays
 */
export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/**
 * Flatten nested array
 */
export const flattenArray = <T>(arr: any[]): T[] => {
  return arr.flat(Infinity);
};

/**
 * Remove item from array
 */
export const removeItem = <T>(arr: T[], item: T): T[] => {
  return arr.filter((i) => i !== item);
};

/**
 * Remove item at index
 */
export const removeAtIndex = <T>(arr: T[], index: number): T[] => {
  return arr.filter((_, i) => i !== index);
};
