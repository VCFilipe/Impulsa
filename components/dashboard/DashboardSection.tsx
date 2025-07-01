

import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { ChevronRight, ExternalLink } from 'lucide-react';

interface DashboardSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  viewAllLink?: string;
  isLoading?: boolean;
  itemCount?: number;
  className?: string;
  headerChildren?: React.ReactNode; // New prop for additional elements in the header
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  icon,
  children,
  viewAllLink,
  isLoading, 
  itemCount, 
  className = '',
  headerChildren,
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 p-5 rounded-lg shadow flex flex-col ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-y-2">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center">
          {icon && <span className="mr-2 text-primary dark:text-sky-400">{icon}</span>}
          {title}
        </h2>
        <div className="flex items-center gap-x-3">
            {headerChildren}
            {viewAllLink && (
            <Button
                variant="link"
                size="sm"
                as={Link}
                to={viewAllLink}
                className="text-primary dark:text-sky-400 hover:text-primary/80 dark:hover:text-sky-300 p-0 pr-1 text-xs sm:text-sm whitespace-nowrap"
                rightIcon={<ExternalLink size={14} />}
            >
                Ver todos
            </Button>
            )}
        </div>
      </div>
      {/* Updated child wrapper to enable flex centering for placeholders */}
      <div className="space-y-3 flex-grow flex flex-col"> 
        {children}
      </div>
    </div>
  );
};

export default DashboardSection;