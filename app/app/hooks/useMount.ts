/**
 * Hook that runs callback on component mount
 */

import { useEffect } from 'react';

export const useMount = (callback: () => void | (() => void)): void => {
  useEffect(() => {
    return callback();
  }, []);
};

/**
 * Hook that runs callback on component unmount
 */
export const useUnmount = (callback: () => void): void => {
  useEffect(() => {
    return () => callback();
  }, []);
};
