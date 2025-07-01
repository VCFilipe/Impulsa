
import React, { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import { Event, EventType } from '../../../types';
import * as attendanceService from '../../../services/attendanceService';
import { isWithinInterval, endOfToday } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import subDays from 'date-fns/subDays';
import chartStartOfToday from 'date-fns/startOfToday'; // Aliased to avoid conflict

interface LocalAttendanceChartData {
  presencial: number;
  homeOffice: number;
  totalRelevantEvents: number;
}

interface AttendanceSummaryChartProps {
  allEvents: Event[];
  timeFilter: string;
}

// Helper function to describe an SVG arc path for a pie slice
function getPathData(cx: number, cy: number, radius: number, startAngleDeg: number, endAngleDeg: number): string {
    const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0; // -90 makes 0 degrees top
        return {
            x: centerX + r * Math.cos(angleInRadians),
            y: centerY + r * Math.sin(angleInRadians),
        };
    };

    const startPoint = polarToCartesian(cx, cy, radius, startAngleDeg);
    const endPoint = polarToCartesian(cx, cy, radius, endAngleDeg);
    const largeArcFlag = (endAngleDeg - startAngleDeg) % 360 > 180 ? '1' : '0';
    const d = ["M", cx, cy, "L", startPoint.x, startPoint.y, "A", radius, radius, 0, largeArcFlag, 1, endPoint.x, endPoint.y, "Z"].join(" ");
    return d;
}

const AttendanceSummaryChart: React.FC<AttendanceSummaryChartProps> = ({ allEvents, timeFilter }) => {
  const [chartData, setChartData] = useState<LocalAttendanceChartData>({ presencial: 0, homeOffice: 0, totalRelevantEvents: 0 });
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

  const calculateChartData = useCallback((events: Event[], filter: string): LocalAttendanceChartData => {
    const filteredEvents = getFilteredEventsByDate(events, filter);
    let presencial = 0;
    let homeOffice = 0;
    const relevantEvents = filteredEvents.filter(
      event => event.type === EventType.EVENTO && event.requiresAttendance
    );

    relevantEvents.forEach(event => {
      const summary = attendanceService.getAttendanceSummaryForEvent(event.id);
      presencial += summary.presencialCount;
      homeOffice += summary.homeOfficeCount;
    });
    return { presencial, homeOffice, totalRelevantEvents: relevantEvents.length };
  }, [getFilteredEventsByDate]);

  useEffect(() => {
    setIsLoading(true);
    // Simulate async operation for data calculation if needed, or just direct calculation
    const newChartData = calculateChartData(allEvents, timeFilter);
    setChartData(newChartData);
    // Simulate a slight delay for loading effect if calculations are very fast
    // For real async, this would be part of the async flow
    setTimeout(() => setIsLoading(false), 200); 
  }, [allEvents, timeFilter, calculateChartData]);


  const { presencial, homeOffice, totalRelevantEvents } = chartData;
  const totalAttendance = presencial + homeOffice;

  const presencialPercentage = totalAttendance > 0 ? (presencial / totalAttendance) * 100 : 0;
  const homeOfficePercentage = totalAttendance > 0 ? (homeOffice / totalAttendance) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse min-h-[200px] flex flex-col justify-center items-center">
        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mt-2"></div>
      </div>
    );
  }

  if (totalRelevantEvents === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 min-h-[200px] flex flex-col justify-center items-center">
        <Users size={32} className="mb-2 text-gray-400 dark:text-gray-500" />
        <p>Nenhum evento com registro de presença no período selecionado.</p>
      </div>
    );
  }
  
  if (totalAttendance === 0 && totalRelevantEvents > 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 min-h-[200px] flex flex-col justify-center items-center">
        <Users size={32} className="mb-2 text-gray-400 dark:text-gray-500" />
        <p>Nenhuma presença registrada para os {totalRelevantEvents} eventos relevantes no período.</p>
      </div>
    );
  }

  const radius = 45;
  const cx = 50;
  const cy = 50;

  const pieSlices = [
    { percent: presencialPercentage / 100, color: "fill-blue-500 dark:fill-sky-500", legendColor: "bg-blue-500 dark:bg-sky-500", label: "Presencial", value: presencial },
    { percent: homeOfficePercentage / 100, color: "fill-green-500 dark:fill-emerald-500", legendColor: "bg-green-500 dark:bg-emerald-500", label: "Home Office", value: homeOffice }
  ].filter(slice => slice.percent > 0);

  let currentAngle = 0;

  return (
    <div className="space-y-4 min-h-[200px] flex flex-col items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-32 h-32 sm:w-36 sm:h-36">
        {pieSlices.map((slice, index) => {
          if (slice.percent === 1) {
            return <circle key={index} cx={cx} cy={cy} r={radius} className={slice.color} />;
          }
          const startAngle = currentAngle;
          const sliceAngle = slice.percent * 360;
          const endAngle = currentAngle + sliceAngle;
          const pathD = getPathData(cx, cy, radius, startAngle, endAngle);
          currentAngle = endAngle;
          return <path key={index} d={pathD} className={slice.color} />;
        })}
      </svg>
      <div className="mt-3 flex flex-col space-y-1.5 text-sm w-full max-w-xs px-4">
        {pieSlices.map((slice, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-sm mr-2 ${slice.legendColor}`}></span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{slice.label}:</span>
            </div>
            <span className="text-gray-600 dark:text-gray-400 ml-1">{slice.value} ({ (slice.percent * 100).toFixed(0) }%)</span>
          </div>
        ))}
      </div>
       <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1">
        Baseado em {totalRelevantEvents} evento(s) que requer(em) presença.
      </p>
    </div>
  );
};

export default AttendanceSummaryChart;
