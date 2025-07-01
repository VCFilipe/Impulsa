
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { TableColumn, SortConfig, PaginationState } from '../types';

const DEFAULT_ITEMS_PER_PAGE = 10;
// const DEFAULT_MIN_COLUMN_WIDTH = 50; // px - No longer needed

interface UseTableFeaturesProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  initialSortConfig?: SortConfig<T>;
  initialPagination?: PaginationState;
  // initialColumnWidths?: Record<string, number | string>; // No longer needed
  localStorageKey?: string; // For persisting settings
}

export function useTableFeatures<T>({
  data,
  columns,
  initialSortConfig,
  initialPagination,
  // initialColumnWidths, // No longer needed
  localStorageKey,
}: UseTableFeaturesProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialSortConfig || null);
  
  const [pagination, setPagination] = useState<PaginationState>(() => {
    const defaults = { currentPage: 1, itemsPerPage: DEFAULT_ITEMS_PER_PAGE, ...initialPagination };
    if (localStorageKey) {
      const storedPagination = localStorage.getItem(`${localStorageKey}_pagination`);
      if (storedPagination) {
        try {
          const parsed = JSON.parse(storedPagination);
          // Only restore itemsPerPage from pagination, currentPage should default to 1 or initial prop
          return { ...defaults, itemsPerPage: parsed.itemsPerPage || defaults.itemsPerPage };
        } catch { /* ignore error, use defaults */ }
      }
    }
    return defaults;
  });

  const tableRef = useRef<HTMLTableElement>(null);

  // Load sort config from localStorage
  useEffect(() => {
    if (localStorageKey) {
      const storedSortConfig = localStorage.getItem(`${localStorageKey}_sort`);
      if (storedSortConfig) {
        try {
          setSortConfig(JSON.parse(storedSortConfig));
        } catch { /* ignore error */ }
      }
    }
  }, [localStorageKey]);

  // Persist settings to localStorage
  useEffect(() => {
    if (localStorageKey) {
      if (sortConfig) {
        localStorage.setItem(`${localStorageKey}_sort`, JSON.stringify(sortConfig));
      } else {
        localStorage.removeItem(`${localStorageKey}_sort`);
      }
      localStorage.setItem(`${localStorageKey}_pagination`, JSON.stringify({ itemsPerPage: pagination.itemsPerPage }));
      // localStorage.setItem(`${localStorageKey}_widths`, JSON.stringify(columnWidths)); // No longer persisting widths
    }
  }, [sortConfig, pagination.itemsPerPage, localStorageKey]);


  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      const columnToSort = columns.find(col => col.key === sortConfig.key);
      sortableData.sort((a, b) => {
        let aValue, bValue;
        if (columnToSort?.accessorFn) {
          aValue = columnToSort.accessorFn(a);
          bValue = columnToSort.accessorFn(b);
        } else {
          aValue = (a as any)[sortConfig.key];
          bValue = (b as any)[sortConfig.key];
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue, undefined, { numeric: true }) * (sortConfig.direction === 'ascending' ? 1 : -1);
        }
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig, columns]);

  const paginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    return sortedData.slice(startIndex, startIndex + pagination.itemsPerPage);
  }, [sortedData, pagination]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedData.length / pagination.itemsPerPage);
  }, [sortedData.length, pagination.itemsPerPage]);

  const handleSort = useCallback((key: Extract<keyof T, string> | string) => {
    setSortConfig(prevSortConfig => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (prevSortConfig && prevSortConfig.key === key && prevSortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      return { key, direction };
    });
    setPagination(p => ({ ...p, currentPage: 1 })); // Reset to first page on sort
  }, []);

  const handlePageChange = useCallback((page: number) => {
    // Ensure page is within valid bounds, considering totalPages can be 0
    const newPage = Math.max(1, Math.min(page, totalPages || 1));
    setPagination(p => ({ ...p, currentPage: newPage }));
  }, [totalPages]);

  const handleItemsPerPageChange = useCallback((size: number) => {
    setPagination({ currentPage: 1, itemsPerPage: size });
  }, []);

  return {
    tableRef,
    paginatedData,
    sortConfig,
    handleSort,
    pagination,
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    totalItems: sortedData.length,
    canPreviousPage: pagination.currentPage > 1,
    canNextPage: pagination.currentPage < totalPages,
    // columnWidths, // Removed
    // startResize, // Removed
    // isResizingColumn: isResizing, // Removed
  };
}
