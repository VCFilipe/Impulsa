import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { AIPrompt } from "../types";
import * as aiPromptService from "../services/aiPromptService";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

import SidePanel from "../components/ui/SidePanel";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/Accordion";
import DropdownMenu, { DropdownMenuItem } from "../components/ui/DropdownMenu";
import {
  Plus,
  ClipboardList,
  Edit2,
  Trash2,
  Tag,
  Copy,
  Loader2,
  Search,
  X as IconX,
  Wand2,
  Save,
  Sparkles,
} from "lucide-react";
import FilterPanel from "../components/ui/FilterPanel";
import AIPromptForm from "../components/aiPrompts/AIPromptForm";
import ConfirmDeleteAIPromptModal from "../components/aiPrompts/ConfirmDeleteAIPromptModal";
import { formatDateToDisplay } from "../utils/dateUtils";
import { useToast } from "../contexts/ToastContext";
import { AI_PROMPT_USE_CASES } from "@/constants";
import { GEMINI_API_KEY } from "@/config/envs";

const SIDEPANEL_TRANSITION_DURATION = 300;
const INITIAL_PROMPTS_LOAD_COUNT = 10;
const PROMPTS_TO_LOAD_ON_SCROLL = 5;

interface GeneratedAIData {
  suggestedTitle: string;
  suggestedUseCase: string;
  suggestedDescription: string;
  generatedPromptText: string;
}

