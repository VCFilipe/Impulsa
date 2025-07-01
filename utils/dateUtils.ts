
import {
  format as dfFormat,
  isValid as dfIsValid,
  getDay as dfGetDay,
  addMonths,
  isSameDay,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  addDays,
  endOfDay, // Added comma here
} from 'date-fns';
import type { Locale } from 'date-fns/locale/types'; // Corrected import path
import dfParse from 'date-fns/parse';
import { ptBR } from 'date-fns/locale/pt-BR';

// Corrected individual imports for functions not found in the main 'date-fns' export
import dfParseISO from 'date-fns/parseISO';
import dfStartOfMonth from 'date-fns/startOfMonth';
import dateFnsSubMonths from 'date-fns/subMonths'; // Aliased to avoid potential naming conflicts if re-exporting 'subMonths'
import dateFnsSubYears from 'date-fns/subYears';   // Aliased
import dfSetMonth from 'date-fns/setMonth';
import dfSetYear from 'date-fns/setYear';
import dfStartOfToday from 'date-fns/startOfToday';

// Format date from 'YYYY-MM-DD' string or Date object to 'dd/MM/yyyy'
export const formatDateToDisplay = (dateInput: string | Date): string => {
  try {
    const dateObj = typeof dateInput === 'string' ? dfParseISO(dateInput) : dateInput;
    if (dfIsValid(dateObj)) {
      return dfFormat(dateObj, 'dd/MM/yyyy', { locale: ptBR });
    }
    return 'Data inválida';
  } catch (error) {
    return 'Data inválida';
  }
};

// Format date from Date object to 'YYYY-MM-DD' for storage
export const formatDateForStorage = (date: Date): string => {
  if (dfIsValid(date)) {
    return dfFormat(date, 'yyyy-MM-dd');
  }
  return dfFormat(new Date(), 'yyyy-MM-dd'); 
};

// Parse 'dd/MM/yyyy' string to Date object
export const parseDisplayDate = (dateStr: string): Date | null => {
  try {
    const parsedDate = dfParse(dateStr, 'dd/MM/yyyy', new Date());
    return dfIsValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    return null;
  }
};

export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = [];
  const numDays = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= numDays; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

export const getMonthName = (date: Date): string => {
  const monthAndYear = dfFormat(date, 'MMMM yyyy', { locale: ptBR });
  return monthAndYear.charAt(0).toUpperCase() + monthAndYear.slice(1);
};

export const getDayOfWeek = (date: Date): number => {
  return dfGetDay(date); // Use imported getDay
};

// --- Functions for MiniCalendar ---
export const getWeekDaysShort = (locale: Locale = ptBR): string[] => {
    const firstDayOfWeek = locale.options?.weekStartsOn ?? 0; // 0 for Sunday, 1 for Monday
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
        const dayIndex = (firstDayOfWeek + i) % 7;
        const dayName = dfFormat(new Date(2000, 0, dayIndex + (locale.options?.weekStartsOn === 1 ? 1 : 2) ), 'EEEEE', { locale }); // Using 'EEEEE' for single letter
        days.push(dayName.charAt(0).toUpperCase());
    }
    return days;
};

export const getStartOfMonth = (date: Date): Date => {
  return dfStartOfMonth(date);
};

export { dfParseISO as parseISO };
// Export other necessary date-fns functions if they were intended to be re-exported
// Ensuring the exported names match what other files expect (e.g., subMonths, subYears)
export { 
    addMonths, 
    dateFnsSubMonths as subMonths, // Export the imported version under the expected name
    isSameDay, 
    getMonth, 
    getYear, 
    dateFnsSubYears as subYears, // Export the imported version under the expected name
    dfSetMonth as setMonth, 
    dfSetYear as setYear, 
    isAfter, 
    isBefore, 
    dfStartOfToday as startOfToday, 
    addDays, 
    endOfDay 
};