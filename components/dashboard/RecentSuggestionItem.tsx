
import React from 'react';
// ReactRouterDOM import removed
import { Suggestion } from '../../types';
import { Lightbulb, ThumbsUp } from 'lucide-react';

interface RecentSuggestionItemProps {
  suggestion: Suggestion;
  onViewDetails: (suggestion: Suggestion) => void; // New prop
}

const RecentSuggestionItem: React.FC<RecentSuggestionItemProps> = ({ suggestion, onViewDetails }) => {
  return (
    <div 
      onClick={() => onViewDetails(suggestion)} // Changed from Link to div with onClick
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewDetails(suggestion);}}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalhes da sugestão: ${suggestion.title}`}
      className="block p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition-colors duration-150 group cursor-pointer"
    >
      <div className="flex items-start space-x-3">
        <div className="mt-1 p-1.5 bg-yellow-50 dark:bg-yellow-400/10 rounded-full shadow-sm border border-gray-100 dark:border-gray-600/50 text-yellow-500 dark:text-yellow-400">
          <Lightbulb size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-sky-400 truncate" title={suggestion.title}>
            {suggestion.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2" title={suggestion.description}>
            {suggestion.description}
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            <ThumbsUp size={12} className="mr-1 text-green-500 dark:text-green-400"/> 
            <span>{suggestion.upvotes}</span>
            <span className="mx-1.5 text-gray-300 dark:text-gray-600">•</span>
            <span className="text-gray-400 dark:text-gray-500">
                {suggestion.isAnonymous ? "Anônima" : suggestion.authorId || "Colaborador"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentSuggestionItem;
