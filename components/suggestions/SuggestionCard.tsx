
import React from 'react';
import { Suggestion, SuggestionVoteType } from '../../types';
import { formatDateToDisplay } from '../../utils/dateUtils';
import { Edit2, Trash2, ThumbsUp, ThumbsDown, User, Zap, Eye } from 'lucide-react'; // Added User, Eye, Zap
import Button from '../ui/Button';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';

interface SuggestionCardProps {
  suggestion: Suggestion;
  currentUserVote: SuggestionVoteType | null;
  onEdit: (suggestion: Suggestion) => void;
  onDelete: (suggestionId: string) => void;
  onVote: (suggestionId: string, voteType: SuggestionVoteType) => void;
  onViewDetails: (suggestion: Suggestion) => void; // New prop
  className?: string;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  currentUserVote,
  onEdit,
  onDelete,
  onVote,
  onViewDetails,
  className,
}) => {
  const { id, title, description, isAnonymous, authorId, upvotes, downvotes, updatedAt } = suggestion;

  const actionItems: DropdownMenuItem[] = [
    {
      id: 'view-details',
      label: 'Visualizar Detalhes',
      icon: <Eye size={16} />,
      onClick: () => onViewDetails(suggestion),
    },
    { id: 'separator-1', label: '---', onClick: () => {} },
    {
      id: 'edit',
      label: 'Editar Sugestão',
      icon: <Edit2 size={16} />,
      onClick: () => onEdit(suggestion),
      // Potentially disable if !isAnonymous && authorId !== currentUserId
    },
    {
      id: 'delete',
      label: 'Excluir Sugestão',
      icon: <Trash2 size={16} />,
      onClick: () => onDelete(id),
      isDanger: true,
      // Potentially disable if !isAnonymous && authorId !== currentUserId
    },
  ];

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onVote(id, SuggestionVoteType.UPVOTE);
  };
  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onVote(id, SuggestionVoteType.DOWNVOTE);
  };
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent modal opening if a button or the dropdown within the card was clicked
    if ((e.target as HTMLElement).closest('button, [role="menu"], [role="menuitem"]')) {
      return;
    }
    onViewDetails(suggestion);
  };

  const isUpvotedByUser = currentUserVote === SuggestionVoteType.UPVOTE;
  const isDownvotedByUser = currentUserVote === SuggestionVoteType.DOWNVOTE;

  return (
    <div 
      className={`bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col ${className} hover:shadow-lg dark:hover:shadow-gray-700/50 transition-shadow duration-200 cursor-pointer`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewDetails(suggestion);}}
      aria-label={`Visualizar detalhes da sugestão ${title}`}
    >
      <div className="flex-grow p-4 mb-3"> {/* Moved padding to inner div */}
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-lg font-semibold text-primary dark:text-sky-400 line-clamp-2" title={title}>{title}</h3>
          <DropdownMenu items={actionItems} ariaLabel={`Ações para ${title}`} />
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 space-x-2">
            {isAnonymous ? (
                <span className="flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-400/20 dark:text-yellow-300 font-medium">
                    <Zap size={12} className="mr-1" />
                    Sugestão Anônima
                </span>
            ) : (
                 <span className="flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-sky-500/20 dark:text-sky-300 font-medium">
                    <User size={12} className="mr-1" />
                    Por: {authorId || "Colaborador"} {/* Display mock author or generic term */}
                </span>
            )}
          <span className="text-gray-400 dark:text-gray-600">•</span>
          <span>Atualizado em: {formatDateToDisplay(updatedAt)}</span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed line-clamp-4" title={description}>
            {description}
        </p>
      </div>

      <div className="mt-auto border-t border-gray-100 dark:border-gray-700/50 pt-3 px-4 pb-4 flex justify-between items-center"> {/* Added padding */}
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            className={`p-1.5 ${isUpvotedByUser 
                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-400/10 hover:bg-green-100 dark:hover:bg-green-400/20' 
                : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-400/10'}`}
            aria-pressed={isUpvotedByUser}
            aria-label="Concordo"
          >
            <ThumbsUp size={16} className={isUpvotedByUser ? "fill-current" : ""} />
            <span className="ml-1.5 text-xs font-medium">{upvotes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownvote}
            className={`p-1.5 ${isDownvotedByUser 
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 hover:bg-red-100 dark:hover:bg-red-400/20' 
                : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10'}`}
            aria-pressed={isDownvotedByUser}
            aria-label="Discordo"
          >
            <ThumbsDown size={16} className={isDownvotedByUser ? "fill-current" : ""}/>
            <span className="ml-1.5 text-xs font-medium">{downvotes}</span>
          </Button>
        </div>
        {/* Potentially add a comment count or link to comments here */}
      </div>
    </div>
  );
};

export default SuggestionCard;
