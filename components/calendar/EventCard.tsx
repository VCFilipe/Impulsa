import React from 'react';
import { Event, EventType } from '../../types';
import { formatDateToDisplay, parseISO, isAfter, addDays, isBefore, isSameDay } from '../../utils/dateUtils';
import { Edit2, Trash2, Clock, Tag, Briefcase, Zap, CheckCircle, XCircle, UserCheck, Star } from 'lucide-react';
import Button from '../ui/Button';
// Removed unused date-fns direct imports, rely on dateUtils

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onMarkAttendance?: (event: Event) => void;
  onEvaluate?: (event: Event) => void;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete, onMarkAttendance, onEvaluate, className }) => {
  const { title, description, date, time, category, type, isEvaluable, requiresAttendance } = event;

  const getEventTypeStyling = (eventType: EventType) => {
    if (eventType === EventType.EVENTO) {
      return {
        icon: <Briefcase size={14} className="text-blue-600 dark:text-sky-300" />, // Updated dark mode color
        textColor: 'text-blue-700 dark:text-sky-300',
        bgColor: 'bg-blue-100 dark:bg-sky-500/20',
      };
    }
    return {
      icon: <Zap size={14} className="text-yellow-600 dark:text-yellow-400" />,
      textColor: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-100 dark:bg-yellow-400/20',
    };
  };

  const eventTypeStyling = getEventTypeStyling(type);
  
  const currentDateTime = new Date();
  const eventStartDateTime = parseISO(`${event.date}T${event.time}`);

  // "Marcar Presença": Enabled if event.datetime > current.datetime (event is in the future)
  const eventIsInTheFuture = isAfter(eventStartDateTime, currentDateTime);

  const canMarkAttendance =
    type === EventType.EVENTO &&
    requiresAttendance &&
    onMarkAttendance && 
    eventIsInTheFuture;

  // "Avaliar": Enabled if event.datetime <= current.datetime AND current.datetime <= event.datetime + 7 days
  const eventHasOccurredForEval = !isAfter(eventStartDateTime, currentDateTime); 
  const evaluationDeadline = addDays(eventStartDateTime, 7);
  const isWithinEvaluationTimeWindow = !isAfter(currentDateTime, evaluationDeadline); 

  const canEvaluate =
    type === EventType.EVENTO &&
    isEvaluable &&
    onEvaluate && 
    eventHasOccurredForEval &&
    isWithinEvaluationTimeWindow;

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex flex-col ${className}`}>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-primary dark:text-sky-400 mb-1.5">{title}</h3>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 space-x-3">
          <div className="flex items-center">
            <Clock size={14} className="mr-1 text-gray-400 dark:text-gray-500" />
            <span>{formatDateToDisplay(date)} às {time}</span>
          </div>
          <div className="flex items-center">
            <Tag size={14} className="mr-1 text-gray-400 dark:text-gray-500" />
            <span>{category}</span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed line-clamp-3">{description}</p>

        <div className="space-y-1.5 text-xs mb-3">
            <div className="flex items-center">
                {eventTypeStyling.icon}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full font-medium ${eventTypeStyling.textColor} ${eventTypeStyling.bgColor}`}>
                    {type}
                </span>
            </div>

          {type === EventType.EVENTO && (
            <>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                {isEvaluable ? <CheckCircle size={14} className="mr-1.5 text-green-500 dark:text-green-400" /> : <XCircle size={14} className="mr-1.5 text-red-500 dark:text-red-400" />}
                <span>Avaliável: {isEvaluable ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                {requiresAttendance ? <CheckCircle size={14} className="mr-1.5 text-green-500 dark:text-green-400" /> : <XCircle size={14} className="mr-1.5 text-red-500 dark:text-red-400" />}
                <span>Exige presença: {requiresAttendance ? 'Sim' : 'Não'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-end items-center gap-2 border-t border-gray-100 dark:border-gray-700/50 pt-3 mt-auto">
        {canMarkAttendance && (
          <Button variant="outline" size="sm" onClick={() => onMarkAttendance && onMarkAttendance(event)} leftIcon={<UserCheck size={14}/>} className="text-xs">
            Marcar Presença
          </Button>
        )}
        {canEvaluate && (
          <Button variant="outline" size="sm" onClick={() => onEvaluate && onEvaluate(event)} leftIcon={<Star size={14}/>} className="text-xs">
            Avaliar
          </Button>
        )}
        <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(event)} className="text-primary dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-sky-400/10 p-1.5" aria-label="Editar evento">
              <Edit2 size={16}/>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(event.id)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 p-1.5" aria-label="Excluir evento">
              <Trash2 size={16}/>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;