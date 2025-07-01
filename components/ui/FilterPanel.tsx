
import React, { useState, useId, ReactNode } from 'react';
import { ChevronDown, ChevronUp, ListFilter } from 'lucide-react';

interface FilterPanelProps {
  title?: string;
  icon?: ReactNode; // Added icon prop
  children: React.ReactNode;
  initialCollapsed?: boolean;
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  title = "Filtros",
  icon, // Consumed icon prop
  children,
  initialCollapsed = false,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const contentId = useId();

  const displayIcon = icon || <ListFilter size={18} className="mr-2 text-primary dark:text-sky-400" />;

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 ${className}`}>
      <button
        type="button"
        className="flex items-center justify-between w-full p-3 sm:p-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700 transition-colors duration-150 rounded-t-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-sky-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-800"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
      >
        <div className="flex items-center">
          {displayIcon}
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
        </div>
        {isCollapsed ? <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" /> : <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />}
      </button>
      <div
        id={contentId}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
        }`}
      >
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
