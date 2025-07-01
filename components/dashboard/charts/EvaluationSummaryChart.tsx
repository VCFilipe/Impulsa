

import React, { useState, useEffect, useCallback } from 'react';
import { Star, Briefcase, ClipboardCheck, StarHalf } from 'lucide-react'; // Added StarHalf
import type { LucideProps } from 'lucide-react'; // Import LucideProps
import { Event, EventType } from '../../../types';
import * as evaluationService from '../../../services/evaluationService';
import { isWithinInterval, endOfToday } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import subDays from 'date-fns/subDays';
import chartStartOfToday from 'date-fns/startOfToday'; 

interface LocalEvaluationChartData {
  avgOrganization: number;
  avgContent: number;
  totalEvaluations: number;
  totalRelevantEvents: number;
}

interface EvaluationSummaryChartProps {
  allEvents: Event[];
  timeFilter: string;
}

// New RatingDisplay component for better visual representation
interface RatingDisplayProps {
  label: string;
  rating: number;
  icon: React.ReactElement<LucideProps>; // Specify LucideProps for the icon element
  colorClasses: {
    text: string; // e.g., 'text-blue-500 dark:text-sky-400'
    // bgMain is no longer used
  };
  isLoading?: boolean;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ label, rating, icon, colorClasses, isLoading }) => {
  const renderStars = () => {
    const stars = [];
    const totalStars = 5;
    for (let i = 1; i <= totalStars; i++) {
      if (rating >= i) {
        stars.push(<Star key={`star-${i}`} size={20} className={`${colorClasses.text} fill-current`} />);
      } else if (rating >= i - 0.5) {
        stars.push(<StarHalf key={`star-${i}`} size={20} className={`${colorClasses.text} fill-current`} />);
      } else {
        stars.push(<Star key={`star-${i}`} size={20} className="text-gray-300 dark:text-gray-600 fill-current" />);
      }
    }
    return stars;
  };
  
  const renderSkeletonStars = () => {
    const stars = [];
    const totalStars = 5;
    for (let i = 1; i <= totalStars; i++) {
        stars.push(<div key={`skeleton-star-${i}`} className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>);
    }
    return stars;
  }


  if (isLoading) {
    return (
      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center mb-2">
          <div className={`h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded-md mr-2.5`}></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/5"></div>
        </div>
        <div className="flex items-center space-x-1">
          {renderSkeletonStars()}
        </div>
      </div>
    );
  }


  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-150">
      <div className="flex items-center mb-1.5">
        {React.cloneElement<LucideProps>(icon, { size: 18, className: `${colorClasses.text} mr-2 flex-shrink-0` })}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={label}>{label}</span>
      </div>
      <div className="flex items-center space-x-0.5" role="img" aria-label={`${label}: ${rating > 0 ? rating.toFixed(1) : 'N/A'} de 5 estrelas`}>
        {renderStars()}
      </div>
    </div>
  );
};


const EvaluationSummaryChart: React.FC<EvaluationSummaryChartProps> = ({ allEvents, timeFilter }) => {
  const [chartData, setChartData] = useState<LocalEvaluationChartData>({ avgOrganization: 0, avgContent: 0, totalEvaluations: 0, totalRelevantEvents: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const getFilteredEventsByDate = useCallback((events: Event[], filter: string): Event[] => {
    if (filter === 'total') return events;
    const today = endOfToday();
    let startDate: Date;
    if (filter === '7d') startDate = chartStartOfToday(subDays(today, 6));
    else if (filter === '30d') startDate = chartStartOfToday(subDays(today, 29));
    else return events;
    
    return events.filter(event => {
        try {
            const eventDate = parseISO(event.date);
            return isWithinInterval(eventDate, { start: startDate, end: today });
        } catch { return false; }
    });
  }, []);

  const calculateChartData = useCallback((events: Event[], filter: string): LocalEvaluationChartData => {
    const filteredEvents = getFilteredEventsByDate(events, filter);
    let totalOrgRatingSum = 0;
    let totalContentRatingSum = 0;
    let evaluationsCount = 0;
    
    const relevantEvents = filteredEvents.filter(
      event => event.type === EventType.EVENTO && event.isEvaluable
    );

    relevantEvents.forEach(event => {
      const summary = evaluationService.getEvaluationSummaryForEvent(event.id);
      if (summary.count > 0) {
        totalOrgRatingSum += summary.avgOrgRating * summary.count;
        totalContentRatingSum += summary.avgContentRating * summary.count;
        evaluationsCount += summary.count;
      }
    });

    return {
      avgOrganization: evaluationsCount > 0 ? totalOrgRatingSum / evaluationsCount : 0,
      avgContent: evaluationsCount > 0 ? totalContentRatingSum / evaluationsCount : 0,
      totalEvaluations: evaluationsCount,
      totalRelevantEvents: relevantEvents.length
    };
  }, [getFilteredEventsByDate]);

  useEffect(() => {
    setIsLoading(true);
    const newChartData = calculateChartData(allEvents, timeFilter);
    setChartData(newChartData);
    setTimeout(() => setIsLoading(false), 300); // Slightly longer for better perception of loading
  }, [allEvents, timeFilter, calculateChartData]);

  const { avgOrganization, avgContent, totalEvaluations, totalRelevantEvents } = chartData;

  if (totalRelevantEvents === 0 && !isLoading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 min-h-[200px] flex flex-col justify-center items-center">
        <Star size={36} className="mb-3 text-gray-400 dark:text-gray-500" />
        <p className="font-medium">Nenhum evento avaliável.</p>
        <p className="text-xs">Não há eventos que permitam avaliação no período selecionado.</p>
      </div>
    );
  }

  if (totalEvaluations === 0 && totalRelevantEvents > 0 && !isLoading) {
     return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 min-h-[200px] flex flex-col justify-center items-center">
        <Star size={36} className="mb-3 text-gray-400 dark:text-gray-500" />
        <p className="font-medium">Nenhuma avaliação ainda.</p>
        <p className="text-xs">Os {totalRelevantEvents} evento(s) avaliáveis no período não possuem feedbacks.</p>
      </div>
    );
  }
  

  return (
    <div className="space-y-3 py-2 min-h-[200px] flex flex-col justify-center">
      <RatingDisplay 
        label="Organização" 
        rating={avgOrganization} 
        icon={<Briefcase />} 
        colorClasses={{
            text: 'text-blue-600 dark:text-sky-400',
        }}
        isLoading={isLoading} 
      />
      <RatingDisplay 
        label="Conteúdo" 
        rating={avgContent} 
        icon={<ClipboardCheck />} 
        colorClasses={{
            text: 'text-green-600 dark:text-emerald-400',
        }}
        isLoading={isLoading}
      />
      {!isLoading && totalEvaluations > 0 && (
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1">
          Média de {totalEvaluations} avaliação(ões) de {totalRelevantEvents} evento(s).
        </p>
      )}
       {!isLoading && totalEvaluations === 0 && totalRelevantEvents > 0 && (
         <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1">
           {totalRelevantEvents} evento(s) aguardando avaliações.
         </p>
       )}
    </div>
  );
};

export default EvaluationSummaryChart;