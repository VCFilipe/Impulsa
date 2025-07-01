import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { FAQ, PolicyCategory } from "../types"; // PolicyCategory is reused
import { POLICY_CATEGORIES } from "../constants"; // Reused for categories
import * as faqService from "../services/faqService";
import { GoogleGenAI } from "@google/genai";

import SidePanel from "../components/ui/SidePanel";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/Accordion";
import DropdownMenu, { DropdownMenuItem } from "../components/ui/DropdownMenu";
import {
  Plus,
  HelpCircle,
  Edit2,
  Trash2,
  Tag,
  Loader2,
  Search,
  X as IconX,
  Sparkles,
} from "lucide-react";
import FilterPanel from "../components/ui/FilterPanel";
import FAQForm from "../components/faq/FAQForm";
import ConfirmDeleteFAQModal from "../components/faq/ConfirmDeleteFAQModal";
import { formatDateToDisplay } from "../utils/dateUtils";
import { useToast } from "../contexts/ToastContext";
import { GEMINI_API_KEY } from "@/config/envs";

const SIDEPANEL_TRANSITION_DURATION = 300;
const INITIAL_FAQS_LOAD_COUNT = 10;
const FAQS_TO_LOAD_ON_SCROLL = 5;

const FAQPage: React.FC = () => {
  const [allFAQs, setAllFAQs] = useState<FAQ[]>([]);

  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);
  const [faqToEdit, setFaqToEdit] = useState<FAQ | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<PolicyCategory | "">("");

  const [openAccordionIds, setOpenAccordionIds] = useState<string[]>([]);

  const [displayedFAQsCount, setDisplayedFAQsCount] = useState(
    INITIAL_FAQS_LOAD_COUNT
  );
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { addToast } = useToast();

  const [aiQuery, setAiQuery] = useState("");
  const [aiFoundFAQ, setAiFoundFAQ] = useState<FAQ | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadFAQs = useCallback(() => {
    const faqs = faqService.getFAQs();
    setAllFAQs(faqs);
  }, []);

  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  const handleAddFAQ = () => {
    setFaqToEdit(null);
    requestAnimationFrame(() => {
      setIsFormPanelOpen(true);
    });
  };

  const handleEditFAQ = (faq: FAQ) => {
    setFaqToEdit(faq);
    requestAnimationFrame(() => {
      setIsFormPanelOpen(true);
    });
  };

  const handleFormPanelClose = useCallback(() => {
    setIsFormPanelOpen(false);
    setTimeout(() => {
      setFaqToEdit(null);
    }, SIDEPANEL_TRANSITION_DURATION);
  }, []);

  const handleFormSubmit = useCallback(
    (faqData: Omit<FAQ, "id" | "createdAt" | "updatedAt"> | FAQ) => {
      let newFaqId = "";
      const isEditing = "id" in faqData;

      if (isEditing) {
        faqService.updateFAQ(faqData as FAQ);
        addToast({
          type: "success",
          title: "FAQ Atualizada!",
          message: `A pergunta "${faqData.question}" foi atualizada.`,
        });
      } else {
        const newFaq = faqService.addFAQ(faqData);
        newFaqId = newFaq.id;
        addToast({
          type: "success",
          title: "FAQ Criada!",
          message: `A pergunta "${faqData.question}" foi criada.`,
        });
      }
      loadFAQs();

      if (newFaqId) {
        const newFAQsList = faqService.getFAQs();
        const newIndex = newFAQsList.findIndex((f) => f.id === newFaqId);
        setDisplayedFAQsCount((prevCount) => Math.max(prevCount, newIndex + 1));
        setOpenAccordionIds((prev) => [
          newFaqId,
          ...prev.filter((id) => id !== newFaqId),
        ]);
        setTimeout(() => {
          const element = document.getElementById(
            `accordion-trigger-${newFaqId}`
          );
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
      handleFormPanelClose();
    },
    [loadFAQs, handleFormPanelClose, addToast]
  );

  const handleDeleteRequest = (faq: FAQ) => {
    setFaqToDelete(faq);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setFaqToDelete(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (faqToDelete) {
      faqService.deleteFAQ(faqToDelete.id);
      addToast({
        type: "success",
        title: "FAQ Excluída!",
        message: `A pergunta "${faqToDelete.question}" foi excluída.`,
      });
      loadFAQs();
      setAiFoundFAQ((prev) => (prev?.id === faqToDelete.id ? null : prev));
      handleCloseDeleteModal();
    }
  }, [faqToDelete, loadFAQs, handleCloseDeleteModal, addToast]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Recursos Humanos":
        return "bg-blue-100 text-blue-700 dark:bg-sky-700 dark:text-sky-200";
      case "Financeiro":
        return "bg-green-100 text-green-700 dark:bg-emerald-700 dark:text-emerald-200";
      case "Tecnologia da Informação":
        return "bg-purple-100 text-purple-700 dark:bg-violet-700 dark:text-violet-200";
      case "Compliance":
        return "bg-yellow-100 text-yellow-700 dark:bg-amber-700 dark:text-amber-200";
      case "Geral":
        return "bg-gray-100 text-gray-700 dark:bg-slate-600 dark:text-slate-200";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  const filteredFAQs = useMemo(() => {
    return allFAQs.filter((faq) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (faq.question.toLowerCase().includes(searchTermLower) ||
          faq.answer.toLowerCase().includes(searchTermLower)) &&
        (filterCategory ? faq.category === filterCategory : true)
      );
    });
  }, [allFAQs, searchTerm, filterCategory]);

  useEffect(() => {
    setDisplayedFAQsCount(INITIAL_FAQS_LOAD_COUNT);
  }, [searchTerm, filterCategory, allFAQs]);

  const currentlyDisplayedFAQs = useMemo(() => {
    return filteredFAQs.slice(0, displayedFAQsCount);
  }, [filteredFAQs, displayedFAQsCount]);

  const hasMoreFAQs = useMemo(() => {
    return displayedFAQsCount < filteredFAQs.length;
  }, [displayedFAQsCount, filteredFAQs.length]);

  const loadMoreFAQs = useCallback(() => {
    if (isLoadingMore || !hasMoreFAQs) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedFAQsCount((prev) =>
        Math.min(prev + FAQS_TO_LOAD_ON_SCROLL, filteredFAQs.length)
      );
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMoreFAQs, filteredFAQs.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreFAQs && !isLoadingMore) {
          loadMoreFAQs();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [hasMoreFAQs, isLoadingMore, loadMoreFAQs]);

  const getActionItems = (faq: FAQ): DropdownMenuItem[] => [
    {
      id: `edit-${faq.id}`,
      label: "Editar FAQ",
      icon: <Edit2 size={16} />,
      onClick: () => handleEditFAQ(faq),
    },
    {
      id: `delete-${faq.id}`,
      label: "Excluir FAQ",
      icon: <Trash2 size={16} />,
      onClick: () => handleDeleteRequest(faq),
      isDanger: true,
    },
  ];

  const handleAiSearchFAQ = async () => {
    if (!aiQuery.trim()) {
      setAiError("Por favor, digite sua pergunta para a busca com IA.");
      setAiFoundFAQ(null);
      return;
    }
    if (!GEMINI_API_KEY) {
      setAiError(
        "A funcionalidade de busca com IA não está disponível (chave de API não configurada)."
      );
      addToast({
        type: "error",
        title: "Erro de Configuração IA",
        message: "Chave de API não configurada.",
      });
      setIsAiLoading(false);
      return;
    }

    setIsAiLoading(true);
    setAiFoundFAQ(null);
    setAiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const faqSnippets = allFAQs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer.substring(0, 200) + "...",
      }));

      const prompt = `
Você é um assistente inteligente especializado em encontrar a Pergunta Frequente (FAQ) mais relevante de uma empresa com base na pergunta de um usuário.
Sua tarefa é identificar o ÚNICO ID da FAQ que melhor responde à pergunta do usuário, dada uma lista de FAQs disponíveis (com ID, pergunta e uma breve resposta).
Analise cuidadosamente a pergunta do usuário e o conteúdo (pergunta e resposta) de cada FAQ.
Sua resposta DEVE SER ESTRITAMENTE o objeto JSON no formato especificado, sem nenhum texto adicional antes ou depois.

Lista de FAQs Disponíveis (ID, Pergunta, Resposta parcial):
${JSON.stringify(faqSnippets, null, 2)}

Pergunta do Usuário:
"${aiQuery}"

Retorne SUA RESPOSTA APENAS NO SEGUINTE FORMATO JSON: \`{"faqId": "ID_DA_FAQ_MAIS_RELEVANTE"}\`.
Se NENHUMA FAQ parecer relevante ou se a pergunta for muito vaga para determinar uma única melhor correspondência, retorne: \`{"faqId": null}\`.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      const parsedResponse = JSON.parse(jsonStr);
      const foundFaqId = parsedResponse.faqId;

      if (foundFaqId) {
        const found = allFAQs.find((f) => f.id === foundFaqId);
        if (found) {
          setAiFoundFAQ(found);
          addToast({
            type: "success",
            title: "IA Encontrou!",
            message: `FAQ relevante encontrada.`,
          });
        } else {
          setAiError(
            `A IA sugeriu uma FAQ com ID "${foundFaqId}", mas ela não foi encontrada.`
          );
          addToast({
            type: "warning",
            title: "FAQ Não Encontrada",
            message: "A IA sugeriu uma FAQ inválida.",
          });
        }
      } else {
        setAiFoundFAQ(null);
        setAiError(
          "Nenhuma FAQ específica foi encontrada pela IA para sua pergunta. Tente refinar sua busca ou use os filtros manuais."
        );
        addToast({
          type: "info",
          title: "Busca IA",
          message: "Nenhuma FAQ específica encontrada pela IA.",
        });
      }
    } catch (error) {
      console.error("Error during AI FAQ search:", error);
      setAiError(
        "Ocorreu um erro ao tentar buscar FAQs com a IA. Por favor, tente novamente."
      );
      addToast({
        type: "error",
        title: "Erro na Busca IA",
        message: "Não foi possível completar a busca inteligente de FAQs.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearAiSearchFAQ = () => {
    setAiQuery("");
    setAiFoundFAQ(null);
    setAiError(null);
    setIsAiLoading(false);
  };

  const renderFAQItem = (faq: FAQ, isAiSearchResult = false) => (
    <AccordionItem key={faq.id} id={faq.id}>
      <AccordionTrigger>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <span className="text-md font-medium text-primary dark:text-sky-400 mr-2 text-left flex-grow break-words pr-2">
            {faq.question}
          </span>
          <div className="flex items-center mt-1.5 sm:mt-0 space-x-2 flex-shrink-0">
            <div
              className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                faq.category
              )}`}
            >
              <Tag size={12} className="mr-1" />
              <span>{faq.category}</span>
            </div>
            {!isAiSearchResult && (
              <DropdownMenu
                items={getActionItems(faq)}
                ariaLabel={`Ações para ${faq.question}`}
              />
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
          {faq.answer}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 pl-1">
          Atualizado em: {formatDateToDisplay(faq.updatedAt)}
        </p>
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <div>
      <div className="mb-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-x-2 gap-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-50 flex items-center self-start sm:self-center">
            <HelpCircle
              size={30}
              className="mr-3 text-primary dark:text-sky-400"
            />
            Perguntas Frequentes (FAQ)
          </h1>
          <Button
            onClick={handleAddFAQ}
            leftIcon={<Plus size={18} />}
            className="w-full sm:w-auto"
          >
            Nova FAQ
          </Button>
        </div>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          Encontre respostas rápidas para as dúvidas mais comuns dos
          colaboradores.
        </p>
      </div>

      <FilterPanel title="Filtros" className="mb-2" initialCollapsed={true}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <Input
            label="Buscar por Pergunta/Resposta"
            id="faqSearchTerm"
            placeholder="Digite para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2"
          />
          <Select
            label="Categoria"
            id="faqFilterCategory"
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as PolicyCategory | "")
            }
            options={[
              { value: "", label: "Todas" },
              ...POLICY_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
            ]}
          />
        </div>
      </FilterPanel>

      <FilterPanel
        title="Busca Inteligente"
        icon={
          <Sparkles size={18} className="mr-2 text-primary dark:text-sky-400" />
        }
        className="mb-2"
        initialCollapsed={true}
      >
        <p className="text-sm text-sky-600 dark:text-sky-400 mb-3 -mt-1">
          Faça sua pergunta e a IA tentará encontrar a FAQ mais relevante.
          (Experimental)
        </p>
        <div className="space-y-3">
          <Textarea
            id="aiFaqQuery"
            placeholder="Ex: Como solicitar férias?"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            rows={2}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 focus:ring-sky-500 dark:focus:ring-sky-400"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleAiSearchFAQ}
              disabled={isAiLoading}
              leftIcon={
                isAiLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )
              }
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white"
            >
              {isAiLoading ? "Buscando..." : "Buscar"}
            </Button>
            {(aiFoundFAQ || aiError || aiQuery) && (
              <Button
                variant="outline"
                onClick={handleClearAiSearchFAQ}
                disabled={isAiLoading}
                leftIcon={<IconX size={18} />}
                className="w-full sm:w-auto border-sky-500 text-sky-600 hover:bg-sky-100 dark:border-sky-600 dark:text-sky-400 dark:hover:bg-sky-800"
              >
                Limpar Busca IA
              </Button>
            )}
          </div>
        </div>

        {isAiLoading && (
          <div className="mt-4 text-center">
            <Loader2
              size={24}
              className="animate-spin text-sky-600 dark:text-sky-400 inline-block"
            />
            <p className="text-sm text-sky-600 dark:text-sky-400">
              A IA está buscando nas FAQs...
            </p>
          </div>
        )}
        {aiError && !isAiLoading && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm">
            {aiError}
          </div>
        )}
        {aiFoundFAQ && !isAiLoading && !aiError && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Resultado da Busca por IA:
            </h4>
            <Accordion defaultOpenIds={[aiFoundFAQ.id]} className="space-y-0">
              {renderFAQItem(aiFoundFAQ, true)}
            </Accordion>
          </div>
        )}
      </FilterPanel>

      {currentlyDisplayedFAQs.length > 0 ? (
        <>
          <Accordion defaultOpenIds={openAccordionIds} className="space-y-0">
            {currentlyDisplayedFAQs.map((faq) => renderFAQItem(faq))}
          </Accordion>
          {hasMoreFAQs && (
            <div
              ref={loaderRef}
              className="flex justify-center items-center py-6"
            >
              {isLoadingMore ? (
                <Loader2
                  size={32}
                  className="animate-spin text-primary dark:text-sky-400"
                />
              ) : (
                <Button variant="outline" onClick={loadMoreFAQs}>
                  Carregar Mais FAQs
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        !aiQuery &&
        !aiFoundFAQ &&
        !isAiLoading && (
          <div className="text-center py-12">
            <HelpCircle
              size={48}
              className="mx-auto text-gray-400 dark:text-gray-500 mb-3"
            />
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              Nenhuma FAQ encontrada pelos filtros manuais.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
              <span>
                {searchTerm || filterCategory
                  ? "Tente ajustar seus filtros ou "
                  : "Você pode "}
              </span>
              <Button
                variant="link"
                onClick={handleAddFAQ}
                className="text-sm p-0"
              >
                adicionar uma nova FAQ
              </Button>
              <span>.</span>
            </div>
          </div>
        )
      )}

      <SidePanel
        isOpen={isFormPanelOpen}
        onClose={handleFormPanelClose}
        title={faqToEdit ? "Editar FAQ" : "Criar Nova FAQ"}
      >
        <FAQForm
          faqToEdit={faqToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleFormPanelClose}
        />
      </SidePanel>

      {faqToDelete && (
        <ConfirmDeleteFAQModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={confirmDelete}
          faqQuestion={faqToDelete.question}
        />
      )}
    </div>
  );
};

export default FAQPage;
