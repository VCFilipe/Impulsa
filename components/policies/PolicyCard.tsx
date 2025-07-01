
import React from 'react';
import { Policy, PolicyFile } from '../../types';
import { formatDateToDisplay } from '../../utils/dateUtils';
import { Edit2, Trash2, Paperclip, Eye, Tag } from 'lucide-react';
import Button from '../ui/Button';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';

interface PolicyCardProps {
  policy: Policy;
  onEdit: (policy: Policy) => void;
  onDelete: (policyId: string) => void;
  onViewFile: (file: PolicyFile) => void; 
  onViewDetails: (policy: Policy) => void; // New prop
  className?: string;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onEdit, onDelete, onViewFile, onViewDetails, className }) => {
  const { title, description, category, files, updatedAt } = policy;
  
  const getCategoryColor = (cat: string) => {
    // Adjusted for dark mode for better contrast on dark backgrounds for some colors
    // Assuming the text color is light on these backgrounds in dark mode.
    switch(cat) {
      case 'Recursos Humanos': return 'bg-blue-100 text-blue-700 dark:bg-sky-700 dark:text-sky-200';
      case 'Financeiro': return 'bg-green-100 text-green-700 dark:bg-emerald-700 dark:text-emerald-200';
      case 'Tecnologia da Informação': return 'bg-purple-100 text-purple-700 dark:bg-violet-700 dark:text-violet-200';
      case 'Compliance': return 'bg-yellow-100 text-yellow-700 dark:bg-amber-700 dark:text-amber-200';
      case 'Geral': return 'bg-gray-100 text-gray-700 dark:bg-slate-600 dark:text-slate-200';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
    }
  }

  const actionItems: DropdownMenuItem[] = [
    {
      id: 'view-details',
      label: 'Visualizar Detalhes',
      icon: <Eye size={16} />,
      onClick: () => onViewDetails(policy),
    },
    { id: 'separator-1', label: '---', onClick: () => {} },
    {
      id: 'edit',
      label: 'Editar Política',
      icon: <Edit2 size={16} />,
      onClick: () => onEdit(policy),
    },
    {
      id: 'delete',
      label: 'Excluir Política',
      icon: <Trash2 size={16} />,
      onClick: () => onDelete(policy.id),
      isDanger: true,
    },
  ];
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent modal opening if a button or the dropdown within the card was clicked
    if ((e.target as HTMLElement).closest('button, [role="menu"], [role="menuitem"]')) {
      return;
    }
    onViewDetails(policy);
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col ${className} hover:shadow-lg dark:hover:shadow-gray-700/50 transition-shadow duration-200 cursor-pointer`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewDetails(policy);}}
      aria-label={`Visualizar detalhes da política ${title}`}
    >
      <div className="flex-grow p-4 mb-3"> {/* Moved padding to an inner div for better click area */}
        <div className="flex justify-between items-start mb-1.5">
            <h3 className="text-lg font-semibold text-primary dark:text-sky-400 line-clamp-2" title={title}>{title}</h3>
            <DropdownMenu items={actionItems} ariaLabel={`Ações para ${title}`} />
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 space-x-3">
          <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
            <Tag size={12} className="mr-1" />
            <span>{category}</span>
          </div>
          <span className="text-gray-400 dark:text-gray-600">•</span>
          <div className="flex items-center">
            <span className="mr-1">Atualizado em:</span>
            <span>{formatDateToDisplay(updatedAt)}</span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed line-clamp-3" title={description}>
            {description}
        </p>
      </div>

      {files && files.length > 0 && (
        <div className="mt-auto border-t border-gray-100 dark:border-gray-700/50 pt-3 px-4 pb-4"> {/* Added padding for file section */}
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
            <Paperclip size={14} className="mr-1.5 text-primary dark:text-sky-400" />
            Arquivos Anexados ({files.length})
          </h4>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {files.map(file => (
              <div 
                key={file.id} 
                className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 p-1.5 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onViewFile(file); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onViewFile(file); }}}
                aria-label={`Visualizar arquivo ${file.name}`}
              >
                <span className="text-gray-600 dark:text-gray-300 truncate mr-2 pointer-events-none" title={file.name}>{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onViewFile(file);}} 
                  className="text-primary dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-sky-400/10 p-1 ml-auto flex-shrink-0"
                  aria-label={`Visualizar arquivo ${file.name}`}
                  title={`Visualizar ${file.name}`}
                >
                  <Eye size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
       {(!files || files.length === 0) && (
         <div className="mt-auto border-t border-gray-100 dark:border-gray-700/50 pt-3 px-4 pb-4"> {/* Added padding for file section */}
            <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center">Nenhum arquivo anexado.</p>
         </div>
       )}
    </div>
  );
};

export default PolicyCard;