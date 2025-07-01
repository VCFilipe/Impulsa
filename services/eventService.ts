
import { Event, EventCategory, EventType } from '../types';
import { isFuture, isWithinInterval, compareAsc, addDays } from 'date-fns';
import eventServiceStartOfToday from 'date-fns/startOfToday'; // Aliased to avoid conflict if startOfToday is re-exported/used differently
import dfParseISO_eventService from 'date-fns/parseISO';


const LOCAL_STORAGE_KEY = 'corporateEvents';

const getInitialEvents = (): Event[] => [
  {
    id: '1',
    title: 'Reunião de Alinhamento Semanal',
    description: 'Discussão sobre o progresso dos projetos e próximos passos.',
    date: '2024-07-29',
    time: '10:00',
    category: EventCategory.REUNIAO,
    type: EventType.EVENTO,
    isEvaluable: true,
    requiresAttendance: true,
  },
  {
    id: '2',
    title: 'Workshop de Novas Ferramentas',
    description: 'Apresentação e treinamento das novas ferramentas de BI.',
    date: '2024-07-30',
    time: '14:00',
    category: EventCategory.WORKSHOP,
    type: EventType.EVENTO,
    isEvaluable: true,
    requiresAttendance: false,
  },
  {
    id: '3',
    title: 'Lembrete: Envio de Relatório Mensal',
    description: 'Não esquecer de enviar o relatório de performance até o fim do dia.',
    date: '2024-07-31',
    time: '17:00',
    category: EventCategory.OUTRO,
    type: EventType.LEMBRETE,
    isEvaluable: false,
    requiresAttendance: false,
  },
   {
    id: '4',
    title: 'Treinamento de Segurança',
    description: 'Treinamento obrigatório sobre novas políticas de segurança da informação.',
    date: '2024-08-05',
    time: '09:00',
    category: EventCategory.TREINAMENTO,
    type: EventType.EVENTO,
    isEvaluable: false,
    requiresAttendance: true,
  },
  {
    id: '5',
    title: 'Café da Manhã com a Diretoria',
    description: 'Sessão informal para discutir ideias e feedback com a diretoria.',
    date: '2024-08-15',
    time: '08:30',
    category: EventCategory.OUTRO,
    type: EventType.EVENTO,
    isEvaluable: true,
    requiresAttendance: false,
  },
  // Existing Events May 20-27 2024
  {
    id: '6',
    title: 'Brainstorming de Produto Alpha',
    description: 'Sessão de brainstorming para novas funcionalidades do Produto Alpha.',
    date: '2024-05-20',
    time: '10:00',
    category: EventCategory.REUNIAO,
    type: EventType.EVENTO,
    isEvaluable: false,
    requiresAttendance: true,
  },
  {
    id: '7',
    title: 'Workshop Design Thinking',
    description: 'Workshop prático sobre a metodologia de Design Thinking.',
    date: '2024-05-21',
    time: '14:00',
    category: EventCategory.WORKSHOP,
    type: EventType.EVENTO,
    isEvaluable: true,
    requiresAttendance: false,
  },
  {
    id: '8',
    title: 'Treinamento de Compliance LGPD',
    description: 'Treinamento sobre as diretrizes da Lei Geral de Proteção de Dados.',
    date: '2024-05-22',
    time: '09:30',
    category: EventCategory.TREINAMENTO,
    type: EventType.EVENTO,
    isEvaluable: true,
    requiresAttendance: true,
  },
  {
    id: '9',
    title: 'Happy Hour de Integração',
    description: 'Evento informal para integração das equipes.',
    date: '2024-05-23',
    time: '17:00',
    category: EventCategory.OUTRO,
    type: EventType.EVENTO,
    isEvaluable: false,
    requiresAttendance: false,
  },
  {
    id: '10',
    title: 'Reunião de Feedback Sprint 3',
    description: 'Reunião para coleta de feedback sobre a Sprint 3.',
    date: '2024-05-24',
    time: '11:00',
    category: EventCategory.REUNIAO,
    type: EventType.EVENTO,
    isEvaluable: true,
    requiresAttendance: true,
  },
  {
    id: '11',
    title: 'Apresentação de Resultados Q2',
    description: 'Apresentação dos resultados financeiros e operacionais do segundo trimestre.',
    date: '2024-05-27',
    time: '15:00',
    category: EventCategory.REUNIAO,
    type: EventType.EVENTO,
    isEvaluable: true,
    requiresAttendance: false,
  },
  // New Events May 20-27 2025
  {
    id: '2025-01',
    title: 'Planejamento Estratégico 2026 - Kick-off',
    description: 'Reunião inicial para o planejamento estratégico do próximo ano.',
    date: '2025-05-20',
    time: '09:00',
    category: EventCategory.REUNIAO,
    type: EventType.EVENTO,
    isEvaluable: true,
    requiresAttendance: true,
  },
  {
    id: '2025-02',
    title: 'Workshop de IA para Negócios',
    description: 'Explorando aplicações de Inteligência Artificial no contexto da empresa.',
    date: '2025-05-21',
    time: '13:30',
    category: EventCategory.WORKSHOP,
    type: EventType.EVENTO,
    isEvaluable: true,
    requiresAttendance: false,
  },
  {
    id: '2025-03',
    title: 'Treinamento de Liderança Ágil',
    description: 'Capacitação para líderes de equipe em metodologias ágeis.',
    date: '2025-05-22',
    time: '10:00',
    category: EventCategory.TREINAMENTO,
    type: EventType.EVENTO,
    isEvaluable: false,
    requiresAttendance: true,
  },
  {
    id: '2025-04',
    title: 'Lembrete: Atualização Cadastral Anual',
    description: 'Todos os colaboradores devem atualizar seus dados cadastrais no portal.',
    date: '2025-05-23',
    time: '08:00',
    category: EventCategory.OUTRO,
    type: EventType.LEMBRETE,
    isEvaluable: false,
    requiresAttendance: false,
  },
  {
    id: '2025-05',
    title: 'Demo Day - Projetos Internos Inovadores',
    description: 'Apresentação dos projetos de inovação desenvolvidos internamente.',
    date: '2025-05-26',
    time: '15:00',
    category: EventCategory.OUTRO, 
    type: EventType.EVENTO,
    isEvaluable: true,
    requiresAttendance: false,
  },
  {
    id: '2025-06',
    title: 'Confraternização Semestral',
    description: 'Evento de confraternização para celebrar as conquistas do semestre.',
    date: '2025-05-27',
    time: '17:30',
    category: EventCategory.OUTRO,
    type: EventType.EVENTO,
    isEvaluable: false,
    requiresAttendance: false,
  }
];