const AIPromptsPage: React.FC = () => {
  const [allPrompts, setAllPrompts] = useState<AIPrompt[]>([]);

  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<AIPrompt | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<AIPrompt | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterUseCase, setFilterUseCase] = useState<string>("");

  const [openAccordionIds, setOpenAccordionIds] = useState<string[]>([]);

  const [displayedPromptsCount, setDisplayedPromptsCount] = useState(
    INITIAL_PROMPTS_LOAD_COUNT
  );
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { addToast } = useToast();

  const [aiQuery, setAiQuery] = useState("");
  const [aiFoundPrompt, setAiFoundPrompt] = useState<AIPrompt | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [userPromptRequest, setUserPromptRequest] = useState("");
  const [generatedAIData, setGeneratedAIData] =
    useState<GeneratedAIData | null>(null);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [aiGenerationError, setAiGenerationError] = useState<string | null>(
    null
  );
  const [formInitialData, setFormInitialData] = useState<
    Partial<Omit<AIPrompt, "id" | "createdAt" | "updatedAt">> | undefined
  >(undefined);

  const loadPrompts = useCallback(() => {
    const prompts = aiPromptService.getAIPrompts();
    setAllPrompts(prompts);
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handleAddPrompt = (
    initialData?: Partial<Omit<AIPrompt, "id" | "createdAt" | "updatedAt">>
  ) => {
    setPromptToEdit(null);
    setFormInitialData(initialData);
    requestAnimationFrame(() => setIsFormPanelOpen(true));
  };

  const handleEditPrompt = (prompt: AIPrompt) => {
    setPromptToEdit(prompt);
    setFormInitialData(undefined);
    requestAnimationFrame(() => setIsFormPanelOpen(true));
  };

  const handleFormPanelClose = useCallback(() => {
    setIsFormPanelOpen(false);
    setTimeout(() => {
      setPromptToEdit(null);
      setFormInitialData(undefined);
    }, SIDEPANEL_TRANSITION_DURATION);
  }, []);

  const handleFormSubmit = useCallback(
    (
      promptData: Omit<AIPrompt, "id" | "createdAt" | "updatedAt"> | AIPrompt
    ) => {
      let newPromptId = "";
      const isEditing = "id" in promptData;

      if (isEditing) {
        aiPromptService.updateAIPrompt(promptData as AIPrompt);
        addToast({
          type: "success",
          title: "Prompt Atualizado!",
          message: `O prompt "${promptData.title}" foi atualizado.`,
        });
      } else {
        const newPrompt = aiPromptService.addAIPrompt(promptData);
        newPromptId = newPrompt.id;
        addToast({
          type: "success",
          title: "Prompt Criado!",
          message: `O prompt "${promptData.title}" foi criado.`,
        });
      }
      loadPrompts();

      if (newPromptId) {
        const newPromptsList = aiPromptService.getAIPrompts();
        const newIndex = newPromptsList.findIndex((p) => p.id === newPromptId);
        setDisplayedPromptsCount((prevCount) =>
          Math.max(prevCount, newIndex + 1)
        );
        setOpenAccordionIds((prev) => [
          newPromptId,
          ...prev.filter((id) => id !== newPromptId),
        ]);
        setTimeout(() => {
          const element = document.getElementById(
            `accordion-trigger-${newPromptId}`
          );
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
      handleFormPanelClose();
    },
    [loadPrompts, handleFormPanelClose, addToast]
  );

  const handleDeleteRequest = (prompt: AIPrompt) => {
    setPromptToDelete(prompt);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setPromptToDelete(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (promptToDelete) {
      aiPromptService.deleteAIPrompt(promptToDelete.id);
      addToast({
        type: "success",
        title: "Prompt Excluído!",
        message: `O prompt "${promptToDelete.title}" foi excluído.`,
      });
      loadPrompts();
      setAiFoundPrompt((prev) =>
        prev?.id === promptToDelete.id ? null : prev
      );
      handleCloseDeleteModal();
    }
  }, [promptToDelete, loadPrompts, handleCloseDeleteModal, addToast]);

  const getUseCaseTagColor = (useCase: string) => {
    let hash = 0;
    for (let i = 0; i < useCase.length; i++) {
      hash = useCase.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-sky-700 dark:text-sky-200",
      "bg-green-100 text-green-700 dark:bg-emerald-700 dark:text-emerald-200",
      "bg-purple-100 text-purple-700 dark:bg-violet-700 dark:text-violet-200",
      "bg-yellow-100 text-yellow-700 dark:bg-amber-700 dark:text-amber-200",
      "bg-pink-100 text-pink-700 dark:bg-pink-700 dark:text-pink-200",
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-200",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const uniqueUseCasesForFilter = useMemo(() => {
    return [
      { value: "", label: "Todos os Casos de Uso" },
      ...AI_PROMPT_USE_CASES.map((uc) => ({ value: uc, label: uc })),
    ];
  }, []);

  const filteredPrompts = useMemo(() => {
    return allPrompts.filter((prompt) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (prompt.title.toLowerCase().includes(searchTermLower) ||
          prompt.description.toLowerCase().includes(searchTermLower) ||
          prompt.promptText.toLowerCase().includes(searchTermLower)) &&
        (filterUseCase ? prompt.useCase === filterUseCase : true)
      );
    });
  }, [allPrompts, searchTerm, filterUseCase]);

  useEffect(() => {
    setDisplayedPromptsCount(INITIAL_PROMPTS_LOAD_COUNT);
  }, [searchTerm, filterUseCase, allPrompts]);

  const currentlyDisplayedPrompts = useMemo(() => {
    return filteredPrompts.slice(0, displayedPromptsCount);
  }, [filteredPrompts, displayedPromptsCount]);

  const hasMorePrompts = useMemo(() => {
    return displayedPromptsCount < filteredPrompts.length;
  }, [displayedPromptsCount, filteredPrompts.length]);

  const loadMorePrompts = useCallback(() => {
    if (isLoadingMore || !hasMorePrompts) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedPromptsCount((prev) =>
        Math.min(prev + PROMPTS_TO_LOAD_ON_SCROLL, filteredPrompts.length)
      );
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMorePrompts, filteredPrompts.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePrompts && !isLoadingMore) {
          loadMorePrompts();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }
    return () => {
      if (currentLoaderRef) observer.unobserve(currentLoaderRef);
    };
  }, [hasMorePrompts, isLoadingMore, loadMorePrompts]);

  const handleCopyPromptText = (textToCopy: string, title: string) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() =>
        addToast({
          type: "success",
          title: "Texto Copiado!",
          message: `Conteúdo do prompt "${title}" copiado.`,
        })
      )
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        addToast({
          type: "error",
          title: "Falha ao Copiar",
          message: "Não foi possível copiar o texto.",
        });
      });
  };

  const getActionItems = (prompt: AIPrompt): DropdownMenuItem[] => [
    {
      id: `edit-${prompt.id}`,
      label: "Editar Prompt",
      icon: <Edit2 size={16} />,
      onClick: () => handleEditPrompt(prompt),
    },
    {
      id: `delete-${prompt.id}`,
      label: "Excluir Prompt",
      icon: <Trash2 size={16} />,
      onClick: () => handleDeleteRequest(prompt),
      isDanger: true,
    },
  ];

  const handleAiSearchPrompt = async () => {
    if (!aiQuery.trim()) {
      setAiError("Por favor, digite sua pergunta para a busca com IA.");
      setAiFoundPrompt(null);
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
    setAiFoundPrompt(null);
    setAiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const promptCatalogSnippets = allPrompts.map((p) => ({
        id: p.id,
        title: p.title,
        useCase: p.useCase,
        description: p.description.substring(0, 150) + "...",
        promptTextSnippet: p.promptText.substring(0, 200) + "...",
      }));

      const systemPrompt = `
Você é um assistente inteligente especializado em encontrar o prompt de IA mais relevante de um catálogo, com base na pergunta de um usuário.
Sua tarefa é identificar o ÚNICO ID do prompt do catálogo que melhor responde à pergunta do usuário.
Analise cuidadosamente a pergunta do usuário e o conteúdo de cada prompt do catálogo (título, caso de uso, descrição e um trecho do texto do prompt).
Sua resposta DEVE SER ESTRITAMENTE o objeto JSON no formato especificado, sem nenhum texto adicional antes ou depois.

Catálogo de Prompts Disponíveis (com trechos):
${JSON.stringify(promptCatalogSnippets, null, 2)}

Pergunta do Usuário:
"${aiQuery}"

Retorne SUA RESPOSTA APENAS NO SEGUINTE FORMATO JSON: \`{"promptId": "ID_DO_PROMPT_MAIS_RELEVANTE"}\`.
Se NENHUM prompt do catálogo parecer relevante ou se a pergunta for muito vaga para determinar uma única melhor correspondência, retorne: \`{"promptId": null}\`.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: systemPrompt,
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
      const foundPromptId = parsedResponse.promptId;

      if (foundPromptId) {
        const found = allPrompts.find((f) => f.id === foundPromptId);
        if (found) {
          setAiFoundPrompt(found);
          setOpenAccordionIds([found.id]);
          addToast({
            type: "success",
            title: "IA Encontrou!",
            message: `Prompt "${found.title}" encontrado.`,
          });
          setTimeout(() => {
            const element = document.getElementById(
              `accordion-trigger-${found.id}`
            );
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        } else {
          setAiError(
            `A IA sugeriu um prompt com ID "${foundPromptId}", mas ele não foi encontrado.`
          );
          addToast({
            type: "warning",
            title: "Prompt Não Encontrado",
            message: "A IA sugeriu um prompt inválido.",
          });
        }
      } else {
        setAiFoundPrompt(null);
        setAiError(
          "Nenhum prompt específico foi encontrado pela IA para sua pergunta. Tente refinar sua busca ou use os filtros manuais."
        );
        addToast({
          type: "info",
          title: "Busca IA",
          message: "Nenhum prompt específico encontrado pela IA.",
        });
      }
    } catch (error) {
      console.error("Error during AI Prompt search:", error);
      setAiError(
        "Ocorreu um erro ao tentar buscar prompts com a IA. Por favor, tente novamente."
      );
      addToast({
        type: "error",
        title: "Erro na Busca IA",
        message: "Não foi possível completar a busca inteligente de prompts.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearAiSearchPrompt = () => {
    setAiQuery("");
    setAiFoundPrompt(null);
    setAiError(null);
    setIsAiLoading(false);
  };

  const handleGeneratePromptWithAI = async () => {
    if (!userPromptRequest.trim()) {
      setAiGenerationError("Por favor, descreva o prompt que você precisa.");
      addToast({
        type: "info",
        title: "Campo Vazio",
        message: "Descreva o prompt antes de gerar.",
      });
      return;
    }
    if (!GEMINI_API_KEY) {
      setAiGenerationError(
        "A funcionalidade de geração de prompt com IA não está disponível (chave de API não configurada)."
      );
      addToast({
        type: "error",
        title: "Erro de Configuração IA",
        message: "Chave de API não configurada.",
      });
      return;
    }

    setIsGeneratingWithAI(true);
    setGeneratedAIData(null);
    setAiGenerationError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const systemInstructionForGenerator = `Você é um especialista em engenharia de prompts e catalogação. Sua tarefa é criar um prompt detalhado e eficaz para um modelo de linguagem grande (LLM) com base na descrição fornecida pelo usuário. Além disso, você deve sugerir metadados para catalogar este prompt.

Descrição do usuário para o prompt que ele precisa:
"${userPromptRequest}"

Casos de Uso Válidos para Catalogação (escolha o MAIS apropriado):
${JSON.stringify(AI_PROMPT_USE_CASES)}

Com base na descrição do usuário, gere:
1.  \`generatedPromptText\`: O texto completo do prompt de IA otimizado e eficaz.
2.  \`suggestedTitle\`: Um título conciso e descritivo para este prompt (máximo 100 caracteres).
3.  \`suggestedUseCase\`: O caso de uso MAIS apropriado da lista de "Casos de Uso Válidos" fornecida acima. Se nenhum se encaixar perfeitamente, escolha o mais próximo ou "${
        AI_PROMPT_USE_CASES[0] || "Geral"
      }".
4.  \`suggestedDescription\`: Uma descrição curta e informativa sobre o que este prompt faz e para que serve (máximo 250 caracteres).

Retorne sua resposta ESTRITAMENTE no seguinte formato JSON, sem nenhum texto adicional antes ou depois:
\`\`\`json
{
  "generatedPromptText": "O texto completo do prompt aqui...",
  "suggestedTitle": "Título sugerido aqui...",
  "suggestedUseCase": "Caso de Uso escolhido aqui...",
  "suggestedDescription": "Descrição sugerida aqui..."
}
\`\`\`
Lembre-se, o \`generatedPromptText\` é o prompt que o usuário final usará com o LLM. Os outros campos são para catalogação.
O \`generatedPromptText\` deve ser completo e pronto para uso.`;

      const response: GenerateContentResponse = await ai.models.generateContent(
        {
          model: "gemini-2.5-flash-preview-04-17",
          contents: userPromptRequest, // Send user request directly as content
          config: {
            systemInstruction: systemInstructionForGenerator,
            responseMimeType: "application/json",
          },
        }
      );

      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      const parsedData = JSON.parse(jsonStr) as GeneratedAIData;

      // Validate use case from AI
      if (!AI_PROMPT_USE_CASES.includes(parsedData.suggestedUseCase)) {
        parsedData.suggestedUseCase = AI_PROMPT_USE_CASES[0] || "Geral"; // Default if invalid
      }

      setGeneratedAIData(parsedData);
      addToast({
        type: "success",
        title: "Prompt Gerado!",
        message: "A IA criou um prompt e metadados para você.",
      });
    } catch (error) {
      console.error("Error generating prompt with AI:", error);
      setAiGenerationError(
        "Ocorreu um erro ao tentar gerar o prompt com a IA. Tente novamente."
      );
      addToast({
        type: "error",
        title: "Erro na Geração IA",
        message: "Não foi possível gerar o prompt.",
      });
    } finally {
      setIsGeneratingWithAI(false);
    }
  };

  const handleSaveGeneratedPrompt = () => {
    if (generatedAIData) {
      handleAddPrompt({
        title: generatedAIData.suggestedTitle,
        description: generatedAIData.suggestedDescription,
        useCase: generatedAIData.suggestedUseCase,
        promptText: generatedAIData.generatedPromptText,
      });
    }
  };

  const renderPromptItem = (prompt: AIPrompt, isAiSearchResult = false) => (
    <AccordionItem key={prompt.id} id={prompt.id}>
      <AccordionTrigger>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <span className="text-md font-medium text-primary dark:text-sky-400 mr-2 text-left flex-grow break-words pr-2">
            {prompt.title}
          </span>
          <div className="flex items-center mt-1.5 sm:mt-0 space-x-2 flex-shrink-0">
            <div
              className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getUseCaseTagColor(
                prompt.useCase
              )}`}
            >
              <Tag size={12} className="mr-1" />
              <span className="truncate" title={prompt.useCase}>
                {prompt.useCase}
              </span>
            </div>
            {!isAiSearchResult && (
              <DropdownMenu
                items={getActionItems(prompt)}
                ariaLabel={`Ações para ${prompt.title}`}
              />
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
              Caso de Uso:
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {prompt.useCase}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
              Descrição:
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {prompt.description}
            </p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Texto do Prompt:
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleCopyPromptText(prompt.promptText, prompt.title)
                }
                leftIcon={<Copy size={14} />}
                className="text-xs px-2 py-1 text-primary dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-sky-400/10"
              >
                Copiar Prompt
              </Button>
            </div>
            <pre className="text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700 whitespace-pre-wrap break-words overflow-x-auto max-h-96">
              <code>{prompt.promptText}</code>
            </pre>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 pl-1">
            Atualizado em: {formatDateToDisplay(prompt.updatedAt)}
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <div>
      <div className="mb-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-x-2 gap-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-50 flex items-center self-start sm:self-center">
            <ClipboardList
              size={30}
              className="mr-3 text-primary dark:text-sky-400"
            />
            Catálogo de Prompts de IA
          </h1>
          <Button
            onClick={() => handleAddPrompt()}
            leftIcon={<Plus size={18} />}
            className="w-full sm:w-auto"
          >
            Novo Prompt
          </Button>
        </div>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          Gerencie e explore prompts para diversas tarefas de Inteligência
          Artificial.
        </p>
      </div>

      <FilterPanel title="Filtros" className="mb-2" initialCollapsed={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
          <Input
            label="Buscar por Título, Descrição ou Texto do Prompt"
            id="promptSearchTerm"
            placeholder="Digite para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            label="Caso de Uso"
            id="promptFilterUseCase"
            value={filterUseCase}
            onChange={(e) => setFilterUseCase(e.target.value)}
            options={uniqueUseCasesForFilter}
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
        <h4 className="text-md font-medium text-sky-600 dark:text-sky-400 mb-2">
          Precisa de um prompt específico? Descreva o que você quer que a IA
          faça.
        </h4>
        <div className="space-y-3">
          <Textarea
            id="aiPromptQuery"
            placeholder="Ex: Preciso de um prompt para gerar código Python que some números."
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            rows={2}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 focus:ring-sky-500 dark:focus:ring-sky-400"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleAiSearchPrompt}
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
            {(aiFoundPrompt || aiError || aiQuery) && (
              <Button
                variant="outline"
                onClick={handleClearAiSearchPrompt}
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
              A IA está buscando nos prompts...
            </p>
          </div>
        )}
        {aiError && !isAiLoading && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm">
            {aiError}
          </div>
        )}
        {aiFoundPrompt && !isAiLoading && !aiError && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Resultado da Busca por IA:
            </h4>
            <Accordion
              defaultOpenIds={[aiFoundPrompt.id]}
              className="space-y-0"
            >
              {renderPromptItem(aiFoundPrompt, true)}
            </Accordion>
          </div>
        )}
      </FilterPanel>

      <FilterPanel
        title="Gerador de Prompts"
        icon={
          <Sparkles size={18} className="mr-2 text-primary dark:text-sky-400" />
        }
        className="mb-2"
        initialCollapsed={false}
      >
        <h4 className="text-md font-medium text-sky-600 dark:text-sky-400 mb-2">
          Precisa de um novo prompt? Descreva a tarefa e a IA irá criá-lo para
          você.
        </h4>
        <div className="space-y-3">
          <Textarea
            id="userPromptRequest"
            placeholder="Ex: Quero um prompt que me ajude a escrever e-mails de marketing persuasivos para lançamento de um novo produto de tecnologia."
            value={userPromptRequest}
            onChange={(e) => setUserPromptRequest(e.target.value)}
            rows={3}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 focus:ring-sky-500 dark:focus:ring-sky-400"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleGeneratePromptWithAI}
              disabled={isGeneratingWithAI}
              leftIcon={
                isGeneratingWithAI ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Wand2 size={18} />
                )
              }
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white"
            >
              {isGeneratingWithAI ? "Gerando..." : "Gerar"}
            </Button>
          </div>
        </div>

        {isGeneratingWithAI && (
          <div className="mt-4 text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
            <Loader2
              size={24}
              className="animate-spin text-sky-600 dark:text-sky-400 inline-block"
            />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A IA está criando seu prompt...
            </p>
          </div>
        )}
        {aiGenerationError && !isGeneratingWithAI && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm">
            {aiGenerationError}
          </div>
        )}
        {generatedAIData &&
          generatedAIData.generatedPromptText &&
          !isGeneratingWithAI &&
          !aiGenerationError && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 shadow">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                  Prompt Gerado pela IA:
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopyPromptText(
                      generatedAIData.generatedPromptText,
                      `Prompt Gerado: ${generatedAIData.suggestedTitle.substring(
                        0,
                        20
                      )}...`
                    )
                  }
                  leftIcon={<Copy size={14} />}
                  className="text-xs px-2 py-1 text-primary dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-sky-400/10"
                >
                  Copiar Prompt
                </Button>
              </div>
              <pre className="text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 p-3.5 rounded-md border border-gray-300 dark:border-gray-600 whitespace-pre-wrap break-words overflow-x-auto max-h-80 shadow-inner">
                <code>{generatedAIData.generatedPromptText}</code>
              </pre>
              <div className="mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveGeneratedPrompt}
                  leftIcon={<Save size={14} />}
                  className="w-full sm:w-auto"
                >
                  Salvar no Catálogo
                </Button>
              </div>
            </div>
          )}
      </FilterPanel>

      {currentlyDisplayedPrompts.length > 0 ? (
        <>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-1">
            Prompts Salvos no Catálogo:
          </h3>
          <Accordion defaultOpenIds={openAccordionIds} className="space-y-0">
            {currentlyDisplayedPrompts.map((prompt) =>
              renderPromptItem(prompt)
            )}
          </Accordion>
          {hasMorePrompts && (
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
                <Button variant="outline" onClick={loadMorePrompts}>
                  Carregar Mais Prompts
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        !aiQuery &&
        !aiFoundPrompt &&
        !isAiLoading && (
          <div className="text-center py-12">
            <ClipboardList
              size={48}
              className="mx-auto text-gray-400 dark:text-gray-500 mb-3"
            />
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              Nenhum prompt encontrado no catálogo.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
              <span>
                {searchTerm || filterUseCase
                  ? "Tente ajustar seus filtros ou "
                  : "Você pode "}
              </span>
              <Button
                variant="link"
                onClick={() => handleAddPrompt()}
                className="text-sm p-0"
              >
                adicionar um novo prompt
              </Button>
              <span>.</span>
            </div>
          </div>
        )
      )}

      <SidePanel
        isOpen={isFormPanelOpen}
        onClose={handleFormPanelClose}
        title={promptToEdit ? "Editar Prompt de IA" : "Criar Novo Prompt de IA"}
      >
        <AIPromptForm
          promptToEdit={promptToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleFormPanelClose}
          initialData={formInitialData}
        />
      </SidePanel>

      {promptToDelete && (
        <ConfirmDeleteAIPromptModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={confirmDelete}
          promptTitle={promptToDelete.title}
        />
      )}
    </div>
  );
};

export default AIPromptsPage;
