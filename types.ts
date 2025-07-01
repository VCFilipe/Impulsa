

export enum EventCategory {
  REUNIAO = 'Reunião',
  WORKSHOP = 'Workshop',
  TREINAMENTO = 'Treinamento',
  OUTRO = 'Outro',
}

export enum EventType {
  EVENTO = 'Evento',
  LEMBRETE = 'Lembrete',
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD for storage and logic
  time: string; // HH:MM
  category: EventCategory;
  type: EventType;
  isEvaluable: boolean;
  requiresAttendance: boolean;
}

export enum AttendanceType {
  PRESENCIAL = 'Presencial',
  HOME_OFFICE = 'Home Office',
}

export interface Attendance {
  eventId: string;
  userId: string; // For simplicity, can be a mock ID
  type: AttendanceType;
  timestamp: string; // ISO string date
}

export interface Evaluation {
  eventId: string;
  userId: string; // For simplicity, can be a mock ID
  orgRating: number; // 1-5 (from star input)
  contentRating: number; // 1-5 (from star input)
  comment: string;
  timestamp: string; // ISO string date
}

// --- Policy Types ---
export enum PolicyCategory { // This will be reused for FAQs as well
  RH = 'Recursos Humanos',
  FINANCEIRO = 'Financeiro',
  TI = 'Tecnologia da Informação',
  COMPLIANCE = 'Compliance',
  GERAL = 'Geral',
}

export interface PolicyFile {
  id: string;
  name: string;
  type: string; // e.g., 'pdf', 'docx', 'txt', or MIME type
  url?: string; // Optional: for actual links in future, for now mainly name/type
  size?: number; // Optional: file size in bytes
}

export interface Policy {
  id: string;
  title: string;
  description: string;
  category: PolicyCategory;
  files: PolicyFile[];
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

// --- FAQ Types ---
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: PolicyCategory; // Reusing PolicyCategory for consistency
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

// --- Suggestion Types ---
export enum SuggestionVoteType {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote',
}

export interface SuggestionVote {
  suggestionId: string;
  userId: string; // Mock user ID
  type: SuggestionVoteType;
}

export interface Comment {
  id: string;
  suggestionId: string;
  authorId: string; // Mock user ID, or a unique ID for other mock authors
  authorName?: string; // Display name, e.g., "Colaborador X" or "Anônimo"
  text: string;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  isAnonymous: boolean;
  upvotes: number;    // Aggregate count
  downvotes: number;  // Aggregate count
  authorId?: string;  // Optional: if not anonymous, could store mock user ID
  createdAt: string;  // ISO string date
  updatedAt: string;  // ISO string date
  // comments will be fetched separately by suggestionId
}

// --- Table Feature Types ---
export interface TableColumn<T> {
  key: Extract<keyof T, string> | string; // string for custom/action columns
  header: React.ReactNode;
  accessorFn?: (row: T) => any;
  cell?: (row: T, value?: any) => React.ReactNode;
  enableSorting?: boolean;
  enableResizing?: boolean;
  minWidth?: number; // in pixels
  width?: string | number; // initial width (e.g., '150px', 150)
  className?: string; // Optional class for th/td
}

export interface SortConfig<T> {
  key: Extract<keyof T, string> | string;
  direction: 'ascending' | 'descending';
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

// Utility type for event with evaluation summary
export type EventWithEvaluationSummary = Event & {
  avgOrgRating: number;
  avgContentRating: number;
  evaluationCount: number;
};

// Utility type for event with attendance summary
export type EventWithAttendanceSummary = Event & {
  presencialCount: number;
  homeOfficeCount: number;
};

// --- AI Prompt Types ---
export interface AIPrompt {
  id: string;
  title: string;
  description: string;
  useCase: string; // e.g., "Resumo de Texto", "Geração de Código"
  promptText: string;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

// --- Chat Types ---
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string; // ISO string date
}

// --- Announcement Types ---
export enum AnnouncementCategory {
  AVISOS_GERAIS = 'Avisos Gerais',
  RH_COMUNICA = 'RH Comunica',
  EVENTOS_EMPRESARIAIS = 'Eventos EmpresariaIS',
  TECNOLOGIA_NOVOS = 'Tecnologia e Novos Sistemas',
  CONQUISTAS_EQUIPES = 'Conquistas de Equipes',
  PROJETOS_ATUALIZACOES = 'Projetos e Atualizações',
  OUTROS_COMUNICADOS = 'Outros Comunicados',
}

export interface Announcement {
  id: string;
  title: string;
  content: string; // Can be Markdown or HTML string
  category: AnnouncementCategory;
  authorId: string; // Mock user ID or 'system'
  authorName: string; // e.g., "Administração", "Departamento de RH"
  imageUrl?: string; // Optional URL for a banner image
  isPinned: boolean;
  isRead: boolean; // Novo campo
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}