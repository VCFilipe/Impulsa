
import React from 'react';
import { Announcement } from '../../types';
import { formatDateToDisplay } from '../../utils/dateUtils';
import { Megaphone } from 'lucide-react';
// Button import removed as it's no longer used

interface UnreadAnnouncementItemProps {
  announcement: Announcement;
  onViewDetails: (announcement: Announcement) => void;
}

const UnreadAnnouncementItem: React.FC<UnreadAnnouncementItemProps> = ({ announcement, onViewDetails }) => {
  
  const getCategoryColorClasses = (categoryName: string) => {
    switch(categoryName) {
        case 'RH Comunica': return 'text-blue-600 dark:text-sky-400';
        case 'Eventos EmpresariaIS': return 'text-purple-600 dark:text-violet-400';
        case 'Tecnologia e Novos Sistemas': return 'text-indigo-600 dark:text-indigo-400';
        case 'Conquistas de Equipes': return 'text-green-600 dark:text-emerald-400';
        case 'Projetos e Atualizações': return 'text-yellow-600 dark:text-amber-400';
        default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div 
      className="p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition-colors duration-150 group cursor-pointer"
      onClick={() => onViewDetails(announcement)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewDetails(announcement);}}
      tabIndex={0}
      role="button"
      aria-label={`Ler comunicado: ${announcement.title}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`mt-1 p-1.5 bg-blue-50 dark:bg-sky-500/10 rounded-full shadow-sm border border-gray-100 dark:border-gray-600/50 text-blue-500 dark:text-sky-400`}>
          <Megaphone size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 
            className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-sky-400 truncate" 
            title={announcement.title}
          >
            {announcement.title}
          </h4>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5 space-x-2">
            <span className={`${getCategoryColorClasses(announcement.category)} font-medium`}>{announcement.category}</span>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <span>{formatDateToDisplay(announcement.createdAt)}</span>
          </div>
        </div>
        {/* "Ler" button removed */}
      </div>
    </div>
  );
};

export default UnreadAnnouncementItem;
