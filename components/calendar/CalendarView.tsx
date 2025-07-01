import React from 'react';
import { Event, EventType } from '../../types';
import { formatDateToDisplay, getMonthName, getDayOfWeek, addMonths, subMonths, isSameDay, parseISO } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
// EventCard import removed as it's no longer rendered here
import MonthYearSelector from './MonthYearSelector'; 

interface CalendarViewProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  events: Event[];
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  // Props related to displaying selected day's events are removed
  onEditEvent: (event: Event) => void; // Kept if calendar cells have quick actions
  onDeleteEvent: (eventId: string) => void; // Kept if calendar cells have quick actions
  onMarkAttendance: (event: Event) => void; // Kept if calendar cells have quick actions
  onEvaluate: (event: Event) => void; // Kept if calendar cells have quick actions
}

const MAX_EVENTS_VISIBLE_IN_CELL = 2;

const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  setCurrentMonth,
  events,
  selectedDate,
  setSelectedDate,
  // onEditEvent, // These might be removed if not used directly in cells
  // onDeleteEvent,
  // onMarkAttendance,
  // onEvaluate,
}) => {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonthArray: Date[] = [];
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    daysInMonthArray.push(new Date(year, month, day));
  }

  const startingDayOfWeek = getDayOfWeek(firstDayOfMonth); // 0 for Sunday

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const eventsByIsoDateString: { [key: string]: Event[] } = {};
  events.forEach(event => {
    const isoDate = parseISO(event.date).toDateString(); 
    if (!eventsByIsoDateString[isoDate]) {
      eventsByIsoDateString[isoDate] = [];
    }
    eventsByIsoDateString[isoDate].push(event);
    eventsByIsoDateString[isoDate].sort((a,b) => a.time.localeCompare(b.time));
  });


  return (
    <div className="flex flex-col h-full p-4 sm:p-6"> {/* Modified: flex, flex-col, h-full */}
      <div className="shrink-0 flex items-center justify-between mb-6 text-center"> {/* Modified: shrink-0 */}
        <Button variant="ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} aria-label="Mês anterior" className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-sky-400">
          <ChevronLeft size={20} />
        </Button>
        
        <MonthYearSelector
          currentDate={currentMonth}
          onDateChange={setCurrentMonth}
        />

        <Button variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} aria-label="Próximo mês" className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-sky-400">
          <ChevronRight size={20} />
        </Button>
      </div>

      {/* Grid for days of week and day cells */}
      <div className="flex-grow grid grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))] gap-px border-t border-l border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700"> {/* Modified: flex-grow, grid-rows definition */}
        {daysOfWeek.map(day => (
          <div key={day} className="text-center py-2 font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border-r border-b border-gray-200 dark:border-gray-600">
            {day}
          </div>
        ))}
        {Array(startingDayOfWeek).fill(null).map((_, index) => (
            <div key={`empty-start-${index}`} className="bg-gray-50 dark:bg-gray-700/30 border-r border-b border-gray-200 dark:border-gray-600"></div>
        ))}
        {daysInMonthArray.map(day => {
          const dayKey = day.toDateString();
          const eventsOnDay = eventsByIsoDateString[dayKey] || [];
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dayKey}
              className={`p-1.5 sm:p-2 cursor-pointer transition-colors bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-600 hover:bg-primary/5 dark:hover:bg-sky-500/10 relative flex flex-col overflow-hidden
                ${isSelected ? 'ring-2 ring-primary dark:ring-sky-500 z-10' : ''}
                ${isToday && !isSelected ? 'bg-secondary/5 dark:bg-red-500/10' : ''}
              `} // Removed min-h
              onClick={() => handleDayClick(day)}
              role="button"
              aria-label={`Eventos para ${formatDateToDisplay(day)}`}
            >
              <span className={`text-xs sm:text-sm font-medium mb-1 ${isToday ? 'text-secondary dark:text-red-400 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>{day.getDate()}</span>
              <div className="space-y-0.5 text-[10px] sm:text-xs leading-tight flex-grow">
                {eventsOnDay.slice(0, MAX_EVENTS_VISIBLE_IN_CELL).map(event => (
                  <div key={event.id} className="flex items-center">
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${event.type === EventType.EVENTO ? 'bg-primary dark:bg-sky-500' : 'bg-yellow-400 dark:bg-yellow-500'}`}></span>
                    <p className="truncate text-gray-700 dark:text-gray-300" title={event.title}>{event.title}</p>
                  </div>
                ))}
                {eventsOnDay.length > MAX_EVENTS_VISIBLE_IN_CELL && (
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">+{eventsOnDay.length - MAX_EVENTS_VISIBLE_IN_CELL} mais</p>
                )}
              </div>
            </div>
          );
        })}
        {Array((7 - ((daysInMonthArray.length + startingDayOfWeek) % 7)) % 7).fill(null).map((_, index) => (
            <div key={`empty-end-${index}`} className="bg-gray-50 dark:bg-gray-700/30 border-r border-b border-gray-200 dark:border-gray-600"></div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;