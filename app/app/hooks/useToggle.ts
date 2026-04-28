/**
 * Hook for toggling boolean state
 */

import { useState, useCallback } from 'react';

interface UseToggleReturn {
  value: boolean;
  toggle: (newValue?: boolean) => void;
  setTrue: () => void;
  setFalse: () => void;
}

export const useToggle = (initialValue: boolean = false): UseToggleReturn => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback((newValue?: boolean) => {
    setValue((prev) => (newValue !== undefined ? newValue : !prev));
  }, []);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
};
