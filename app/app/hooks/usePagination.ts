/**
 * Hook for managing pagination state
 */

import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setItemsPerPage: (items: number) => void;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
}

export const usePagination = <T,>(
  items: T[] = [],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> => {
  const { initialPage = 1, itemsPerPage: initialItemsPerPage = 10 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Ensure current page is valid
  const validPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  if (validPage !== currentPage) {
    setCurrentPage(validPage);
  }

  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(pageNum);
  };

  const nextPage = () => {
    goToPage(validPage + 1);
  };

  const prevPage = () => {
    goToPage(validPage - 1);
  };

  const hasNextPage = validPage < totalPages;
  const hasPrevPage = validPage > 1;

  return {
    currentPage: validPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    itemsPerPage,
    totalItems,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
  };
};
