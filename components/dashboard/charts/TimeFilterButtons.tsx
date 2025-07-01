import React from 'react';
import Button from '../../ui/Button';

export interface TimeFilterOption {
  id: string;
  label: string;
}

interface TimeFilterButtonsProps {
  filters: TimeFilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  className?: string;
}

const TimeFilterButtons: React.FC<TimeFilterButtonsProps> = ({
  filters,
  activeFilter,
  onFilterChange,
  className = '',
}) => {
  return (
    <div className={`flex space-x-1 bg-gray-100 dark:bg-gray-700 p-0.5 rounded-md ${className}`}>
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange(filter.id)}
          className={`text-xs px-2 py-1 transition-all duration-150 ease-in-out
            ${activeFilter === filter.id 
              ? 'bg-primary text-white shadow-sm' // Primary button styles handle dark mode implicitly
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100'
            }
          `}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default TimeFilterButtons;