

import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface StatisticCardProps {
  icon: React.ReactElement<{ size?: number; className?: string }>;
  title: string; // New prop for the card's main title, e.g., "Eventos"
  value: number | string | undefined;
  description: string; // Renamed from 'label' for clarity, e.g., "nos próximos 30 dias"
  isLoading?: boolean;
  viewAllLink?: string;
  className?: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  icon,
  title,
  value,
  description,
  isLoading = false,
  viewAllLink,
  className = '',
}) => {
  const content = (
    <>
      <div className="flex items-center mb-3">
        {React.cloneElement(icon, { size: 20, className: `mr-2 ${icon.props.className || ''}` })}
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 truncate" title={title}>{title}</h3>
      </div>
      {isLoading ? (
        <>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </>
      ) : (
        <>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {value !== undefined ? value : '-'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={description}>{description}</p>
        </>
      )}
    </>
  );

  const cardBaseClasses = `bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-md dark:hover:shadow-gray-700/50 transition-shadow duration-200 flex flex-col ${className}`;

  if (viewAllLink) {
    return (
      <Link to={viewAllLink} className={`${cardBaseClasses} group relative`}>
        {content}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ExternalLink size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-sky-400" />
        </div>
      </Link>
    );
  }

  return (
    <div className={cardBaseClasses}>
      {content}
    </div>
  );
};

export default StatisticCard;