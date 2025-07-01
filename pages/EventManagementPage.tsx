import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Event,
  EventCategory,
  EventType,
  Evaluation,
  AttendanceType,
  TableColumn,
  EventWithEvaluationSummary,
  EventWithAttendanceSummary,
} from "../types";
import * as eventService from "../services/eventService";
import * as evaluationService from "../services/evaluationService";
import * as attendanceService from "../services/attendanceService";
import { formatDateToDisplay, parseISO } from "../utils/dateUtils";
import Tabs, { Tab } from "../components/ui/Tabs";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import SidePanel from "../components/ui/SidePanel";
import {
  Eye,
  Users,
  Star as StarIcon,
  Calendar,
  MessageSquare,
  Brain,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Settings2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Sparkles,
} from "lucide-react"; // Added Sparkles
import { EVENT_CATEGORIES } from "../constants";
import { GoogleGenAI } from "@google/genai";
import DropdownMenu, { DropdownMenuItem } from "../components/ui/DropdownMenu";
import EvaluationSkeletonCard from "../components/ui/EvaluationSkeletonCard";
import FilterPanel from "../components/ui/FilterPanel";
import { useTableFeatures } from "../hooks/useTableFeatures";
import TablePagination from "../components/ui/TablePagination";
import { useToast } from "../contexts/ToastContext";
import { GEMINI_API_KEY } from "@/config/envs";

interface EvaluationsGridProps {
  events: EventWithEvaluationSummary[];
  onViewEvaluations: (event: Event) => void;
  isLoading: boolean;
}

