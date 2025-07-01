

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarClock, ShieldCheck, Lightbulb, HelpCircle, ExternalLink, LayoutDashboard, Users, Star, Megaphone as MegaphoneIcon, Award, BellOff, CalendarOff, ListX } from 'lucide-react'; 
import { APP_NAME } from '../constants';
import * as eventService from '../services/eventService';
import * as policyService from '../services/policyService';
import * as suggestionService from '../services/suggestionService';
import * as faqService from '../services/faqService';
import * as announcementService from '../services/announcementService';
import { Event, Policy, Suggestion, FAQ, Announcement } from '../types';


import StatisticCard from '../components/dashboard/StatisticCard';
import DashboardSection from '../components/dashboard/DashboardSection';
import UpcomingEventItem from '../components/dashboard/UpcomingEventItem';
import RecentSuggestionItem from '../components/dashboard/RecentSuggestionItem';
import UnreadAnnouncementItem from '../components/dashboard/UnreadAnnouncementItem';
import AnnouncementDetailsModal from '../components/announcements/AnnouncementDetailsModal';
import SuggestionDetailsModal from '../components/suggestions/SuggestionDetailsModal'; // Importado
import AttendanceSummaryChart from '../components/dashboard/charts/AttendanceSummaryChart';
import EvaluationSummaryChart from '../components/dashboard/charts/EvaluationSummaryChart';
import TimeFilterButtons, { TimeFilterOption } from '../components/dashboard/charts/TimeFilterButtons';
import { useToast } from '../contexts/ToastContext';


interface DashboardData {
  upcomingEvents: Event[];
  totalEvents: number;
  totalPolicies: number;
  totalSuggestions: number;
  totalFAQs: number;
  topVotedSuggestions: Suggestion[];
  recentUnreadAnnouncements: Announcement[];
}

const chartTimeFilters: TimeFilterOption[] = [
  { id: '7d', label: '7 Dias' },
  { id: '30d', label: '30 Dias' },
  { id: 'total', label: 'Total' },
];

