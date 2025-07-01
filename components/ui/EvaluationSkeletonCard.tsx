import React from 'react';
import { Star, Calendar, MessageSquare } from 'lucide-react';

const EvaluationSkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div> {/* User ID placeholder */}
        <div className="flex items-center">
          <Calendar size={12} className="mr-1 text-gray-300 dark:text-gray-500" />
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div> {/* Timestamp placeholder */}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
        <div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-1"></div> {/* Org Rating Label placeholder */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={`org-star-${i}`} size={16} className="text-gray-300 dark:text-gray-600" />
            ))}
          </div>
        </div>
        <div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-28 mb-1"></div> {/* Content Rating Label placeholder */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={`content-star-${i}`} size={16} className="text-gray-300 dark:text-gray-600" />
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28 mb-1.5 flex items-center"> {/* Comment Label placeholder */}
            <MessageSquare size={14} className="mr-1.5 text-gray-300 dark:text-gray-600" />
            <span className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></span>
        </div>
        <div className="space-y-1.5 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md border border-gray-200 dark:border-gray-600">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSkeletonCard;