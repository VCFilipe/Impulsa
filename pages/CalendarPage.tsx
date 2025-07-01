
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Event, EventCategory, EventType, AttendanceType as LocalAttendanceType, TableColumn } from '../types'; // Renomeado para evitar conflito, Adicionado TableColumn
import { EVENT_TYPES, EVENT_CATEGORIES } from '../constants';
import * as eventService from '../services/eventService';
import * as attendanceService from '../services/attendanceService';
import * as evaluationService from '../services/evaluationService';

import EventForm from '../components/calendar/EventForm';
import ConfirmDeleteEventModal from '../components/calendar/ConfirmDeleteEventModal'; // Changed from ConfirmDeletePanel
import SidePanel from '../components/ui/SidePanel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Plus, Edit2, Trash2, CalendarDays as CalendarIcon, ListChecks as ListChecksIcon, MoreVertical, UserCheck, Star as StarIconLucide, CalendarDays, ArrowUpDown, ArrowUp, ArrowDown, CalendarX, LoaderCircle } from 'lucide-react'; // Renomeado ListFilter para evitar conflito & Adicionado CalendarDays, ícones de ordenação, CalendarX, LoaderCircle
import { formatDateToDisplay, parseISO, isSameDay as dateFnsIsSameDay, formatDateForStorage, isAfter, addDays, isBefore } from '../utils/dateUtils'; // Imported missing functions, isAfter, addDays
import CalendarView from '../components/calendar/CalendarView';
import Tabs, { Tab } from '../components/ui/Tabs'; 
import MarkAttendancePanel from '../components/calendar/MarkAttendancePanel';
import EvaluateEventPanel from '../components/calendar/EvaluateEventPanel';
import DropdownMenu, { DropdownMenuItem } from '../components/ui/DropdownMenu';
import FilterPanel from '../components/ui/FilterPanel'; 
import { useTableFeatures } from '../hooks/useTableFeatures'; 
import TablePagination from '../components/ui/TablePagination'; 
import EventCard from '../components/calendar/EventCard'; 
import { useToast } from '../contexts/ToastContext'; 

const SIDEPANEL_TRANSITION_DURATION = 300; 

interface EventListGridViewProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onMarkAttendance: (event: Event) => void;
  onEvaluate: (event: Event) => void;
  onAddEvent: () => void; 
  hasActiveFilters: boolean;
  isLoading: boolean; 
}

const EventListGridView: React.FC<EventListGridViewProps> = ({ 
    events, 
    onEdit, 
    onDelete, 
    onMarkAttendance, 
    onEvaluate, 
    onAddEvent,
    hasActiveFilters,
    isLoading,
}) => {

  const getActionItems = (event: Event): DropdownMenuItem[] => {
    const items: DropdownMenuItem[] = [];
    
    const currentDateTime = new Date();
    const eventStartDateTime = parseISO(`${event.date}T${event.time}`);

    const eventIsInTheFuture = isAfter(eventStartDateTime, currentDateTime);

    const canMarkAttendance =
      event.type === EventType.EVENTO &&
      event.requiresAttendance &&
      eventIsInTheFuture;

    const eventHasOccurredForEval = !isAfter(eventStartDateTime, currentDateTime); 
    const evaluationDeadline = addDays(eventStartDateTime, 7);
    const isWithinEvaluationTimeWindow = !isAfter(currentDateTime, evaluationDeadline);

    const canEvaluate =
      event.type === EventType.EVENTO &&
      event.isEvaluable &&
      eventHasOccurredForEval &&
      isWithinEvaluationTimeWindow;


    if (canMarkAttendance) {
      items.push({
        id: 'markAttendance',
        label: 'Marcar Presença',
        icon: <UserCheck size={16} />,
        onClick: () => onMarkAttendance(event),
      });
    }
    if (canEvaluate) {
      items.push({
        id: 'evaluate',
        label: 'Avaliar Evento',
        icon: <StarIconLucide size={16} />,
        onClick: () => onEvaluate(event),
      });
    }
    if (items.length > 0 && (canMarkAttendance || canEvaluate )) { 
        items.push({ id: 'separator', label: '---', onClick: () => {} });
    }

    items.push({
      id: 'edit',
      label: 'Editar Evento',
      icon: <Edit2 size={16} />,
      onClick: () => onEdit(event),
    });
    items.push({
      id: 'delete',
      label: 'Excluir Evento',
      icon: <Trash2 size={16} />,
      onClick: () => onDelete(event),
      isDanger: true,
    });
    return items;
  };

  const columns = useMemo<TableColumn<Event>[]>(() => [
    { 
      key: 'title', 
      header: 'Título', 
      enableSorting: true, 
      minWidth: 150,
      width: '25%',
      cell: (row) => <span className="truncate text-gray-700 dark:text-gray-300" title={row.title}>{row.title}</span>
    },
    { 
      key: 'description', 
      header: 'Descrição', 
      enableSorting: true, 
      minWidth: 200,
      width: '30%',
      cell: (row) => <span className="truncate text-gray-600 dark:text-gray-400" title={row.description}>{row.description}</span>
    },
    { 
      key: 'date', 
      header: 'Data / Hora', 
      enableSorting: true, 
      minWidth: 120,
      width: '15%',
      accessorFn: (row) => `${row.date} ${row.time}`, 
      cell: (row) => <span className="text-gray-600 dark:text-gray-400">{formatDateToDisplay(row.date)} às {row.time}</span>
    },
    { 
      key: 'category', 
      header: 'Categoria', 
      enableSorting: true, 
      minWidth: 100,
      width: '10%',
      cell: (row) => <span className="text-gray-600 dark:text-gray-400">{row.category}</span>
    },
    { 
      key: 'type', 
      header: 'Tipo', 
      enableSorting: true, 
      minWidth: 80,
      width: '10%',
      cell: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.type === EventType.EVENTO 
            ? 'bg-blue-100 text-blue-800 dark:bg-sky-500/20 dark:text-sky-300' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300'
          }`}>
          {row.type}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: 'Ações', 
      enableSorting: false, 
      minWidth: 80,
      width: '10%',
      cell: (row) => <div className="flex justify-end"><DropdownMenu items={getActionItems(row)} ariaLabel={`Ações para ${row.title}`} /></div>,
      className: "text-right overflow-visible" 
    },
  ], [onEdit, onDelete, onMarkAttendance, onEvaluate]);

  const {
    tableRef,
    paginatedData,
    sortConfig,
    handleSort,
    pagination,
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    totalItems,
    canPreviousPage,
    canNextPage,
  } = useTableFeatures<Event>({
    data: events,
    columns,
    localStorageKey: 'calendarPageEventList',
    initialSortConfig: { key: 'date', direction: 'descending'},
  });

  if (isLoading) {
     return (
        <div className="text-center py-12 bg-white dark:bg-gray-800 shadow rounded-lg">
          <ListChecksIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 animate-pulse mb-3" />
          <p className="text-xl text-gray-500 dark:text-gray-400">Carregando eventos...</p>
        </div>
    );
  }

  if (!isLoading && totalItems === 0) {
    return (
        <div className="text-center py-12 bg-white dark:bg-gray-800 shadow rounded-lg">
            <ListChecksIcon size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">Nenhum evento encontrado.</p>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
            <span>
                {hasActiveFilters ? 'Tente ajustar seus filtros ou ' : 'Você pode '}
            </span>
            <Button variant="link" onClick={onAddEvent} className="text-sm p-0">
                adicionar um novo evento
            </Button>
            <span>.</span>
            </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="table-container">
        <table ref={tableRef} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 enhanced-table">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((col) => (
                <th 
                  key={String(col.key)}
                  scope="col" 
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none ${col.className?.includes('overflow-visible') ? '' : 'overflow-hidden'} ${col.className || ''}`} 
                  style={col.width ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width } : {}}
                >
                  <div className="th-content-wrapper">
                    <span 
                      className={col.enableSorting ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" : ""}
                      onClick={col.enableSorting ? () => handleSort(String(col.key)) : undefined}
                    >
                      {col.header}
                    </span>
                    {col.enableSorting && (
                      <span className="ml-1">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : <ArrowUpDown size={14} className="text-gray-300 dark:text-gray-500"/>}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                {columns.map(col => {
                  const value = col.accessorFn ? col.accessorFn(event) : (event as any)[col.key];
                  return (
                    <td 
                      key={String(col.key)} 
                      className={`px-4 py-3 text-sm ${col.className?.includes('overflow-visible') ? '' : 'overflow-hidden'} ${col.className || 'text-gray-500 dark:text-gray-400'}`}
                      style={col.width ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width } : {}}
                    >
                      {col.cell ? col.cell(event, value) : (typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={pagination.currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={pagination.itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        totalItems={totalItems}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
      />
    </div>
  );
};


const CalendarPage: React.FC = () => {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('calendar'); 
  
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [defaultDateForForm, setDefaultDateForForm] = useState<string | undefined>(undefined);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const [isMarkAttendancePanelOpen, setIsMarkAttendancePanelOpen] = useState(false);
  const [eventToMarkAttendance, setEventToMarkAttendance] = useState<Event | null>(null);

  const [isEvaluatePanelOpen, setIsEvaluatePanelOpen] = useState(false);
  const [eventToEvaluate, setEventToEvaluate] = useState<Event | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(new Date()); 

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<EventCategory | ''>('');
  const [filterType, setFilterType] = useState<EventType | ''>('');
  
  const { addToast } = useToast();


  const loadEvents = useCallback(() => {
    setIsLoadingEvents(true);
    setTimeout(() => {
      const events = eventService.getEvents();
      setAllEvents(events);
      setIsLoadingEvents(false);
    }, 300); 
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleAddEvent = useCallback((defaultDate?: string) => {
    setEventToEdit(null);
    setDefaultDateForForm(defaultDate);
    requestAnimationFrame(() => {
      setIsFormPanelOpen(true);
    });
  }, []);

  const handleEditEvent = (event: Event) => {
    setDefaultDateForForm(undefined); 
    setEventToEdit(event);
    requestAnimationFrame(() => {
        setIsFormPanelOpen(true);
    });
  };
  
  const handleFormPanelClose = useCallback(() => {
    setIsFormPanelOpen(false);
    setDefaultDateForForm(undefined); 
     setTimeout(() => {
        setEventToEdit(null);
    }, SIDEPANEL_TRANSITION_DURATION);
  }, []);

  const handleFormSubmit = useCallback((eventData: Omit<Event, 'id'> | Event) => {
    const isEditing = 'id' in eventData;
    if (isEditing) { 
      eventService.updateEvent(eventData as Event);
      addToast({ type: 'success', title: 'Evento Atualizado!', message: `O evento "${eventData.title}" foi atualizado com sucesso.` });
    } else { 
      eventService.addEvent(eventData);
      addToast({ type: 'success', title: 'Evento Criado!', message: `O evento "${eventData.title}" foi criado com sucesso.` });
    }
    loadEvents();
    const newEventDate = parseISO(eventData.date);
    if(activeTab === 'calendar' && (selectedCalendarDate === null || !dateFnsIsSameDay(newEventDate, selectedCalendarDate))) {
        setSelectedCalendarDate(newEventDate);
        setCurrentMonth(newEventDate);
    }
    handleFormPanelClose();
  }, [loadEvents, activeTab, selectedCalendarDate, handleFormPanelClose, addToast]);

  const handleDeleteRequest = (event: Event) => {
    setEventToDelete(event);
    requestAnimationFrame(() => {
      setIsDeleteModalOpen(true); 
    });
  };

  const handleCloseDeleteModal = useCallback(() => { 
    setIsDeleteModalOpen(false); 
    setTimeout(() => {
      setEventToDelete(null);
    }, 300); 
  }, []);

  const confirmDelete = useCallback(() => {
    if (eventToDelete) {
      eventService.deleteEvent(eventToDelete.id);
      attendanceService.deleteAttendancesForEvent(eventToDelete.id);
      evaluationService.deleteEvaluationsForEvent(eventToDelete.id);
      addToast({ type: 'success', title: 'Evento Excluído!', message: `O evento "${eventToDelete.title}" foi excluído.` });
      loadEvents();
      handleCloseDeleteModal(); 
    }
  }, [eventToDelete, loadEvents, handleCloseDeleteModal, addToast]); 

  const handleOpenMarkAttendance = useCallback((event: Event) => {
    setEventToMarkAttendance(event);
    requestAnimationFrame(() => {
      setIsMarkAttendancePanelOpen(true);
    });
  }, []);

  const handleCloseMarkAttendancePanel = useCallback(() => {
    setIsMarkAttendancePanelOpen(false);
    setTimeout(() => {
      setEventToMarkAttendance(null);
    }, SIDEPANEL_TRANSITION_DURATION);
  }, []);

  const handleMarkAttendanceSubmit = useCallback((eventId: string, attendanceTypeValue: LocalAttendanceType) => {
    attendanceService.addAttendance({
      eventId,
      userId: 'mockUser', 
      type: attendanceTypeValue,
      timestamp: new Date().toISOString(),
    });
    const eventName = eventToMarkAttendance?.title || 'o evento';
    addToast({ type: 'success', title: 'Presença Marcada!', message: `Sua presença em "${eventName}" foi registrada como ${attendanceTypeValue}.` });
    handleCloseMarkAttendancePanel();
  }, [handleCloseMarkAttendancePanel, addToast, eventToMarkAttendance]);

  const handleOpenEvaluate = useCallback((event: Event) => {
    setEventToEvaluate(event);
    requestAnimationFrame(() => {
      setIsEvaluatePanelOpen(true);
    });
  }, []);

  const handleCloseEvaluatePanel = useCallback(() => {
    setIsEvaluatePanelOpen(false);
    setTimeout(() => {
      setEventToEvaluate(null);
    }, SIDEPANEL_TRANSITION_DURATION);
  }, []);

  const handleEvaluateSubmit = useCallback((evaluationData: { eventId: string, orgRating: number, contentRating: number, comment: string }) => {
    evaluationService.addEvaluation({
      ...evaluationData, 
      userId: 'mockUser', 
      timestamp: new Date().toISOString(),
    });
    const eventName = eventToEvaluate?.title || 'o evento';
    addToast({ type: 'success', title: 'Avaliação Enviada!', message: `Sua avaliação para "${eventName}" foi enviada.` });
    handleCloseEvaluatePanel();
  }, [handleCloseEvaluatePanel, addToast, eventToEvaluate]);


  const filteredEventsForList = useMemo(() => {
    return allEvents
      .filter(event => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          (event.title.toLowerCase().includes(searchTermLower) ||
           event.description.toLowerCase().includes(searchTermLower)) &&
          (filterCategory ? event.category === filterCategory : true) &&
          (filterType ? event.type === filterType : true)
        );
      });
  }, [allEvents, searchTerm, filterCategory, filterType]);

  const eventsForSelectedDate = useMemo(() => {
    return selectedCalendarDate
      ? allEvents.filter(event => dateFnsIsSameDay(parseISO(event.date), selectedCalendarDate)).sort((a,b) => a.time.localeCompare(b.time))
      : [];
  }, [allEvents, selectedCalendarDate]);

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || filterCategory !== '' || filterType !== '';
  }, [searchTerm, filterCategory, filterType]);

  const TABS: Tab[] = [
    { id: 'calendar', label: 'Calendário', icon: <CalendarIcon size={16}/> },
    { id: 'list', label: 'Listagem', icon: <ListChecksIcon size={16}/> },
  ];

  return (
    <div>
      <div className="mb-2"> 
        <div className="flex flex-col sm:flex-row justify-between items-center gap-x-2 gap-y-2"> 
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-50 flex items-center self-start sm:self-center">
            <CalendarDays size={30} className="mr-3 text-primary dark:text-sky-400" />
            Calendário Corporativo
            </h1>
            <Button onClick={() => handleAddEvent()} leftIcon={<Plus size={18}/>} className="w-full sm:w-auto">
            Novo Evento
            </Button>
        </div>
        <p className="mt-1 text-gray-600 dark:text-gray-300">Gerencie e visualize todos os eventos e lembretes corporativos.</p>
      </div>


      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} className="mt-2" /> 

      <div className="mt-2"> 
        {activeTab === 'calendar' && (
          <div className="flex flex-col lg:flex-row gap-2"> 
            <div className="lg:flex-grow-[3] lg:basis-0 lg:min-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow">
              <CalendarView
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                events={allEvents} 
                selectedDate={selectedCalendarDate}
                setSelectedDate={setSelectedCalendarDate}
                onEditEvent={handleEditEvent} 
                onDeleteEvent={(eventId) => {
                  const event = allEvents.find(e => e.id === eventId);
                  if (event) handleDeleteRequest(event);
                }}
                onMarkAttendance={handleOpenMarkAttendance}
                onEvaluate={handleOpenEvaluate}
              />
            </div>

            <div className="lg:flex-grow-[1] lg:basis-0 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden lg:min-h-0 lg:max-h-[calc(100vh-200px)]">
              {!selectedCalendarDate && !isLoadingEvents ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-4"> 
                  <CalendarDays size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Selecione um dia</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Para visualizar ou adicionar novos eventos.</p>
                </div>
              ) : selectedCalendarDate ? (
                <div className="flex-grow overflow-y-auto min-h-0 flex flex-col">
                  <h3 className="shrink-0 text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-0 sticky top-0 bg-white dark:bg-gray-800 pt-3 pb-2 px-4 z-10 border-b border-gray-200 dark:border-gray-700"> 
                    Eventos para {formatDateToDisplay(selectedCalendarDate)}:
                  </h3>
                  {isLoadingEvents && eventsForSelectedDate.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center p-4 text-center text-gray-500 dark:text-gray-400">
                       <LoaderCircle size={32} className="animate-spin text-primary dark:text-sky-500 mb-2"/>
                       Carregando eventos...
                    </div>
                  ) : !isLoadingEvents && eventsForSelectedDate.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-4"> 
                      <CalendarX size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                      <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Nenhum evento agendado.</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4"> 
                        Que tal adicionar um novo evento para este dia?
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => handleAddEvent(formatDateForStorage(selectedCalendarDate))}
                        leftIcon={<Plus size={18} />}
                      >
                        Adicionar Evento
                      </Button>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2"> 
                      {eventsForSelectedDate.map(event => (
                        <EventCard 
                          key={event.id} 
                          event={event} 
                          onEdit={handleEditEvent} 
                          onDelete={(eventId) => {
                            const eventToDeleteItem = allEvents.find(e => e.id === eventId);
                            if (eventToDeleteItem) handleDeleteRequest(eventToDeleteItem);
                          }}
                          onMarkAttendance={handleOpenMarkAttendance}
                          onEvaluate={handleOpenEvaluate}            
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null }
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div>
            <FilterPanel title="Filtros" className="mb-2" initialCollapsed={true}> 
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end"> 
                <Input
                  label="Buscar por Título/Descrição"
                  id="searchTerm"
                  placeholder="Digite para buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:col-span-2"
                />
                <Select
                  label="Categoria"
                  id="filterCategory"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as EventCategory | '')}
                  options={[{ value: '', label: 'Todas' }, ...EVENT_CATEGORIES.map(cat => ({ value: cat, label: cat }))]}
                />
                <Select
                  label="Tipo"
                  id="filterType"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as EventType | '')}
                  options={[{ value: '', label: 'Todos' }, ...EVENT_TYPES.map(type => ({ value: type, label: type }))]}
                />
              </div>
            </FilterPanel>
            <EventListGridView
              events={filteredEventsForList}
              onEdit={handleEditEvent}
              onDelete={handleDeleteRequest}
              onMarkAttendance={handleOpenMarkAttendance}
              onEvaluate={handleOpenEvaluate}
              onAddEvent={() => handleAddEvent()} 
              hasActiveFilters={hasActiveFilters}
              isLoading={isLoadingEvents}
            />
          </div>
        )}
      </div>
      
      <SidePanel
        isOpen={isFormPanelOpen}
        onClose={handleFormPanelClose}
        title={eventToEdit ? 'Editar Evento' : 'Criar Novo Evento'}
      >
        <EventForm
          eventToEdit={eventToEdit}
          defaultDate={defaultDateForForm}
          onSubmit={handleFormSubmit}
          onCancel={handleFormPanelClose}
        />
      </SidePanel>

      {eventToMarkAttendance && (
        <MarkAttendancePanel
            isOpen={isMarkAttendancePanelOpen}
            onClose={handleCloseMarkAttendancePanel}
            event={eventToMarkAttendance}
            onSubmit={handleMarkAttendanceSubmit}
        />
      )}

      {eventToEvaluate && (
        <EvaluateEventPanel
            isOpen={isEvaluatePanelOpen}
            onClose={handleCloseEvaluatePanel}
            event={eventToEvaluate}
            onSubmit={handleEvaluateSubmit}
        />
      )}

      {eventToDelete && (
        <ConfirmDeleteEventModal
          isOpen={isDeleteModalOpen} 
          onClose={handleCloseDeleteModal} 
          onConfirm={confirmDelete}
          eventName={eventToDelete.title}
        />
      )}
    </div>
  );
};

export default CalendarPage;