const DashboardHomePage: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    upcomingEvents: [],
    totalEvents: 0,
    totalPolicies: 0,
    totalSuggestions: 0,
    totalFAQs: 0,
    topVotedSuggestions: [],
    recentUnreadAnnouncements: [],
  });
  const [isLoading, setIsLoading] = useState(true); 
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  const [attendanceChartFilter, setAttendanceChartFilter] = useState<string>('total');
  const [evaluationChartFilter, setEvaluationChartFilter] = useState<string>('total');
  
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false); // State para modal de sugestão
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null); // State para sugestão selecionada

  const { addToast } = useToast();
  const currentUserIdForSuggestions = suggestionService.MOCK_USER_ID_SUGGESTIONS;


  const fetchData = useCallback(async (isInitialLoad = true) => {
    if (isInitialLoad) setIsLoading(true);
    try {
      if (isInitialLoad) await new Promise(resolve => setTimeout(resolve, 500));

      const eventsData = eventService.getEvents();
      setAllEvents(eventsData); 

      const upcomingEventsData = eventService.getUpcomingEvents(5, 30);
      const policiesData = policyService.getPolicies();
      const suggestionsData = suggestionService.getSuggestions(); // Buscando sugestões
      const topVotedSuggestionsData = suggestionService.getTopVotedSuggestions(3);
      const faqsData = faqService.getFAQs();
      const recentUnreadAnnouncementsData = announcementService.getRecentUnreadAnnouncements(3);
      
      setData({
        upcomingEvents: upcomingEventsData,
        totalEvents: eventsData.length,
        totalPolicies: policiesData.length,
        totalSuggestions: suggestionsData.length,
        totalFAQs: faqsData.length,
        topVotedSuggestions: topVotedSuggestionsData,
        recentUnreadAnnouncements: recentUnreadAnnouncementsData,
      });

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      if (isInitialLoad) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const handleAnnouncementsUpdate = () => {
        fetchData(false); // Recarrega dados sem o spinner global se for só update de anúncios
    };
    window.addEventListener('announcementsUpdated', handleAnnouncementsUpdate);
    return () => window.removeEventListener('announcementsUpdated', handleAnnouncementsUpdate);
  }, [fetchData]);


  const welcomeMessage = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const upcomingEventsTitle = useMemo(() => {
    let title = "Próximos eventos (30d)";
    if (!isLoading && data.upcomingEvents.length > 0) {
      title += ` (${data.upcomingEvents.length})`;
    }
    return title;
  }, [isLoading, data.upcomingEvents.length]);
  
  const handleOpenAnnouncementDetails = useCallback((announcement: Announcement, showToastOnRead: boolean = false) => {
    setSelectedAnnouncement(announcement);
    setIsAnnouncementModalOpen(true);
    if (!announcement.isRead) {
      announcementService.markAnnouncementAsRead(announcement.id);
      setData(prevData => ({
        ...prevData,
        recentUnreadAnnouncements: prevData.recentUnreadAnnouncements.filter(a => a.id !== announcement.id)
      }));
      window.dispatchEvent(new CustomEvent('announcementsUpdated'));
      if (showToastOnRead) {
        // No toast here when opening from dashboard, as it's implicitly read.
      }
    }
  }, []);

  const handleCloseAnnouncementDetails = useCallback(() => {
    setIsAnnouncementModalOpen(false);
    setTimeout(() => setSelectedAnnouncement(null), 300);
  }, []);

  const handleOpenSuggestionDetails = useCallback((suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setIsSuggestionModalOpen(true);
  }, []);

  const handleCloseSuggestionDetails = useCallback(() => {
    setIsSuggestionModalOpen(false);
    fetchData(false); 
    setTimeout(() => setSelectedSuggestion(null), 300);
  }, [fetchData]);


  return (
    <div className="space-y-2"> 
      <div className="mb-2"> 
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50 flex items-center">
           <LayoutDashboard size={32} className="mr-3 text-primary dark:text-sky-400" />
          {welcomeMessage}, bem-vindo(a) ao {APP_NAME}!
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          Confira um resumo das atividades e informações importantes do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"> 
        <StatisticCard
          icon={<CalendarClock className="text-blue-500 dark:text-sky-400" />}
          title="Eventos"
          value={isLoading ? undefined : data.totalEvents}
          description="cadastrados"
          isLoading={isLoading}
          viewAllLink="/calendar"
        />
        <StatisticCard
          icon={<ShieldCheck className="text-green-500 dark:text-green-400" />}
          title="Políticas"
          value={isLoading ? undefined : data.totalPolicies}
          description="ativas"
          isLoading={isLoading}
          viewAllLink="/policies"
        />
        <StatisticCard
          icon={<Lightbulb className="text-yellow-500 dark:text-yellow-400" />}
          title="Sugestões"
          value={isLoading ? undefined : data.totalSuggestions}
          description="cadastradas"
          isLoading={isLoading}
          viewAllLink="/suggestions"
        />
        <StatisticCard
          icon={<HelpCircle className="text-indigo-500 dark:text-indigo-400" />}
          title="FAQs"
          value={isLoading ? undefined : data.totalFAQs}
          description="cadastradas"
          isLoading={isLoading}
          viewAllLink="/faq"
        />
      </div>
      
      <DashboardSection 
        title="Seus Comunicados Não Lidos" 
        icon={<MegaphoneIcon size={20} className="text-primary dark:text-sky-400"/>}
        viewAllLink="/announcements" 
        isLoading={isLoading} 
        itemCount={data.recentUnreadAnnouncements.length}
        className="min-h-[200px]" // Ensure section has some height for centering
      >
        {isLoading && data.recentUnreadAnnouncements.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`unread-skeleton-${index}`} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow animate-pulse w-full">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : data.recentUnreadAnnouncements.length > 0 ? (
          data.recentUnreadAnnouncements.map(announcement => (
            <UnreadAnnouncementItem 
              key={announcement.id} 
              announcement={announcement} 
              onViewDetails={(ann) => handleOpenAnnouncementDetails(ann, false)}
            />
          ))
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <BellOff size={36} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <p className="text-sm">Você está em dia com os comunicados!</p>
          </div>
        )}
      </DashboardSection>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-2"> 
        <DashboardSection 
          title={upcomingEventsTitle} 
          icon={<CalendarClock size={20} className="text-primary dark:text-sky-400"/>}
          viewAllLink="/calendar" 
          isLoading={isLoading} 
          itemCount={data.upcomingEvents.length}
          className="min-h-[220px]" // Ensure section has some height for centering
        >
          {isLoading && data.upcomingEvents.length === 0 ? ( 
            <div className="flex-grow flex flex-col items-center justify-center space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse w-full">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : data.upcomingEvents.length > 0 ? (
            data.upcomingEvents.map(event => <UpcomingEventItem key={event.id} event={event} />)
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <CalendarOff size={36} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <p className="text-sm">Nenhum evento agendado para os próximos 30 dias.</p>
            </div>
          )}
        </DashboardSection>

        <DashboardSection 
          title="Sugestões mais votadas" 
          icon={<Award size={20} className="text-primary dark:text-sky-400"/>}
          viewAllLink="/suggestions" 
          isLoading={isLoading} 
          itemCount={data.topVotedSuggestions.length}
          className="min-h-[220px]" // Ensure section has some height for centering
        >
          {isLoading && data.topVotedSuggestions.length === 0 ? ( 
            <div className="flex-grow flex flex-col items-center justify-center space-y-3">
             {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse w-full">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/5 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : data.topVotedSuggestions.length > 0 ? (
            data.topVotedSuggestions.map(suggestion => 
              <RecentSuggestionItem 
                key={suggestion.id} 
                suggestion={suggestion} 
                onViewDetails={handleOpenSuggestionDetails} 
              />)
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <ListX size={36} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <p className="text-sm">Nenhuma sugestão encontrada.</p>
            </div>
          )}
        </DashboardSection>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2"> 
        <DashboardSection 
            title="Resumo de Presenças" 
            icon={<Users size={20} className="text-primary dark:text-sky-400"/>} 
            headerChildren={
                <TimeFilterButtons 
                    filters={chartTimeFilters} 
                    activeFilter={attendanceChartFilter} 
                    onFilterChange={setAttendanceChartFilter}
                />
            }
        >
          <AttendanceSummaryChart allEvents={allEvents} timeFilter={attendanceChartFilter} />
        </DashboardSection>

        <DashboardSection 
            title="Média de Avaliações de Eventos" 
            icon={<Star size={20} className="text-primary dark:text-sky-400"/>}
            headerChildren={
                <TimeFilterButtons 
                    filters={chartTimeFilters} 
                    activeFilter={evaluationChartFilter} 
                    onFilterChange={setEvaluationChartFilter}
                />
            }
        >
          <EvaluationSummaryChart allEvents={allEvents} timeFilter={evaluationChartFilter} />
        </DashboardSection>
      </div>

      {selectedAnnouncement && (
        <AnnouncementDetailsModal
          isOpen={isAnnouncementModalOpen}
          onClose={handleCloseAnnouncementDetails}
          announcement={selectedAnnouncement}
        />
      )}

      {selectedSuggestion && (
        <SuggestionDetailsModal
          isOpen={isSuggestionModalOpen}
          onClose={handleCloseSuggestionDetails}
          suggestion={selectedSuggestion}
          currentUserId={currentUserIdForSuggestions}
        />
      )}
    </div>
  );
};

export default DashboardHomePage;