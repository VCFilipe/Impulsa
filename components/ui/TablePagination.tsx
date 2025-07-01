import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';
import Select from './Select'; // Assuming you have a Select component
import Input from './Input'; // Assuming you have an Input component

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (size: number) => void;
  totalItems: number;
  itemsPerPageOptions?: number[];
  canPreviousPage: boolean;
  canNextPage: boolean;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  itemsPerPageOptions = [10, 20, 30, 40, 50],
  canPreviousPage,
  canNextPage,
}) => {
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      // Allow clearing input, or handle as needed (e.g., revert to currentPage)
      return;
    }
    const pageNumber = parseInt(value, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };
  
  const handlePageInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
       // If input is empty on blur, reset to current page
       e.target.value = String(currentPage);
    } else {
        const pageNumber = parseInt(value, 10);
        if (isNaN(pageNumber) || pageNumber < 1) {
            e.target.value = String(1); // Reset to 1 if invalid
            onPageChange(1);
        } else if (pageNumber > totalPages && totalPages > 0) { // Check totalPages > 0
            e.target.value = String(totalPages); // Reset to max if invalid
            onPageChange(totalPages);
        } else if (totalPages === 0 && pageNumber !==1) { // Handle case of 0 total pages
            e.target.value = String(1);
            onPageChange(1);
        }
    }
  };


  if (totalPages === 0 && totalItems === 0) { 
    return (
        <div className="flex items-center justify-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
             <span>Nenhum item para exibir.</span>
        </div>
    );
  }

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-3 px-4 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 gap-x-6 gap-y-3">
      {/* Left Part: Items per page & Count */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2">
        <div className="flex items-center space-x-2">
          <span>Itens por página:</span>
          <Select
            id="itemsPerPageSelect"
            value={String(itemsPerPage)}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            options={itemsPerPageOptions.map(size => ({ value: String(size), label: String(size) }))}
            className="w-20 py-1 text-sm" 
          />
        </div>
        <span className="whitespace-nowrap">
          | Exibindo {startItem}-{endItem} de {totalItems}
        </span>
      </div>

      {/* Right Part: Navigation Controls */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-1 sm:gap-x-2 gap-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canPreviousPage}
          className="p-1.5 sm:p-2"
          aria-label="Primeira página"
        >
          <ChevronsLeft size={18} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPreviousPage}
          className="p-1.5 sm:p-2"
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} />
        </Button>
        
        <div className="flex items-center text-sm">
          <span className="mr-1.5">Página</span>
          <Input
            type="number"
            id="currentPageInput"
            defaultValue={String(currentPage)} 
            key={`page-input-${currentPage}`} 
            onChange={handlePageInputChange}
            onBlur={handlePageInputBlur}
            min={1}
            max={totalPages > 0 ? totalPages : 1} // Ensure max is at least 1
            className="w-14 px-2 py-1 text-center text-sm dark:[color-scheme:dark]"
            aria-label={`Página atual, ${currentPage} de ${totalPages > 0 ? totalPages : 1}`}
          />
          <span className="ml-1.5">/ {totalPages > 0 ? totalPages : 1}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNextPage}
          className="p-1.5 sm:p-2"
          aria-label="Próxima página"
        >
          <ChevronRight size={18} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canNextPage}
          className="p-1.5 sm:p-2"
          aria-label="Última página"
        >
          <ChevronsRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;