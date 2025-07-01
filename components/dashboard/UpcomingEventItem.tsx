

import React from 'react';
import { Link } from 'react-router-dom';
import { Event, EventType } from '../../types';
import { formatDateToDisplay } from '../../utils/dateUtils';
import { Calendar, Clock, Zap, Briefcase } from 'lucide-react';

interface UpcomingEventItemProps {
  event: Event;
}

const UpcomingEventItem: React.FC<UpcomingEventItemProps> = ({ event }) => {
  const IconComponent = event.type === EventType.LEMBRETE ? Zap : Briefcase;
  const iconColor = event.type === EventType.LEMBRETE 
    ? 'text-yellow-500 dark:text-yellow-400' 
    : 'text-blue-500 dark:text-sky-300'; // Updated dark mode blue
  const iconBg = event.type === EventType.LEMBRETE 
    ? 'bg-yellow-50 dark:bg-yellow-400/10' 
    : 'bg-blue-50 dark:bg-sky-500/10';


  return (
    <Link 
      to={`/calendar?date=${event.date}`} // Simple link, could be more sophisticated
      className="block p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition-colors duration-150 group"
    >
      <div className="flex items-start space-x-3">
        <div className={`mt-1 p-1.5 ${iconBg} rounded-full shadow-sm border border-gray-100 dark:border-gray-600/50 ${iconColor}`}>
          <IconComponent size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-sky-400 truncate" title={event.title}>
            {event.title}
          </h4>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5 space-x-2">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1 text-gray-400 dark:text-gray-500" />
              <span>{formatDateToDisplay(event.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={12} className="mr-1 text-gray-400 dark:text-gray-500" />
              <span>{event.time}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UpcomingEventItem;