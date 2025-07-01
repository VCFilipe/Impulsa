
import React from 'react';
import { Announcement } from '../../types';
import { formatDateToDisplay } from '../../utils/dateUtils';
import { Edit2, Trash2, Eye, Pin, Tag, UserCircle, PinOff, CheckCircle, Circle } from 'lucide-react';
import Button from '../ui/Button';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';
import { DEFAULT_ANNOUNCEMENT_IMAGE_URL } from '../../constants';

interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcementId: string) => void;
  onViewDetails: (announcement: Announcement) => void;
  onTogglePin: (announcementId: string) => void;
  onMarkAsRead: (announcementId: string) => void;
  onMarkAsUnread: (announcementId: string) => void;
  className?: string;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ 
  announcement, onEdit, onDelete, onViewDetails, onTogglePin, onMarkAsRead, onMarkAsUnread, className 
}) => {
  const { id, title, content, category, authorName, updatedAt, isPinned, imageUrl, isRead } = announcement;
  
  const effectiveImageUrl = imageUrl || DEFAULT_ANNOUNCEMENT_IMAGE_URL;

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Avisos Gerais': return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
      case 'RH Comunica': return 'bg-blue-100 text-blue-700 dark:bg-sky-700 dark:text-sky-200';
      case 'Eventos EmpresariaIS': return 'bg-purple-100 text-purple-700 dark:bg-violet-700 dark:text-violet-200';
      case 'Tecnologia e Novos Sistemas': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-200';
      case 'Conquistas de Equipes': return 'bg-green-100 text-green-700 dark:bg-emerald-700 dark:text-emerald-200';
      case 'Projetos e Atualizações': return 'bg-yellow-100 text-yellow-700 dark:bg-amber-700 dark:text-amber-200';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
    }
  };

  const actionItems: DropdownMenuItem[] = [
    {
      id: 'view-details',
      label: 'Ver Detalhes',
      icon: <Eye size={16} />,
      onClick: () => onViewDetails(announcement),
    },
    {
      id: 'toggle-pin',
      label: isPinned ? 'Desfixar do Topo' : 'Fixar no Topo',
      icon: isPinned ? <PinOff size={16} /> : <Pin size={16} />,
      onClick: () => onTogglePin(id),
    },
     {
      id: 'toggle-read',
      label: isRead ? 'Marcar como não lido' : 'Marcar como lido',
      icon: isRead ? <Circle size={16} /> : <CheckCircle size={16} />,
      onClick: () => isRead ? onMarkAsUnread(id) : onMarkAsRead(id),
    },
    { id: 'separator-1', label: '---', onClick: () => {} },
    {
      id: 'edit',
      label: 'Editar Comunicado',
      icon: <Edit2 size={16} />,
      onClick: () => onEdit(announcement),
    },
    {
      id: 'delete',
      label: 'Excluir Comunicado',
      icon: <Trash2 size={16} />,
      onClick: () => onDelete(id),
      isDanger: true,
    },
  ];
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, [role="menu"], [role="menuitem"]')) {
      return;
    }
    onViewDetails(announcement);
  };

  const renderContentSnippet = (htmlContent: string, maxLength: number = 150) => {
    const text = htmlContent.replace(/<[^>]+>/g, ' '); 
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };


  return (
    <div 
      className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl border ${isPinned ? 'border-primary dark:border-sky-500 ring-2 ring-primary/20 dark:ring-sky-500/30' : 'border-gray-200 dark:border-gray-700'} flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-700/50 cursor-pointer ${className} ${!isRead ? 'border-l-4 border-l-blue-500 dark:border-l-sky-400' : ''}`}
      onClick={handleCardClick}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onViewDetails(announcement); }}}
      aria-labelledby={`announcement-title-${id}`}
      aria-describedby={!isRead ? `unread-indicator-${id}` : undefined}
    >
      {effectiveImageUrl && (
        <div className="w-full h-40 overflow-hidden relative">
          <img src={effectiveImageUrl} alt={`Imagem para ${title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
           {!isRead && (
             <span id={`unread-indicator-${id}`} className="absolute top-2 right-2 w-3 h-3 bg-blue-500 dark:bg-sky-400 rounded-full ring-2 ring-white dark:ring-gray-800" title="Não lido"></span>
           )}
        </div>
      )}
      
      <div className="flex-grow p-5">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center min-w-0">
                 {!effectiveImageUrl && !isRead && ( // Dot on content only if NO image (neither real nor default)
                     <span id={`unread-indicator-${id}`} className="w-2.5 h-2.5 bg-blue-500 dark:bg-sky-400 rounded-full mr-2 flex-shrink-0" title="Não lido"></span>
                 )}
                <h3 
                id={`announcement-title-${id}`} 
                className={`text-lg font-semibold ${!isRead ? 'text-blue-700 dark:text-sky-300' : 'text-primary dark:text-sky-400'} line-clamp-2 flex-grow`} /* Removed hover:underline */
                title={title}
                >
                {title}
                </h3>
            </div>
            <div className="flex-shrink-0 pl-2">
                <DropdownMenu items={actionItems} ariaLabel={`Ações para ${title}`} />
            </div>
        </div>
        
        <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 mb-3 gap-x-3 gap-y-1">
          <div className={`flex items-center px-2 py-0.5 rounded-full font-medium ${getCategoryColor(category)}`}>
            <Tag size={12} className="mr-1" />
            <span>{category}</span>
          </div>
          <div className="flex items-center">
            <UserCircle size={14} className="mr-1 text-gray-400 dark:text-gray-500" />
            <span>Por: {authorName}</span>
          </div>
          <div className="flex items-center">
            <span>Atualizado em: {formatDateToDisplay(updatedAt)}</span>
          </div>
          {isPinned && (
            <div className="flex items-center text-amber-600 dark:text-amber-400">
              <Pin size={14} className="mr-1 fill-current" />
              <span>Fixado</span>
            </div>
          )}
        </div>

        <p 
            className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3" 
            title="Clique para ler mais"
        >
            {renderContentSnippet(content)}
        </p>
      </div>
    </div>
  );
};

export default AnnouncementCard;