export const getEvents = (): Event[] => {
  const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedEvents) {
    try {
      const parsed = JSON.parse(storedEvents);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse events from localStorage", e);
    }
  }
  const initialEvents = getInitialEvents();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialEvents));
  return initialEvents;
};

export const addEvent = (eventData: Omit<Event, 'id'>): Event => {
  const events = getEvents();
  const newEvent: Event = {
    ...eventData,
    id: new Date().toISOString() + Math.random().toString(36).substring(2,9),
  };
  const updatedEvents = [...events, newEvent];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEvents));
  return newEvent;
};

export const updateEvent = (updatedEvent: Event): Event => {
  let events = getEvents();
  events = events.map(event => (event.id === updatedEvent.id ? updatedEvent : event));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  return updatedEvent;
};

export const deleteEvent = (eventId: string): void => {
  let events = getEvents();
  events = events.filter(event => event.id !== eventId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
};

export const getUpcomingEvents = (limit: number = 5, daysInFuture: number = 30): Event[] => {
  const allEvents = getEvents();
  const today = eventServiceStartOfToday();
  const futureLimitDate = addDays(today, daysInFuture);

  return allEvents
    .map(event => ({
      ...event,
      // Create a combined datetime for accurate sorting, handling potential date parsing issues
      dateTime: dfParseISO_eventService(`${event.date}T${event.time}`),
    }))
    .filter(event => {
      try {
        return isFuture(event.dateTime) && isWithinInterval(event.dateTime, { start: today, end: futureLimitDate });
      } catch {
        return false; // If date/time is invalid, exclude it
      }
    })
    .sort((a, b) => compareAsc(a.dateTime, b.dateTime))
    .slice(0, limit)
    .map(({ dateTime, ...event }) => event); // Remove temporary dateTime property
};


export { dfParseISO_eventService as parseISO };
