
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format as dfFormat, addYears, getYear, getMonth } from 'date-fns';
import dateFnsSubYears from 'date-fns/subYears';
import dateFnsSetMonth from 'date-fns/setMonth';
import dateFnsSetYear from 'date-fns/setYear';
import { ptBR } from 'date-fns/locale/pt-BR';
import Button from '../ui/Button';

interface MonthYearSelectorProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  minYearOffset?: number;
  maxYearOffset?: number;
}

const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  currentDate,
  onDateChange,
  minYearOffset = 10, // Max 10 years in the past from current year of the calendar view
  maxYearOffset = 10, // Max 10 years in the future from current year of the calendar view
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayYear, setDisplayYear] = useState(getYear(currentDate));
  const wrapperRef = useRef<HTMLDivElement>(null);

  const actualCurrentYear = getYear(new Date()); // Today's actual year
  const minOverallSelectableYear = actualCurrentYear - minYearOffset;
  const maxOverallSelectableYear = actualCurrentYear + maxYearOffset;


  useEffect(() => {
    setDisplayYear(getYear(currentDate));
  }, [currentDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = dateFnsSetMonth(dateFnsSetYear(new Date(currentDate.setDate(1)), displayYear), monthIndex); // Set day to 1 to avoid month overflow
    onDateChange(newDate);
    setIsOpen(false);
  };

  const changeYear = (amount: number) => {
    setDisplayYear(prev => {
        const newYearValue = prev + amount; 
        // Ensure the new year is within the overall selectable range
        if (newYearValue < minOverallSelectableYear) return minOverallSelectableYear;
        if (newYearValue > maxOverallSelectableYear) return maxOverallSelectableYear;
        return newYearValue; 
    });
  };

  const formattedCurrentDate = (dfFormat(currentDate, 'MMMM yyyy', { locale: ptBR })).charAt(0).toUpperCase() + (dfFormat(currentDate, 'MMMM yyyy', { locale: ptBR })).slice(1);

  const monthsShort = Array.from({ length: 12 }, (_, i) => {
    const monthName = dfFormat(new Date(2000, i, 1), 'MMM', { locale: ptBR });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  });

  return (
    <div className="relative" ref={wrapperRef}>
      <Button
        variant="ghost"
        className="text-xl sm:text-2xl font-semibold text-primary dark:text-sky-400 hover:bg-primary/5 dark:hover:bg-sky-400/10 px-3 py-1.5 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Selecionar mês e ano, atualmente ${formattedCurrentDate}`}
      >
        {formattedCurrentDate}
      </Button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 p-3 transform -translate-x-1/2 left-1/2 sm:left-auto sm:translate-x-0 sm:right-1/2 sm:translate-x-[calc(50%-theme(space.8))] md:left-1/2 md:-translate-x-1/2">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={() => changeYear(-1)} disabled={displayYear <= minOverallSelectableYear} className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-sky-400" aria-label="Ano anterior">
              <ChevronLeft size={18} />
            </Button>
            <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{displayYear}</span>
            <Button variant="ghost" size="sm" onClick={() => changeYear(1)} disabled={displayYear >= maxOverallSelectableYear} className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-sky-400" aria-label="Próximo ano">
              <ChevronRight size={18} />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {monthsShort.map((month, index) => (
              <Button
                key={month}
                variant="ghost"
                size="sm"
                className={`w-full text-xs font-medium py-1.5 px-1 rounded-md transition-colors
                  ${getMonth(currentDate) === index && getYear(currentDate) === displayYear 
                    ? 'bg-primary text-white hover:bg-primary/90 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-sky-400'
                  }`}
                onClick={() => handleMonthSelect(index)}
                aria-label={`Selecionar ${month} de ${displayYear}`}
              >
                {month}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Removed subYears direct export as it is imported with an alias and used internally.
// If subYears from date-fns/subYears is needed externally, it should be explicitly exported.
export default MonthYearSelector;
