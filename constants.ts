
import { EventCategory, EventType, PolicyCategory, AnnouncementCategory } from './types';
import * as aiPromptService from './services/aiPromptService'; // Importar o serviço

export const EVENT_CATEGORIES: EventCategory[] = [
  EventCategory.REUNIAO,
  EventCategory.WORKSHOP,
  EventCategory.TREINAMENTO,
  EventCategory.OUTRO,
];

export const EVENT_TYPES: EventType[] = [
  EventType.EVENTO,
  EventType.LEMBRETE,
];

export const POLICY_CATEGORIES: PolicyCategory[] = [
  PolicyCategory.RH,
  PolicyCategory.FINANCEIRO,
  PolicyCategory.TI,
  PolicyCategory.COMPLIANCE,
  PolicyCategory.GERAL,
];

// Dinamicamente obtém os casos de uso únicos dos prompts
const uniqueUseCases = Array.from(new Set(aiPromptService.getAIPrompts().map(p => p.useCase))).sort();
export const AI_PROMPT_USE_CASES: string[] = uniqueUseCases;

export const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = [
  AnnouncementCategory.AVISOS_GERAIS,
  AnnouncementCategory.RH_COMUNICA,
  AnnouncementCategory.EVENTOS_EMPRESARIAIS,
  AnnouncementCategory.TECNOLOGIA_NOVOS,
  AnnouncementCategory.CONQUISTAS_EQUIPES,
  AnnouncementCategory.PROJETOS_ATUALIZACOES,
  AnnouncementCategory.OUTROS_COMUNICADOS,
];

export const APP_NAME = "Portal Interno";

export const DEFAULT_ANNOUNCEMENT_IMAGE_URL = "https://images.unsplash.com/photo-1505238680356-667803448bb6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29tbXVuaWNhdGlvbnxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=600&q=60";
