
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Suggestion, SuggestionVoteType } from '../types';
import * as suggestionService from '../services/suggestionService';
import { GoogleGenAI } from "@google/genai";

import SidePanel from '../components/ui/SidePanel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { Plus, Lightbulb, Loader2, Search, X as IconX, Sparkles, Wand2 } from 'lucide-react'; 
import FilterPanel from '../components/ui/FilterPanel';
import SuggestionCard from '../components/suggestions/SuggestionCard';
import SuggestionForm from '../components/suggestions/SuggestionForm';
import ConfirmDeleteSuggestionModal from '../components/suggestions/ConfirmDeleteSuggestionModal';
import SuggestionDetailsModal from '../components/suggestions/SuggestionDetailsModal'; 
import { useToast } from '../contexts/ToastContext'; 

const SIDEPANEL_TRANSITION_DURATION = 300;
const INITIAL_SUGGESTIONS_LOAD_COUNT = 9;
const SUGGESTIONS_TO_LOAD_ON_SCROLL = 6;

interface AiDraftedSuggestion {
  title: string;
  description: string;
  isAnonymous: boolean;
}

const SuggestionsPage: React.FC = () => {
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);
  const [suggestionToEdit, setSuggestionToEdit] = useState<Suggestion | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [suggestionToDelete, setSuggestionToDelete] = useState<Suggestion | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [isSuggestionDetailsModalOpen, setIsSuggestionDetailsModalOpen] = useState(false);
  const [selectedSuggestionForDetails, setSelectedSuggestionForDetails] = useState<Suggestion | null>(null);
  
  const currentUserId = suggestionService.MOCK_USER_ID_SUGGESTIONS; 
  const { addToast } = useToast();

  const [displayedSuggestionsCount, setDisplayedSuggestionsCount] = useState(INITIAL_SUGGESTIONS_LOAD_COUNT);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [aiDraftText, setAiDraftText] = useState('');
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiDraftError, setAiDraftError] = useState<string | null>(null);
  const [aiGeneratedInitialData, setAiGeneratedInitialData] = useState<AiDraftedSuggestion | undefined>(undefined);


  const loadSuggestions = useCallback(() => {
    const suggestions = suggestionService.getSuggestions();
    setAllSuggestions(suggestions.sort((a,b) => {
        const scoreA = a.upvotes - a.downvotes;
        const scoreB = b.upvotes - b.downvotes;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }));
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleAddSuggestion = (initialData?: AiDraftedSuggestion) => {
    setSuggestionToEdit(null);
    setAiGeneratedInitialData(initialData); 
    requestAnimationFrame(() => {
        setIsFormPanelOpen(true);
    });
  };

  const handleEditSuggestion = (suggestion: Suggestion) => {
    setSuggestionToEdit(suggestion);
    setAiGeneratedInitialData(undefined); 
    requestAnimationFrame(() => {
        setIsFormPanelOpen(true);
    });
  };
  
  const handleFormPanelClose = useCallback(() => {
    setIsFormPanelOpen(false);
    setTimeout(() => {
        setSuggestionToEdit(null);
        setAiGeneratedInitialData(undefined); 
    }, SIDEPANEL_TRANSITION_DURATION);
  }, []);

  const handleFormSubmit = useCallback((suggestionData: Omit<Suggestion, 'id' | 'upvotes' | 'downvotes' | 'createdAt' | 'updatedAt'> | Suggestion) => {
    const isEditing = 'id' in suggestionData;
    if (isEditing) { 
      suggestionService.updateSuggestion(suggestionData as Suggestion);
      addToast({ type: 'success', title: 'Sugestão Atualizada!', message: `Sua sugestão "${suggestionData.title}" foi atualizada.` });
    } else { 
      suggestionService.addSuggestion(suggestionData);
      addToast({ type: 'success', title: 'Sugestão Enviada!', message: `Sua sugestão "${suggestionData.title}" foi enviada com sucesso.` });
    }
    loadSuggestions(); 
    handleFormPanelClose();
  }, [loadSuggestions, handleFormPanelClose, addToast]);

  const handleDeleteRequest = (suggestion: Suggestion) => {
    setSuggestionToDelete(suggestion);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSuggestionToDelete(null); 
  }, []);

  const confirmDelete = useCallback(() => {
    if (suggestionToDelete) {
      suggestionService.deleteSuggestion(suggestionToDelete.id);
      addToast({ type: 'success', title: 'Sugestão Excluída!', message: `A sugestão "${suggestionToDelete.title}" foi excluída.` });
      loadSuggestions(); 
      handleCloseDeleteModal();
    }
  }, [suggestionToDelete, loadSuggestions, handleCloseDeleteModal, addToast]);

  const handleVote = useCallback((suggestionId: string, voteType: SuggestionVoteType) => {
    suggestionService.addOrUpdateVote(suggestionId, currentUserId, voteType);
    
    const votedSuggestion = allSuggestions.find(s => s.id === suggestionId);
    if (votedSuggestion) {
        addToast({type: 'success', title: 'Voto Registrado!', message: `Seu voto para "${votedSuggestion.title}" foi contabilizado.`});
    }

    const updatedSuggestionsFromStorage = suggestionService.getSuggestions();
    const newlyUpdatedSuggestion = updatedSuggestionsFromStorage.find(s => s.id === suggestionId);

    if (newlyUpdatedSuggestion) {
      setAllSuggestions(prevSuggestions =>
        prevSuggestions.map(s =>
          s.id === suggestionId
            ? { ...s, upvotes: newlyUpdatedSuggestion.upvotes, downvotes: newlyUpdatedSuggestion.downvotes }
            : s
        )
      );
    }
  }, [currentUserId, addToast, allSuggestions]);

  const handleOpenSuggestionDetailsModal = useCallback((suggestion: Suggestion) => {
    setSelectedSuggestionForDetails(suggestion);
    setIsSuggestionDetailsModalOpen(true);
  }, []);

  const handleCloseSuggestionDetailsModal = useCallback(() => {
    setIsSuggestionDetailsModalOpen(false);
    loadSuggestions(); 
    setTimeout(() => {
        setSelectedSuggestionForDetails(null);
    }, 300); 
  }, [loadSuggestions]);


  const filteredSuggestions = useMemo(() => {
    let suggestionsToFilter = [...allSuggestions];
    return suggestionsToFilter
      .filter(suggestion => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          suggestion.title.toLowerCase().includes(searchTermLower) ||
          suggestion.description.toLowerCase().includes(searchTermLower)
        );
      });
  }, [allSuggestions, searchTerm]);

  useEffect(() => {
    setDisplayedSuggestionsCount(INITIAL_SUGGESTIONS_LOAD_COUNT);
  }, [searchTerm, loadSuggestions]); 

  const currentlyDisplayedSuggestions = useMemo(() => {
    return filteredSuggestions.slice(0, displayedSuggestionsCount);
  }, [filteredSuggestions, displayedSuggestionsCount]);

  const hasMoreSuggestions = useMemo(() => {
    return displayedSuggestionsCount < filteredSuggestions.length;
  }, [displayedSuggestionsCount, filteredSuggestions.length]);

  const loadMoreSuggestions = useCallback(() => {
    if (isLoadingMore || !hasMoreSuggestions) return;
    setIsLoadingMore(true);
    setTimeout(() => { 
      setDisplayedSuggestionsCount(prev => Math.min(prev + SUGGESTIONS_TO_LOAD_ON_SCROLL, filteredSuggestions.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMoreSuggestions, filteredSuggestions.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreSuggestions && !isLoadingMore) {
          loadMoreSuggestions();
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
  }, [hasMoreSuggestions, isLoadingMore, loadMoreSuggestions]);

  const handleAiDraftSuggestion = async () => {
    if (!aiDraftText.trim()) {
      setAiDraftError("Por favor, escreva sua ideia de sugestão no campo de rascunho.");
      addToast({ type: 'info', title: 'Campo Vazio', message: 'Escreva seu rascunho antes de usar a IA.'});
      return;
    }
    if (!process.env.API_KEY) {
      setAiDraftError("A funcionalidade de rascunho com IA não está disponível (chave de API não configurada).");
      addToast({type: 'error', title: 'Erro de Configuração IA', message: 'Chave de API não configurada.'});
      return;
    }

    setIsAiDrafting(true);
    setAiDraftError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
Você é um assistente de redação focado em transformar rascunhos de sugestões corporativas em textos finais claros, concisos e profissionais.

Instruções PRINCIPAIS para o refinamento:
1.  **FOCO NO REFINAMENTO, NÃO NA CRIAÇÃO EXTENSIVA:** Sua principal tarefa é refinar o rascunho do usuário para melhorar a clareza, gramática e profissionalismo. Evite adicionar informações que não estão no rascunho ou fazer suposições significativas.
2.  **COMPLEMENTAÇÕES MÍNIMAS:** Se o rascunho for muito breve ou telegráfico, você pode adicionar palavras de conexão ou pequenas frases para torná-lo gramaticalmente correto e compreensível, mas **não expanda as ideias do usuário ou introduza novos conceitos**. O objetivo é manter a sugestão o mais fiel possível à intenção e extensão original do rascunho.
3.  **ESTILO E TOM:** Mantenha um tom educado e construtivo. Siga o estilo do exemplo: "Gostaria de ver mais frutas frescas, iogurtes naturais, castanhas e opções integrais disponíveis na copa, em vez de tantos biscoitos recheados e salgadinhos industrializados." Observe a clareza, objetividade e a **ausência de elaborações desnecessárias** no exemplo.

Com base no rascunho do usuário abaixo, gere:
a) Um **título muito conciso e direto** para a sugestão (máximo 150 caracteres, idealmente bem mais curto, capturando a ideia central).
b) Uma **descrição refinada** (máximo 2000 caracteres), aplicando as instruções acima.
c) Uma inferência para **isAnonymous** (true/false). Considere anônima se o texto indicar desejo de não se identificar, ou se o tom for muito impessoal. Na dúvida, prefira \`false\` (não anônimo).

Retorne sua resposta ESTRITAMENTE no seguinte formato JSON, sem nenhum texto adicional antes ou depois:
\`{"title": "Seu Título Conciso Aqui", "description": "Sua Descrição Refinada Aqui.", "isAnonymous": true/false}\`

Rascunho do Usuário:
---
${aiDraftText}
---
`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsedResponse = JSON.parse(jsonStr) as AiDraftedSuggestion;

      if (parsedResponse.title && parsedResponse.description) {
        addToast({type: 'success', title: 'Rascunho Gerado!', message: 'A IA preparou um rascunho da sua sugestão.'});
        handleAddSuggestion(parsedResponse); 
        setAiDraftText(''); 
      } else {
        setAiDraftError("A IA não conseguiu gerar um título ou descrição válidos. Tente refinar seu rascunho.");
        addToast({type: 'warning', title: 'Falha na IA', message: 'Não foi possível gerar o rascunho completo.'});
      }

    } catch (error) {
      console.error("Error during AI suggestion drafting:", error);
      setAiDraftError("Ocorreu um erro ao tentar gerar a sugestão com a IA. Por favor, tente novamente.");
      addToast({type: 'error', title: 'Erro na IA', message: 'Não foi possível completar a geração do rascunho.'});
    } finally {
      setIsAiDrafting(false);
    }
  };
  
  const handleClearAiDraft = () => {
    setAiDraftText('');
    setAiDraftError(null);
    setIsAiDrafting(false);
  };


  return (
    <div>
      <div className="mb-2"> 
        <div className="flex flex-col sm:flex-row justify-between items-center gap-x-2 gap-y-2"> 
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-50 flex items-center self-start sm:self-center">
            <Lightbulb size={30} className="mr-3 text-primary dark:text-sky-400" />
            Caixa de Sugestões
          </h1>
          <Button onClick={() => handleAddSuggestion()} leftIcon={<Plus size={18}/>} className="w-full sm:w-auto">
            Nova Sugestão
          </Button>
        </div>
        <p className="mt-1 text-gray-600 dark:text-gray-300">Compartilhe suas ideias e contribua para a melhoria contínua da empresa.</p>
      </div>

      <FilterPanel title="Filtros" className="mb-2" initialCollapsed={true}> 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end"> 
          <Input
            label="Buscar por Título/Descrição"
            id="suggestionSearchTerm"
            placeholder="Digite para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2" 
          />
        </div>
      </FilterPanel>

      <FilterPanel 
        title="Rascunho Inteligente" 
        icon={<Sparkles size={18} className="mr-2 text-primary dark:text-sky-400" />} 
        className="mb-2" 
        initialCollapsed={true}
      >
        <p className="text-sm text-sky-600 dark:text-sky-400 mb-3 -mt-1">
          Descreva sua ideia em linguagem natural e a IA ajudará a estruturar sua sugestão formalmente. (Experimental)
        </p>
        <div className="space-y-3">
          <Textarea
            id="aiDraftText"
            placeholder="Ex: Acho que deveríamos ter mais opções de café na copa, o atual não é muito bom e frutas frescas também seriam legais..."
            value={aiDraftText}
            onChange={(e) => setAiDraftText(e.target.value)}
            rows={3}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 focus:ring-sky-500 dark:focus:ring-sky-400"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleAiDraftSuggestion} 
              disabled={isAiDrafting} 
              leftIcon={isAiDrafting ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white"
            >
              {isAiDrafting ? 'Gerando...' : 'Gerar'}
            </Button>
             {(aiDraftError || aiDraftText) && (
               <Button 
                variant="outline"
                onClick={handleClearAiDraft} 
                disabled={isAiDrafting} 
                leftIcon={<IconX size={18}/>}
                className="w-full sm:w-auto border-sky-500 text-sky-600 hover:bg-sky-100 dark:border-sky-600 dark:text-sky-400 dark:hover:bg-sky-800"
              >
                Limpar Rascunho
              </Button>
            )}
          </div>
        </div>
        {isAiDrafting && (
          <div className="mt-4 text-center">
            <Loader2 size={24} className="animate-spin text-sky-600 dark:text-sky-400 inline-block" />
            <p className="text-sm text-sky-600 dark:text-sky-400">A IA está elaborando sua sugestão...</p>
          </div>
        )}
        {aiDraftError && !isAiDrafting && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm">
            {aiDraftError}
          </div>
        )}
      </FilterPanel>


      {currentlyDisplayedSuggestions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"> 
            {currentlyDisplayedSuggestions.map(suggestion => {
              const userVote = suggestionService.getUserVoteForSuggestion(suggestion.id, currentUserId);
              return (
                  <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  currentUserVote={userVote}
                  onEdit={handleEditSuggestion}
                  onDelete={() => handleDeleteRequest(suggestion)}
                  onVote={handleVote}
                  onViewDetails={() => handleOpenSuggestionDetailsModal(suggestion)} 
                  />
              );
              })}
          </div>
           {hasMoreSuggestions && (
            <div ref={loaderRef} className="flex justify-center items-center py-6">
              {isLoadingMore ? (
                <Loader2 size={32} className="animate-spin text-primary dark:text-sky-400" />
              ) : (
                <Button variant="outline" onClick={loadMoreSuggestions}>
                  Carregar Mais Sugestões
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Lightbulb size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">Nenhuma sugestão encontrada.</p>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
            <span>
              {searchTerm ? 'Tente ajustar seus filtros ou ' : 'Você pode '}
            </span>
            <Button variant="link" onClick={() => handleAddSuggestion()} className="text-sm p-0">
              adicionar uma nova sugestão
            </Button>
            <span>.</span>
          </div>
        </div>
      )}
      
      <SidePanel
        isOpen={isFormPanelOpen}
        onClose={handleFormPanelClose}
        title={suggestionToEdit ? 'Editar Sugestão' : 'Criar Nova Sugestão'}
      >
        <SuggestionForm
          suggestionToEdit={suggestionToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleFormPanelClose}
          initialData={aiGeneratedInitialData} 
        />
      </SidePanel>

      {suggestionToDelete && (
        <ConfirmDeleteSuggestionModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={confirmDelete}
          suggestionTitle={suggestionToDelete.title}
        />
      )}

      {selectedSuggestionForDetails && (
        <SuggestionDetailsModal
          isOpen={isSuggestionDetailsModalOpen}
          onClose={handleCloseSuggestionDetailsModal}
          suggestion={selectedSuggestionForDetails}
          currentUserId={currentUserId} 
        />
      )}
    </div>
  );
};

export default SuggestionsPage;
