
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Policy, PolicyCategory, PolicyFile } from '../types'; 
import { POLICY_CATEGORIES } from '../constants';
import * as policyService from '../services/policyService';
import { GoogleGenAI } from "@google/genai";

import SidePanel from '../components/ui/SidePanel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea'; 
import Select from '../components/ui/Select'; 
import { Plus, ShieldCheck, Loader2, Search, X as IconX, Sparkles } from 'lucide-react'; // Added Sparkles, Search
import FilterPanel from '../components/ui/FilterPanel';
import PolicyCard from '../components/policies/PolicyCard';
import PolicyForm from '../components/policies/PolicyForm';
import ConfirmDeletePolicyModal from '../components/policies/ConfirmDeletePolicyModal';
import FileViewerModal from '../components/policies/FileViewerModal'; 
import PolicyDetailsModal from '../components/policies/PolicyDetailsModal'; 
import { useToast } from '../contexts/ToastContext'; 

const SIDEPANEL_TRANSITION_DURATION = 300;
const INITIAL_POLICIES_LOAD_COUNT = 9;
const POLICIES_TO_LOAD_ON_SCROLL = 6;

const PoliciesPage: React.FC = () => {
  const [allPolicies, setAllPolicies] = useState<Policy[]>([]);
  
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<PolicyCategory | ''>('');

  const [isFileViewerModalOpen, setIsFileViewerModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<PolicyFile | null>(null);

  const [isPolicyDetailsModalOpen, setIsPolicyDetailsModalOpen] = useState(false);
  const [selectedPolicyForDetails, setSelectedPolicyForDetails] = useState<Policy | null>(null);

  const [displayedPoliciesCount, setDisplayedPoliciesCount] = useState(INITIAL_POLICIES_LOAD_COUNT);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { addToast } = useToast();

  const [aiQuery, setAiQuery] = useState('');
  const [aiFoundPolicy, setAiFoundPolicy] = useState<Policy | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);


  const loadPolicies = useCallback(() => {
    const policies = policyService.getPolicies();
    setAllPolicies(policies);
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const handleAddPolicy = () => {
    setPolicyToEdit(null);
    requestAnimationFrame(() => {
        setIsFormPanelOpen(true);
    });
  };

  const handleEditPolicy = (policy: Policy) => {
    setPolicyToEdit(policy);
     requestAnimationFrame(() => {
        setIsFormPanelOpen(true);
    });
  };
  
  const handleFormPanelClose = useCallback(() => {
    setIsFormPanelOpen(false);
    setTimeout(() => {
        setPolicyToEdit(null);
    }, SIDEPANEL_TRANSITION_DURATION);
  }, []);

  const handleFormSubmit = useCallback((policyData: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> | Policy) => {
    const isEditing = 'id' in policyData;
    if (isEditing) { 
      policyService.updatePolicy(policyData as Policy);
      addToast({ type: 'success', title: 'Política Atualizada!', message: `A política "${policyData.title}" foi atualizada com sucesso.` });
    } else { 
      policyService.addPolicy(policyData);
      addToast({ type: 'success', title: 'Política Criada!', message: `A política "${policyData.title}" foi criada com sucesso.` });
    }
    loadPolicies(); 
    handleFormPanelClose();
  }, [loadPolicies, handleFormPanelClose, addToast]);

  const handleDeleteRequest = (policy: Policy) => {
    setPolicyToDelete(policy);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setPolicyToDelete(null); 
  }, []);

  const confirmDelete = useCallback(() => {
    if (policyToDelete) {
      policyService.deletePolicy(policyToDelete.id);
      addToast({ type: 'success', title: 'Política Excluída!', message: `A política "${policyToDelete.title}" foi excluída.` });
      loadPolicies(); 
      handleCloseDeleteModal();
    }
  }, [policyToDelete, loadPolicies, handleCloseDeleteModal, addToast]);

  const handleOpenFileViewer = useCallback((file: PolicyFile) => {
    setViewingFile(file);
    setIsFileViewerModalOpen(true);
  }, []); 

  const handleCloseFileViewer = useCallback(() => {
    setIsFileViewerModalOpen(false);
    setTimeout(() => {
        setViewingFile(null);
    }, 300); 
  }, []);

  const handleOpenPolicyDetailsModal = useCallback((policy: Policy) => {
    setSelectedPolicyForDetails(policy);
    setIsPolicyDetailsModalOpen(true);
  }, []);

  const handleClosePolicyDetailsModal = useCallback(() => {
    setIsPolicyDetailsModalOpen(false);
    setTimeout(() => {
        setSelectedPolicyForDetails(null);
    }, 300); 
  }, []);

  const filteredPolicies = useMemo(() => {
    return allPolicies
      .filter(policy => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          (policy.title.toLowerCase().includes(searchTermLower) ||
           policy.description.toLowerCase().includes(searchTermLower)) &&
          (filterCategory ? policy.category === filterCategory : true)
        );
      })
  }, [allPolicies, searchTerm, filterCategory]);

  useEffect(() => {
    setDisplayedPoliciesCount(INITIAL_POLICIES_LOAD_COUNT);
  }, [searchTerm, filterCategory, allPolicies]);

  const currentlyDisplayedPolicies = useMemo(() => {
    return filteredPolicies.slice(0, displayedPoliciesCount);
  }, [filteredPolicies, displayedPoliciesCount]);

  const hasMorePolicies = useMemo(() => {
    return displayedPoliciesCount < filteredPolicies.length;
  }, [displayedPoliciesCount, filteredPolicies.length]);

  const loadMorePolicies = useCallback(() => {
    if (isLoadingMore || !hasMorePolicies) return;
    setIsLoadingMore(true);
    setTimeout(() => { 
      setDisplayedPoliciesCount(prev => Math.min(prev + POLICIES_TO_LOAD_ON_SCROLL, filteredPolicies.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMorePolicies, filteredPolicies.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMorePolicies && !isLoadingMore) {
          loadMorePolicies();
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
  }, [hasMorePolicies, isLoadingMore, loadMorePolicies]);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      setAiError("Por favor, digite sua pergunta para a busca com IA.");
      setAiFoundPolicy(null);
      return;
    }
    if (!process.env.API_KEY) {
      setAiError("A funcionalidade de busca com IA não está disponível (chave de API não configurada).");
      addToast({type: 'error', title: 'Erro de Configuração IA', message: 'Chave de API não configurada.'});
      setIsAiLoading(false);
      return;
    }

    setIsAiLoading(true);
    setAiFoundPolicy(null);
    setAiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const policySnippets = allPolicies.map(p => ({ 
        id: p.id, 
        title: p.title, 
        description: p.description.substring(0, 250) + "..." 
      }));

      const prompt = `
Você é um assistente inteligente especializado em encontrar a política interna mais relevante de uma empresa com base na pergunta de um usuário.
Sua tarefa é identificar o ÚNICO ID da política que melhor responde à pergunta do usuário, dada uma lista de políticas disponíveis (com ID, título e uma breve descrição).
Analise cuidadosamente a pergunta e o conteúdo de cada política.
Sua resposta DEVE SER ESTRITAMENTE o objeto JSON no formato especificado, sem nenhum texto adicional antes ou depois.

Lista de Políticas Disponíveis (ID, Título, Descrição parcial):
${JSON.stringify(policySnippets, null, 2)}

Pergunta do Usuário:
"${aiQuery}"

Retorne SUA RESPOSTA APENAS NO SEGUINTE FORMATO JSON: \`{"policyId": "ID_DA_POLITICA_MAIS_RELEVANTE"}\`.
Se NENHUMA política parecer relevante ou se a pergunta for muito vaga para determinar uma única melhor correspondência, retorne: \`{"policyId": null}\`.
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
      
      const parsedResponse = JSON.parse(jsonStr);
      const foundPolicyId = parsedResponse.policyId;

      if (foundPolicyId) {
        const found = allPolicies.find(p => p.id === foundPolicyId);
        if (found) {
          setAiFoundPolicy(found);
          addToast({type: 'success', title: 'IA Encontrou!', message: `Política "${found.title}" encontrada.`});
        } else {
          setAiError(`A IA sugeriu uma política com ID "${foundPolicyId}", mas ela não foi encontrada no sistema.`);
          addToast({type: 'warning', title: 'Política Não Encontrada', message: 'A IA sugeriu uma política inválida.'});
        }
      } else {
        setAiFoundPolicy(null);
        setAiError("Nenhuma política específica foi encontrada pela IA para sua pergunta. Tente refinar sua busca ou use os filtros manuais.");
         addToast({type: 'info', title: 'Busca IA', message: 'Nenhuma política específica encontrada pela IA.'});
      }

    } catch (error) {
      console.error("Error during AI search:", error);
      setAiError("Ocorreu um erro ao tentar buscar com a IA. Por favor, tente novamente.");
      addToast({type: 'error', title: 'Erro na Busca IA', message: 'Não foi possível completar a busca inteligente.'});
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearAiSearch = () => {
    setAiQuery('');
    setAiFoundPolicy(null);
    setAiError(null);
    setIsAiLoading(false);
  };


  return (
    <div>
      <div className="mb-2"> 
        <div className="flex flex-col sm:flex-row justify-between items-center gap-x-2 gap-y-2"> 
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-50 flex items-center self-start sm:self-center">
            <ShieldCheck size={30} className="mr-3 text-primary dark:text-sky-400" />
            Políticas da Empresa
            </h1>
            <Button onClick={handleAddPolicy} leftIcon={<Plus size={18}/>} className="w-full sm:w-auto">
            Nova Política
            </Button>
        </div>
        <p className="mt-1 text-gray-600 dark:text-gray-300">Acesse e gerencie todas as políticas e documentos importantes da empresa.</p>
      </div>

      <FilterPanel title="Filtros" className="mb-2" initialCollapsed={true}> 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"> 
          <Input
            label="Buscar por Título/Descrição"
            id="policySearchTerm"
            placeholder="Digite para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2"
          />
          <Select
            label="Categoria"
            id="policyFilterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as PolicyCategory | '')}
            options={[{ value: '', label: 'Todas' }, ...POLICY_CATEGORIES.map(cat => ({ value: cat, label: cat }))]}
          />
        </div>
      </FilterPanel>

      <FilterPanel 
        title="Busca Inteligente" 
        icon={<Sparkles size={18} className="mr-2 text-primary dark:text-sky-400" />}
        className="mb-2" 
        initialCollapsed={true}
      >
        <p className="text-sm text-sky-600 dark:text-sky-400 mb-3 -mt-1">
          Faça uma pergunta em linguagem natural e a IA tentará encontrar a política mais relevante. (Experimental)
        </p>
        <div className="space-y-3">
          <Textarea
            id="aiQuery"
            placeholder="Ex: Qual a política para trabalho remoto?"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            rows={2}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 focus:ring-sky-500 dark:focus:ring-sky-400"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleAiSearch} 
              disabled={isAiLoading} 
              leftIcon={isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white"
            >
              {isAiLoading ? 'Buscando...' : 'Buscar'}
            </Button>
            {(aiFoundPolicy || aiError || aiQuery) && (
               <Button 
                variant="outline"
                onClick={handleClearAiSearch} 
                disabled={isAiLoading} 
                leftIcon={<IconX size={18}/>}
                className="w-full sm:w-auto border-sky-500 text-sky-600 hover:bg-sky-100 dark:border-sky-600 dark:text-sky-400 dark:hover:bg-sky-800"
              >
                Limpar Busca IA
              </Button>
            )}
          </div>
        </div>

        {isAiLoading && (
          <div className="mt-4 text-center">
            <Loader2 size={24} className="animate-spin text-sky-600 dark:text-sky-400 inline-block" />
            <p className="text-sm text-sky-600 dark:text-sky-400">A IA está pensando...</p>
          </div>
        )}
        {aiError && !isAiLoading && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm">
            {aiError}
          </div>
        )}
        {aiFoundPolicy && !isAiLoading && !aiError && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Resultado da IA:</h4>
            <div className="max-w-md mx-auto sm:max-w-none"> 
                 <PolicyCard
                    policy={aiFoundPolicy}
                    onEdit={handleEditPolicy}
                    onDelete={() => handleDeleteRequest(aiFoundPolicy)}
                    onViewFile={handleOpenFileViewer} 
                    onViewDetails={() => handleOpenPolicyDetailsModal(aiFoundPolicy)}
                />
            </div>
          </div>
        )}
      </FilterPanel>


      {currentlyDisplayedPolicies.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"> 
            {currentlyDisplayedPolicies.map(policy => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                onEdit={handleEditPolicy}
                onDelete={() => handleDeleteRequest(policy)}
                onViewFile={handleOpenFileViewer} 
                onViewDetails={() => handleOpenPolicyDetailsModal(policy)}
              />
            ))}
          </div>
          {hasMorePolicies && (
            <div ref={loaderRef} className="flex justify-center items-center py-6">
              {isLoadingMore ? (
                <Loader2 size={32} className="animate-spin text-primary dark:text-sky-400" />
              ) : (
                <Button variant="outline" onClick={loadMorePolicies}>
                  Carregar Mais Políticas
                </Button>
              )}
            </div>
          )}
        </>
      ) : !aiQuery && !aiFoundPolicy && !isAiLoading && ( 
        <div className="text-center py-12">
          <ShieldCheck size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">Nenhuma política encontrada pelos filtros manuais.</p>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
            <span>
              {searchTerm || filterCategory ? 'Tente ajustar seus filtros ou ' : 'Você pode '}
            </span>
            <Button variant="link" onClick={handleAddPolicy} className="text-sm p-0">
              adicionar uma nova política
            </Button>
            <span>.</span>
          </div>
        </div>
      )}
      
      <SidePanel
        isOpen={isFormPanelOpen}
        onClose={handleFormPanelClose}
        title={policyToEdit ? 'Editar Política' : 'Criar Nova Política'}
      >
        <PolicyForm
          policyToEdit={policyToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleFormPanelClose}
        />
      </SidePanel>

      {policyToDelete && (
        <ConfirmDeletePolicyModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={confirmDelete}
          policyName={policyToDelete.title}
        />
      )}

      {viewingFile && (
        <FileViewerModal
          isOpen={isFileViewerModalOpen}
          onClose={handleCloseFileViewer}
          file={viewingFile}
        />
      )}

      {selectedPolicyForDetails && (
        <PolicyDetailsModal
          isOpen={isPolicyDetailsModalOpen}
          onClose={handleClosePolicyDetailsModal}
          policy={selectedPolicyForDetails}
        />
      )}
    </div>
  );
};

export default PoliciesPage;
