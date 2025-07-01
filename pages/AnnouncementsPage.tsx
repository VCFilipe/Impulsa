
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Announcement, AnnouncementCategory } from '../types';
import { ANNOUNCEMENT_CATEGORIES } from '../constants';
import * as announcementService from '../services/announcementService';
import { GoogleGenAI } from "@google/genai";

import SidePanel from '../components/ui/SidePanel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import { Plus, Megaphone, Loader2, Search as SearchIcon, Sparkles, X as IconX } from 'lucide-react'; 
import FilterPanel from '../components/ui/FilterPanel';
import AnnouncementCard from '../components/announcements/AnnouncementCard';
import AnnouncementForm from '../components/announcements/AnnouncementForm';
import ConfirmDeleteAnnouncementModal from '../components/announcements/ConfirmDeleteAnnouncementModal';
import AnnouncementDetailsModal from '../components/announcements/AnnouncementDetailsModal';
import { useToast } from '../contexts/ToastContext';

const SIDEPANEL_TRANSITION_DURATION = 300;
const INITIAL_ANNOUNCEMENTS_LOAD_COUNT = 6;
const ANNOUNCEMENTS_TO_LOAD_ON_SCROLL = 3;

const AnnouncementsPage: React.FC = () => {
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<AnnouncementCategory | ''>('');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAnnouncementForDetails, setSelectedAnnouncementForDetails] = useState<Announcement | null>(null);

  const [displayedAnnouncementsCount, setDisplayedAnnouncementsCount] = useState(INITIAL_ANNOUNCEMENTS_LOAD_COUNT);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  
  const { addToast } = useToast();

  const [aiQuery, setAiQuery] = useState('');
  const [aiFoundAnnouncement, setAiFoundAnnouncement] = useState<Announcement | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);


  const loadAnnouncements = useCallback((showLoading: boolean = true) => {
    if (showLoading) setIsLoadingInitial(true);
    setTimeout(() => {
      const announcements = announcementService.getAnnouncements();
      setAllAnnouncements(announcements);
      if (showLoading) setIsLoadingInitial(false);
      window.dispatchEvent(new CustomEvent('announcementsUpdated'));
    }, showLoading ? 300 : 0);
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleAddAnnouncement = () => {
    setAnnouncementToEdit(null);
    requestAnimationFrame(() => setIsFormPanelOpen(true));
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setAnnouncementToEdit(announcement);
    requestAnimationFrame(() => setIsFormPanelOpen(true));
  };
  
  const handleFormPanelClose = useCallback(() => {
    setIsFormPanelOpen(false);
    setTimeout(() => setAnnouncementToEdit(null), SIDEPANEL_TRANSITION_DURATION);
  }, []);

  const handleFormSubmit = useCallback((data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName' | 'isRead'> | Announcement) => {
    const isEditing = 'id' in data;
    if (isEditing) { 
      announcementService.updateAnnouncement(data as Announcement);
      addToast({ type: 'success', title: 'Comunicado Atualizado!', message: `O comunicado "${data.title}" foi atualizado.` });
    } else { 
      announcementService.addAnnouncement(data);
      addToast({ type: 'success', title: 'Comunicado Publicado!', message: `O comunicado "${data.title}" foi publicado.` });
    }
    loadAnnouncements(false); // Load without full loading state to avoid screen jump
    handleFormPanelClose();
  }, [loadAnnouncements, handleFormPanelClose, addToast]);

  const handleDeleteRequest = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setAnnouncementToDelete(null); 
  }, []);

  const confirmDelete = useCallback(() => {
    if (announcementToDelete) {
      announcementService.deleteAnnouncement(announcementToDelete.id);
      addToast({ type: 'success', title: 'Comunicado Excluído!', message: `O comunicado "${announcementToDelete.title}" foi excluído.` });
      loadAnnouncements(false); 
      setAiFoundAnnouncement(prev => prev?.id === announcementToDelete.id ? null : prev);
      handleCloseDeleteModal();
    }
  }, [announcementToDelete, loadAnnouncements, handleCloseDeleteModal, addToast]);

  const handleOpenDetailsModal = useCallback((announcement: Announcement) => {
    setSelectedAnnouncementForDetails(announcement);
    setIsDetailsModalOpen(true);
    if (!announcement.isRead) {
      announcementService.markAnnouncementAsRead(announcement.id);
      setAllAnnouncements(prev => prev.map(a => a.id === announcement.id ? {...a, isRead: true} : a));
      window.dispatchEvent(new CustomEvent('announcementsUpdated'));
      // Toast is optional here, usually handled by the action buttons if explicit
    }
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setTimeout(() => setSelectedAnnouncementForDetails(null), 300); 
  }, []);

  const handleTogglePin = useCallback(async (announcementId: string) => {
    const announcement = allAnnouncements.find(ann => ann.id === announcementId);
    if (announcement) {
      try {
        const updatedAnn = await announcementService.updateAnnouncement({ ...announcement, isPinned: !announcement.isPinned });
        addToast({ type: 'success', title: 'Status Alterado!', message: `Comunicado ${updatedAnn.isPinned ? 'fixado' : 'desfixado'} com sucesso.`});
        loadAnnouncements(false); 
      } catch (error) {
        addToast({ type: 'error', title: 'Erro ao Alterar Status', message: 'Não foi possível atualizar o comunicado.'});
      }
    }
  }, [allAnnouncements, loadAnnouncements, addToast]);

  const handleMarkAsRead = useCallback((announcementId: string) => {
    announcementService.markAnnouncementAsRead(announcementId);
    setAllAnnouncements(prev => prev.map(a => a.id === announcementId ? {...a, isRead: true} : a));
    window.dispatchEvent(new CustomEvent('announcementsUpdated'));
    addToast({ type: 'info', title: 'Marcado como Lido', message: 'O comunicado foi marcado como lido.' });
  }, [addToast]);

  const handleMarkAsUnread = useCallback((announcementId: string) => {
    announcementService.markAnnouncementAsUnread(announcementId);
    setAllAnnouncements(prev => prev.map(a => a.id === announcementId ? {...a, isRead: false} : a));
    window.dispatchEvent(new CustomEvent('announcementsUpdated'));
    addToast({ type: 'info', title: 'Marcado como Não Lido', message: 'O comunicado foi marcado como não lido.' });
  }, [addToast]);


  const filteredAnnouncements = useMemo(() => {
    return allAnnouncements.filter(ann => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (ann.title.toLowerCase().includes(searchTermLower) ||
         ann.content.toLowerCase().includes(searchTermLower)) &&
        (filterCategory ? ann.category === filterCategory : true)
      );
    });
  }, [allAnnouncements, searchTerm, filterCategory]);

  useEffect(() => {
    setDisplayedAnnouncementsCount(INITIAL_ANNOUNCEMENTS_LOAD_COUNT);
  }, [searchTerm, filterCategory, allAnnouncements]);

  const currentlyDisplayedAnnouncements = useMemo(() => {
    return filteredAnnouncements.slice(0, displayedAnnouncementsCount);
  }, [filteredAnnouncements, displayedAnnouncementsCount]);

  const hasMoreAnnouncements = useMemo(() => {
    return displayedAnnouncementsCount < filteredAnnouncements.length;
  }, [displayedAnnouncementsCount, filteredAnnouncements.length]);

  const loadMoreAnnouncements = useCallback(() => {
    if (isLoadingMore || !hasMoreAnnouncements) return;
    setIsLoadingMore(true);
    setTimeout(() => { 
      setDisplayedAnnouncementsCount(prev => Math.min(prev + ANNOUNCEMENTS_TO_LOAD_ON_SCROLL, filteredAnnouncements.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMoreAnnouncements, filteredAnnouncements.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreAnnouncements && !isLoadingMore) {
          loadMoreAnnouncements();
        }
      },
      { threshold: 1.0 }
    );
    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) observer.observe(currentLoaderRef);
    return () => { if (currentLoaderRef) observer.unobserve(currentLoaderRef); };
  }, [hasMoreAnnouncements, isLoadingMore, loadMoreAnnouncements]);

  const handleAiSearchAnnouncement = async () => {
    if (!aiQuery.trim()) {
      setAiError("Por favor, digite sua pergunta para a busca com IA.");
      setAiFoundAnnouncement(null);
      return;
    }
     if (!process.env.API_KEY) {
      setAiError("A funcionalidade de busca com IA não está disponível (chave de API não configurada).");
      addToast({type: 'error', title: 'Erro de Configuração IA', message: 'Chave de API não configurada.'});
      setIsAiLoading(false);
      return;
    }

    setIsAiLoading(true);
    setAiFoundAnnouncement(null);
    setAiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const announcementSnippets = allAnnouncements.map(ann => ({ 
        id: ann.id, 
        title: ann.title, 
        category: ann.category,
        contentSnippet: ann.content.substring(0, 250) + "..." 
      }));

      const systemPrompt = `
Você é um assistente inteligente especializado em encontrar o comunicado interno mais relevante de uma empresa com base na pergunta de um usuário.
Sua tarefa é identificar o ÚNICO ID do comunicado que melhor responde à pergunta do usuário, dada uma lista de comunicados disponíveis (com ID, título, categoria e um trecho do conteúdo).
Analise cuidadosamente a pergunta do usuário e o conteúdo de cada comunicado.
Sua resposta DEVE SER ESTRITAMENTE o objeto JSON no formato especificado, sem nenhum texto adicional antes ou depois.

Lista de Comunicados Disponíveis (com trechos):
${JSON.stringify(announcementSnippets, null, 2)}

Pergunta do Usuário:
"${aiQuery}"

Retorne SUA RESPOSTA APENAS NO SEGUINTE FORMATO JSON: \`{"announcementId": "ID_DO_COMUNICADO_MAIS_RELEVANTE"}\`.
Se NENHUM comunicado parecer relevante ou se a pergunta for muito vaga para determinar uma única melhor correspondência, retorne: \`{"announcementId": null}\`.
`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) jsonStr = match[2].trim();
      
      const parsedResponse = JSON.parse(jsonStr);
      const foundAnnouncementId = parsedResponse.announcementId;

      if (foundAnnouncementId) {
        const found = allAnnouncements.find(f => f.id === foundAnnouncementId);
        if (found) {
          setAiFoundAnnouncement(found);
          addToast({type: 'success', title: 'IA Encontrou!', message: `Comunicado "${found.title}" encontrado.`});
        } else {
          setAiError(`A IA sugeriu um comunicado com ID "${foundAnnouncementId}", mas ele não foi encontrado.`);
          addToast({type: 'warning', title: 'Comunicado Não Encontrado', message: 'A IA sugeriu um comunicado inválido.'});
        }
      } else {
        setAiFoundAnnouncement(null);
        setAiError("Nenhum comunicado específico foi encontrado pela IA para sua pergunta. Tente refinar sua busca ou use os filtros manuais.");
        addToast({type: 'info', title: 'Busca IA', message: 'Nenhum comunicado específico encontrado pela IA.'});
      }

    } catch (error) {
      console.error("Error during AI Announcement search:", error);
      setAiError("Ocorreu um erro ao tentar buscar comunicados com a IA. Por favor, tente novamente.");
      addToast({type: 'error', title: 'Erro na Busca IA', message: 'Não foi possível completar a busca inteligente de comunicados.'});
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearAiSearchAnnouncement = () => {
    setAiQuery('');
    setAiFoundAnnouncement(null);
    setAiError(null);
    setIsAiLoading(false);
  };


  return (
    <div>
      <div className="mb-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-x-4 gap-y-2"> 
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-50 flex items-center self-start sm:self-center">
            <Megaphone size={30} className="mr-3 text-primary dark:text-sky-400" />
            Mural de Comunicados
          </h1>
          <Button onClick={handleAddAnnouncement} leftIcon={<Plus size={18}/>} className="w-full sm:w-auto">
            Novo Comunicado
          </Button>
        </div>
        <p className="mt-1 text-gray-600 dark:text-gray-300">Fique por dentro das últimas notícias e avisos importantes da empresa.</p>
      </div>

      <FilterPanel title="Filtros" className="mb-2" initialCollapsed={true}> 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end"> 
          <Input
            label="Buscar por Título ou Conteúdo"
            id="announcementSearchTerm"
            placeholder="Digite para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            label="Categoria"
            id="announcementFilterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as AnnouncementCategory | '')}
            options={[{ value: '', label: 'Todas' }, ...ANNOUNCEMENT_CATEGORIES.map(cat => ({ value: cat, label: cat }))]}
          />
        </div>
      </FilterPanel>

      <FilterPanel 
        title="Busca Inteligente" 
        icon={<Sparkles size={18} className="mr-2 text-primary dark:text-sky-400" />} 
        className="mb-2"
        initialCollapsed={true}
      >
        <h4 className="text-md font-medium text-sky-600 dark:text-sky-400 mb-2">
          Precisa de um comunicado específico? Descreva o que você procura.
        </h4>
        <div className="space-y-3">
          <Textarea
            id="aiAnnouncementQuery"
            placeholder="Ex: Qual o último aviso sobre a manutenção dos servidores?"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            rows={2}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 focus:ring-sky-500 dark:focus:ring-sky-400"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleAiSearchAnnouncement} 
              disabled={isAiLoading} 
              leftIcon={isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <SearchIcon size={18} />}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white"
            >
              {isAiLoading ? 'Buscando...' : 'Buscar'}
            </Button>
            {(aiFoundAnnouncement || aiError || aiQuery) && (
               <Button 
                variant="outline"
                onClick={handleClearAiSearchAnnouncement} 
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
            <p className="text-sm text-sky-600 dark:text-sky-400">A IA está buscando nos comunicados...</p>
          </div>
        )}
        {aiError && !isAiLoading && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm">
            {aiError}
          </div>
        )}
        {aiFoundAnnouncement && !isAiLoading && !aiError && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Resultado da Busca por IA:</h4>
             <AnnouncementCard
                announcement={aiFoundAnnouncement}
                onEdit={handleEditAnnouncement}
                onDelete={() => handleDeleteRequest(aiFoundAnnouncement)}
                onViewDetails={handleOpenDetailsModal}
                onTogglePin={handleTogglePin}
                onMarkAsRead={handleMarkAsRead}
                onMarkAsUnread={handleMarkAsUnread}
              />
          </div>
        )}
      </FilterPanel>

      {isLoadingInitial ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: INITIAL_ANNOUNCEMENTS_LOAD_COUNT }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : currentlyDisplayedAnnouncements.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
            {currentlyDisplayedAnnouncements.map(ann => (
              <AnnouncementCard
                key={ann.id}
                announcement={ann}
                onEdit={handleEditAnnouncement}
                onDelete={() => handleDeleteRequest(ann)}
                onViewDetails={handleOpenDetailsModal}
                onTogglePin={handleTogglePin}
                onMarkAsRead={handleMarkAsRead}
                onMarkAsUnread={handleMarkAsUnread}
              />
            ))}
          </div>
          {hasMoreAnnouncements && (
            <div ref={loaderRef} className="flex justify-center items-center py-6 mt-4">
              {isLoadingMore ? (
                <Loader2 size={32} className="animate-spin text-primary dark:text-sky-400" />
              ) : (
                <Button variant="outline" onClick={loadMoreAnnouncements}>
                  Carregar Mais Comunicados
                </Button>
              )}
            </div>
          )}
        </>
      ) : !aiQuery && !aiFoundAnnouncement && !isAiLoading && ( 
        <div className="text-center py-12">
          <Megaphone size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">Nenhum comunicado encontrado.</p>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
            <span>
              {searchTerm || filterCategory ? 'Tente ajustar seus filtros ou ' : 'Você pode '}
            </span>
            <Button variant="link" onClick={handleAddAnnouncement} className="text-sm p-0">
              adicionar um novo comunicado
            </Button>
            <span>.</span>
          </div>
        </div>
      )}
      
      <SidePanel
        isOpen={isFormPanelOpen}
        onClose={handleFormPanelClose}
        title={announcementToEdit ? 'Editar Comunicado' : 'Criar Novo Comunicado'}
      >
        <AnnouncementForm
          announcementToEdit={announcementToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleFormPanelClose}
        />
      </SidePanel>

      {announcementToDelete && (
        <ConfirmDeleteAnnouncementModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={confirmDelete}
          announcementTitle={announcementToDelete.title}
        />
      )}

      {selectedAnnouncementForDetails && (
        <AnnouncementDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          announcement={selectedAnnouncementForDetails}
        />
      )}
    </div>
  );
};

export default AnnouncementsPage;