const EvaluationsGrid: React.FC<EvaluationsGridProps> = ({
  events,
  onViewEvaluations,
  isLoading,
}) => {
  const columns = useMemo<TableColumn<EventWithEvaluationSummary>[]>(
    () => [
      {
        key: "title",
        header: "Título",
        enableSorting: true,
        minWidth: 150,
        width: "30%",
        cell: (row) => (
          <span className="truncate" title={row.title}>
            {row.title}
          </span>
        ),
      },
      {
        key: "date",
        header: "Data / Hora",
        enableSorting: true,
        minWidth: 120,
        width: "15%",
        accessorFn: (row) => `${row.date} ${row.time}`,
        cell: (row) => `${formatDateToDisplay(row.date)} às ${row.time}`,
      },
      {
        key: "category",
        header: "Categoria",
        enableSorting: true,
        minWidth: 100,
        width: "15%",
      },
      {
        key: "avgOrgRating",
        header: "Média Org.",
        enableSorting: true,
        minWidth: 100,
        width: "10%",
        cell: (row) =>
          row.evaluationCount > 0 ? row.avgOrgRating.toFixed(1) : "-",
      },
      {
        key: "avgContentRating",
        header: "Média Cont.",
        enableSorting: true,
        minWidth: 100,
        width: "10%",
        cell: (row) =>
          row.evaluationCount > 0 ? row.avgContentRating.toFixed(1) : "-",
      },
      {
        key: "evaluationCount",
        header: "Qtd. Aval.",
        enableSorting: true,
        minWidth: 80,
        width: "10%",
      },
      {
        key: "actions",
        header: "Ações",
        enableSorting: false,
        minWidth: 80,
        width: "10%",
        cell: (row) => (
          <div className="flex justify-end">
            <DropdownMenu
              items={[
                {
                  id: "view",
                  label: "Visualizar Avaliações",
                  icon: <Eye size={16} />,
                  onClick: () => onViewEvaluations(row),
                },
              ]}
              ariaLabel={`Ações para ${row.title}`}
            />
          </div>
        ),
        className: "text-right overflow-visible",
      },
    ],
    [onViewEvaluations]
  );

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
  } = useTableFeatures<EventWithEvaluationSummary>({
    data: events,
    columns,
    localStorageKey: "eventMgmtEvaluationsGrid",
    initialSortConfig: { key: "date", direction: "descending" },
  });

  if (isLoading) {
    return (
      <p className="text-gray-600 dark:text-gray-400 text-center py-10">
        Carregando dados de avaliações...
      </p>
    );
  }
  if (!isLoading && totalItems === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-400 text-center py-10">
        Nenhum evento avaliável encontrado para os filtros aplicados.
      </p>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="table-container">
        <table
          ref={tableRef}
          className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 enhanced-table"
        >
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none ${
                    col.className?.includes("overflow-visible")
                      ? ""
                      : "overflow-hidden"
                  } ${col.className || ""}`}
                  style={
                    col.width
                      ? {
                          width:
                            typeof col.width === "number"
                              ? `${col.width}px`
                              : col.width,
                        }
                      : {}
                  }
                >
                  <div className="th-content-wrapper">
                    <span
                      className={
                        col.enableSorting
                          ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                          : ""
                      }
                      onClick={
                        col.enableSorting
                          ? () => handleSort(String(col.key))
                          : undefined
                      }
                    >
                      {col.header}
                    </span>
                    {col.enableSorting && (
                      <span className="ml-1">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "ascending" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          )
                        ) : (
                          <ArrowUpDown
                            size={14}
                            className="text-gray-300 dark:text-gray-500"
                          />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((event) => (
              <tr key={event.id}>
                {columns.map((col) => {
                  const value = col.accessorFn
                    ? col.accessorFn(event)
                    : (event as any)[col.key];
                  return (
                    <td
                      key={String(col.key)}
                      className={`px-4 py-3 text-sm ${
                        col.className?.includes("overflow-visible")
                          ? ""
                          : "overflow-hidden"
                      } ${col.className || "text-gray-500 dark:text-gray-400"}`}
                      style={
                        col.width
                          ? {
                              width:
                                typeof col.width === "number"
                                  ? `${col.width}px`
                                  : col.width,
                            }
                          : {}
                      }
                    >
                      {col.cell
                        ? col.cell(event, value)
                        : typeof value === "boolean"
                        ? value
                          ? "Sim"
                          : "Não"
                        : value}
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

const StarRatingDisplay: React.FC<{
  rating: number;
  maxRating?: number;
  totalStars?: number;
  starSize?: number;
}> = ({ rating, maxRating = 5, totalStars = 5, starSize = 18 }) => {
  const filledStars = Math.round((rating / maxRating) * totalStars);
  return (
    <div className="flex items-center">
      {Array(totalStars)
        .fill(0)
        .map((_, i) => (
          <StarIcon
            key={i}
            size={starSize}
            className={
              i < filledStars
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 dark:text-gray-500"
            }
          />
        ))}
    </div>
  );
};

interface ViewEvaluationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  evaluations: Evaluation[];
}

const ITEMS_PER_PAGE_PANEL = 10;
const PAGINATION_LOADING_DELAY = 300;

const ViewEvaluationsPanel: React.FC<ViewEvaluationsPanelProps> = ({
  isOpen,
  onClose,
  event,
  evaluations,
}) => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState<boolean>(false);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const panelContentWrapperRef = useRef<HTMLDivElement>(null);
  const evaluationsListRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const generateAiSummary = useCallback(
    async (currentEventEvaluations: Evaluation[], eventTitle: string) => {
      if (!GEMINI_API_KEY) {
        const errorMsg = "Chave de API não configurada para resumo da IA.";
        setAiSummaryError(errorMsg);
        setIsAiSummaryLoading(false);
        addToast({
          type: "error",
          title: "Erro de Configuração",
          message: errorMsg,
        });
        return;
      }
      if (currentEventEvaluations.length === 0) {
        setAiSummary(null);
        setAiSummaryError("Não há feedbacks para analisar.");
        setIsAiSummaryLoading(false);
        return;
      }

      setIsAiSummaryLoading(true);
      setAiSummary(null);
      setAiSummaryError(null);

      try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const formattedFeedbacks = currentEventEvaluations
          .map(
            (ev) =>
              `Organização: ${ev.orgRating}/5, Conteúdo: ${
                ev.contentRating
              }/5. Comentário: "${
                ev.comment ? ev.comment.trim() : "Nenhum comentário fornecido."
              }"`
          )
          .join("\n");

        const prompt = `
Para o evento "${eventTitle}", analise os seguintes feedbacks. Cada feedback inclui uma nota de organização (1-5), uma nota de conteúdo (1-5) e um comentário.

Por favor, gere:
1. Um resumo conciso dos principais temas e pontos mencionados nos comentários.
2. Uma avaliação do sentimento geral dos participantes (ex: Positivo, Negativamente Crítico, Misto com sugestões, Neutro).

Se não houver comentários textuais significativos ou os comentários forem muito vagos (ex: "bom", "ok"), indique isso e baseie a análise principalmente nas notas, se possível.

Feedbacks:
${formattedFeedbacks}

Retorne sua análise em texto simples, com o resumo primeiro e depois a avaliação do sentimento. Mantenha o resultado conciso (2-4 frases no total).
      `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-04-17",
          contents: prompt,
        });

        setAiSummary(response.text);
        addToast({
          type: "success",
          title: "Resumo Gerado!",
          message: `Análise da IA para "${eventTitle}" concluída.`,
        });
      } catch (error) {
        console.error("Error generating AI summary:", error);
        const errorMsg =
          "Não foi possível gerar o resumo da IA. Tente novamente mais tarde.";
        setAiSummaryError(errorMsg);
        setAiSummary(null);
        addToast({ type: "error", title: "Erro na IA", message: errorMsg });
      } finally {
        setIsAiSummaryLoading(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    if (isOpen && event) {
      setCurrentPage(1);
      setIsLoadingPage(true);
      panelContentWrapperRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });

      setAiSummary(null);
      setIsAiSummaryLoading(false);
      setAiSummaryError(null);

      setTimeout(() => {
        setIsLoadingPage(false);
      }, PAGINATION_LOADING_DELAY);
    } else if (!isOpen) {
      setAiSummary(null);
      setIsAiSummaryLoading(false);
      setAiSummaryError(null);
      setCurrentPage(1);
      setIsLoadingPage(false);
    }
  }, [isOpen, event, evaluations]);

  if (!event) return null;

  const evaluationSummaryData = evaluationService.getEvaluationSummaryForEvent(
    event.id
  );

  const totalPages = Math.ceil(evaluations.length / ITEMS_PER_PAGE_PANEL);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_PANEL;
  const endIndex = startIndex + ITEMS_PER_PAGE_PANEL;
  const paginatedEvaluations = evaluations.slice(startIndex, endIndex);

  const handleTriggerAiSummary = () => {
    if (event) {
      generateAiSummary(evaluations, event.title);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <= totalPages &&
      newPage !== currentPage &&
      !isLoadingPage
    ) {
      setIsLoadingPage(true);
      evaluationsListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setTimeout(() => {
        setCurrentPage(newPage);
        setIsLoadingPage(false);
      }, PAGINATION_LOADING_DELAY);
    }
  };

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoadingPage}
          leftIcon={<ChevronLeft size={16} />}
        >
          Anterior
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoadingPage}
          rightIcon={<ChevronRight size={16} />}
        >
          Próxima
        </Button>
      </div>
    );
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={`Avaliações: ${event.title}`}
    >
      <div ref={panelContentWrapperRef} className="space-y-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 space-y-4">
          <h4 className="text-md font-semibold text-primary dark:text-sky-400 mb-3">
            Resumo Geral do Evento
          </h4>
          {evaluations.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-3">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Média Organização:
                  </p>
                  <div className="flex items-center space-x-2">
                    <StarRatingDisplay
                      rating={evaluationSummaryData.avgOrgRating}
                      starSize={20}
                    />
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-100">
                      {evaluationSummaryData.avgOrgRating.toFixed(1)}{" "}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        / 5
                      </span>
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Média Conteúdo:
                  </p>
                  <div className="flex items-center space-x-2">
                    <StarRatingDisplay
                      rating={evaluationSummaryData.avgContentRating}
                      starSize={20}
                    />
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-100">
                      {evaluationSummaryData.avgContentRating.toFixed(1)}{" "}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        / 5
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <h5 className="text-sm font-semibold text-primary dark:text-sky-400 flex items-center">
                    <Sparkles size={16} className="mr-1.5" /> Análise por IA dos
                    Feedbacks
                  </h5>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTriggerAiSummary}
                    disabled={isAiSummaryLoading || evaluations.length === 0}
                    loading={isAiSummaryLoading}
                    className="text-xs border-sky-500 text-sky-600 hover:bg-sky-100 dark:border-sky-600 dark:text-sky-400 dark:hover:bg-sky-700/50"
                  >
                    {isAiSummaryLoading ? "Analisando..." : "Gerar Análise"}
                  </Button>
                </div>

                {isAiSummaryLoading && (
                  <div className="flex items-center justify-center p-3">
                    <Loader2
                      size={20}
                      className="animate-spin text-sky-500 dark:text-sky-400 mr-2"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                      Gerando análise da IA...
                    </p>
                  </div>
                )}
                {aiSummaryError && !isAiSummaryLoading && (
                  <p className="text-sm text-red-600 bg-red-50 dark:bg-red-700/20 p-2 rounded-md border border-red-200 dark:border-red-600">
                    {aiSummaryError}
                  </p>
                )}
                {aiSummary && !isAiSummaryLoading && (
                  <p className="text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 p-3 rounded-md border border-slate-200 dark:border-slate-500 leading-relaxed whitespace-pre-wrap shadow-sm">
                    {aiSummary}
                  </p>
                )}
                {!aiSummary &&
                  !isAiSummaryLoading &&
                  !aiSummaryError &&
                  evaluations.length > 0 &&
                  !GEMINI_API_KEY && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                      A análise da IA está desabilitada (sem chave de API).
                    </p>
                  )}
                {!aiSummary &&
                  !isAiSummaryLoading &&
                  !aiSummaryError &&
                  evaluations.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">
                      Não há feedbacks para analisar.
                    </p>
                  )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-2">
              Médias e análise de IA aparecerão aqui quando houver avaliações
              registradas.
            </p>
          )}
        </div>

        {evaluations.length > 0 && (
          <hr className="my-4 border-slate-200 dark:border-gray-600" />
        )}

        <div ref={evaluationsListRef} className="space-y-4">
          {isLoadingPage &&
            Array.from({
              length: Math.min(
                ITEMS_PER_PAGE_PANEL,
                evaluations.length || ITEMS_PER_PAGE_PANEL
              ),
            }).map((_, index) => (
              <EvaluationSkeletonCard key={`skeleton-${index}`} />
            ))}
          {!isLoadingPage &&
            paginatedEvaluations.length === 0 &&
            evaluations.length > 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-md text-center py-6">
                Nenhuma avaliação nesta página.
              </p>
            )}
          {!isLoadingPage && evaluations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <StarIcon
                size={40}
                className="text-gray-300 dark:text-gray-600 mb-3"
              />
              <p className="text-gray-500 dark:text-gray-400 text-md">
                Nenhuma avaliação para este evento ainda.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Os feedbacks aparecerão aqui assim que forem submetidos.
              </p>
            </div>
          )}
          {!isLoadingPage &&
            paginatedEvaluations.map((ev) => (
              <div
                key={`${ev.userId}-${ev.timestamp}`}
                className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {ev.userId}
                    </span>
                  </p>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <Calendar size={12} className="mr-1" />
                    {formatDateToDisplay(ev.timestamp)}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                      Organização:
                    </p>
                    <StarRatingDisplay rating={ev.orgRating} starSize={16} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                      Conteúdo:
                    </p>
                    <StarRatingDisplay
                      rating={ev.contentRating}
                      starSize={16}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <MessageSquare
                      size={14}
                      className="mr-1.5 text-primary dark:text-sky-400"
                    />
                    Comentário:
                  </p>
                  {ev.comment && ev.comment.trim() !== "" ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md border border-slate-200 dark:border-slate-600 leading-relaxed whitespace-pre-wrap">
                      {ev.comment}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md border border-slate-200 dark:border-slate-600">
                      Nenhum comentário fornecido.
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
        {renderPaginationControls()}
      </div>
    </SidePanel>
  );
};

interface PresenceGridProps {
  events: EventWithAttendanceSummary[];
  isLoading: boolean;
}
const PresenceGrid: React.FC<PresenceGridProps> = ({ events, isLoading }) => {
  const columns = useMemo<TableColumn<EventWithAttendanceSummary>[]>(
    () => [
      {
        key: "title",
        header: "Título",
        enableSorting: true,
        minWidth: 150,
        width: "40%",
        cell: (row) => (
          <span className="truncate" title={row.title}>
            {row.title}
          </span>
        ),
      },
      {
        key: "date",
        header: "Data / Hora",
        enableSorting: true,
        minWidth: 120,
        width: "20%",
        accessorFn: (row) => `${row.date} ${row.time}`,
        cell: (row) => `${formatDateToDisplay(row.date)} às ${row.time}`,
      },
      {
        key: "category",
        header: "Categoria",
        enableSorting: true,
        minWidth: 100,
        width: "20%",
      },
      {
        key: "presencialCount",
        header: "Presencial",
        enableSorting: true,
        minWidth: 80,
        width: "10%",
      },
      {
        key: "homeOfficeCount",
        header: "Home Office",
        enableSorting: true,
        minWidth: 100,
        width: "10%",
      },
    ],
    []
  );

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
  } = useTableFeatures<EventWithAttendanceSummary>({
    data: events,
    columns,
    localStorageKey: "eventMgmtPresenceGrid",
    initialSortConfig: { key: "date", direction: "descending" },
  });

  if (isLoading) {
    return (
      <p className="text-gray-600 dark:text-gray-400 text-center py-10">
        Carregando dados de presença...
      </p>
    );
  }
  if (!isLoading && totalItems === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-400 text-center py-10">
        Nenhum evento que exige presença encontrado para os filtros aplicados.
      </p>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="table-container">
        <table
          ref={tableRef}
          className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 enhanced-table"
        >
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none ${
                    col.className?.includes("overflow-visible")
                      ? ""
                      : "overflow-hidden"
                  } ${col.className || ""}`}
                  style={
                    col.width
                      ? {
                          width:
                            typeof col.width === "number"
                              ? `${col.width}px`
                              : col.width,
                        }
                      : {}
                  }
                >
                  <div className="th-content-wrapper">
                    <span
                      className={
                        col.enableSorting
                          ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                          : ""
                      }
                      onClick={
                        col.enableSorting
                          ? () => handleSort(String(col.key))
                          : undefined
                      }
                    >
                      {col.header}
                    </span>
                    {col.enableSorting && (
                      <span className="ml-1">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "ascending" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          )
                        ) : (
                          <ArrowUpDown
                            size={14}
                            className="text-gray-300 dark:text-gray-500"
                          />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((event) => (
              <tr key={event.id}>
                {columns.map((col) => {
                  const value = col.accessorFn
                    ? col.accessorFn(event)
                    : (event as any)[col.key];
                  return (
                    <td
                      key={String(col.key)}
                      className={`px-4 py-3 text-sm ${
                        col.className?.includes("overflow-visible")
                          ? ""
                          : "overflow-hidden"
                      } ${col.className || "text-gray-500 dark:text-gray-400"}`}
                      style={
                        col.width
                          ? {
                              width:
                                typeof col.width === "number"
                                  ? `${col.width}px`
                                  : col.width,
                            }
                          : {}
                      }
                    >
                      {col.cell
                        ? col.cell(event, value)
                        : typeof value === "boolean"
                        ? value
                          ? "Sim"
                          : "Não"
                        : value}
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

const EventManagementPage: React.FC = () => {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("evaluations");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<EventCategory | "">("");

  const [isViewEvaluationsPanelOpen, setIsViewEvaluationsPanelOpen] =
    useState(false);
  const [selectedEventForEvaluations, setSelectedEventForEvaluations] =
    useState<Event | null>(null);
  const [allEvaluationsForSelectedEvent, setAllEvaluationsForSelectedEvent] =
    useState<Evaluation[]>([]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setAllEvents(eventService.getEvents());
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const evaluableEventsWithSummary = useMemo(() => {
    return allEvents
      .filter(
        (event) =>
          event.type === EventType.EVENTO &&
          event.isEvaluable &&
          (searchTerm
            ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.description.toLowerCase().includes(searchTerm.toLowerCase())
            : true) &&
          (filterCategory ? event.category === filterCategory : true)
      )
      .map((event) => {
        const summary = evaluationService.getEvaluationSummaryForEvent(
          event.id
        );
        return { ...event, ...summary, evaluationCount: summary.count };
      });
  }, [allEvents, searchTerm, filterCategory]);

  const presenceRequiredEventsWithSummary = useMemo(() => {
    return allEvents
      .filter(
        (event) =>
          event.type === EventType.EVENTO &&
          event.requiresAttendance &&
          (searchTerm
            ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.description.toLowerCase().includes(searchTerm.toLowerCase())
            : true) &&
          (filterCategory ? event.category === filterCategory : true)
      )
      .map((event) => {
        const summary = attendanceService.getAttendanceSummaryForEvent(
          event.id
        );
        return { ...event, ...summary };
      });
  }, [allEvents, searchTerm, filterCategory]);

  const handleViewEvaluations = (event: Event) => {
    setSelectedEventForEvaluations(event);
    const fetchedEvaluations = evaluationService.getEvaluationsForEvent(
      event.id
    );
    setAllEvaluationsForSelectedEvent(fetchedEvaluations);

    requestAnimationFrame(() => {
      setIsViewEvaluationsPanelOpen(true);
    });
  };

  const TABS: Tab[] = [
    { id: "evaluations", label: "Avaliações", icon: <StarIcon size={16} /> },
    { id: "presence", label: "Presenças", icon: <Users size={16} /> },
  ];

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-50 flex items-center">
          <Settings2
            size={30}
            className="mr-3 text-primary dark:text-sky-400"
          />
          Gestão de Eventos
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          Analise o desempenho e o engajamento dos seus eventos.
        </p>
      </div>

      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mt-2"
      />

      <div className="mt-2">
        <FilterPanel title="Filtros" className="mb-2" initialCollapsed={true}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
            <Input
              label="Buscar por Título/Descrição"
              id="eventMgmtSearchTerm"
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select
              label="Categoria"
              id="eventMgmtFilterCategory"
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value as EventCategory | "")
              }
              options={[
                { value: "", label: "Todas" },
                ...EVENT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
              ]}
            />
          </div>
        </FilterPanel>

        {activeTab === "evaluations" && (
          <EvaluationsGrid
            events={evaluableEventsWithSummary}
            onViewEvaluations={handleViewEvaluations}
            isLoading={isLoading}
          />
        )}
        {activeTab === "presence" && (
          <PresenceGrid
            events={presenceRequiredEventsWithSummary}
            isLoading={isLoading}
          />
        )}
      </div>

      {selectedEventForEvaluations && (
        <ViewEvaluationsPanel
          isOpen={isViewEvaluationsPanelOpen}
          onClose={() => {
            setIsViewEvaluationsPanelOpen(false);
            setTimeout(() => {
              setSelectedEventForEvaluations(null);
              setAllEvaluationsForSelectedEvent([]);
            }, 300);
          }}
          event={selectedEventForEvaluations}
          evaluations={allEvaluationsForSelectedEvent}
        />
      )}
    </div>
  );
};

export default EventManagementPage;
