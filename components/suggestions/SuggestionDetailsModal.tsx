
import React, { useState, useEffect, useCallback } from 'react';
import { Suggestion, Comment as CommentType } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { formatDateToDisplay } from '../../utils/dateUtils';
import { ThumbsUp, ThumbsDown, User, Zap, Calendar, MessageSquare, Brain, Loader2, Send, Lightbulb } from 'lucide-react'; // Added Lightbulb
import * as commentService from '../../services/commentService';
import CommentItem from './CommentItem';
import ConfirmDeleteCommentModal from './ConfirmDeleteCommentModal';
import { useToast } from '../../contexts/ToastContext';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface SuggestionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: Suggestion | null;
  currentUserId: string; // For comment authorship and permissions
}

interface AiCommentSummary {
  overallSentiment: string;
  keyAgreements: string[];
  keyConcerns: string[];
  newIdeasFromComments: string[];
  engagementSummary: string;
}

const SuggestionDetailsModal: React.FC<SuggestionDetailsModalProps> = ({ isOpen, onClose, suggestion, currentUserId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [commentToDelete, setCommentToDelete] = useState<CommentType | null>(null);
  const [isConfirmDeleteCommentModalOpen, setIsConfirmDeleteCommentModalOpen] = useState(false);

  const [aiCommentSummary, setAiCommentSummary] = useState<AiCommentSummary | null>(null);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

  const { addToast } = useToast();

  const loadComments = useCallback(() => {
    if (suggestion) {
      const fetchedComments = commentService.getCommentsForSuggestion(suggestion.id);
      setComments(fetchedComments);
    }
  }, [suggestion]);

  useEffect(() => {
    if (isOpen && suggestion) {
      loadComments();
      // Reset AI summary when modal opens or suggestion changes
      setAiCommentSummary(null);
      setAiSummaryError(null);
      setIsAiSummaryLoading(false);
      setNewCommentText('');
      setCommentError('');
    }
  }, [isOpen, suggestion, loadComments]);

  const handleAddComment = async () => {
    if (!suggestion || !newCommentText.trim()) {
      setCommentError('O comentário não pode estar vazio.');
      return;
    }
    if (newCommentText.trim().length > 1000) {
      setCommentError('O comentário não pode exceder 1000 caracteres.');
      return;
    }
    setCommentError('');
    setIsSubmittingComment(true);
    try {
      commentService.addComment({
        suggestionId: suggestion.id,
        authorId: currentUserId,
        authorName: 'Você (Mock User)', // Or fetch actual user name
        text: newCommentText.trim(),
      });
      setNewCommentText('');
      loadComments(); // Refresh comments list
      addToast({ type: 'success', title: 'Comentário Adicionado', message: 'Seu comentário foi publicado.' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erro ao Comentar', message: 'Não foi possível adicionar seu comentário.' });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleSaveCommentEdit = async (commentId: string, newText: string) => {
    try {
        const updatedComment = commentService.updateComment(commentId, newText);
        if (updatedComment) {
            setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
        }
    } catch (error) {
        console.error("Failed to save comment edit", error);
        throw error; // Re-throw to be caught by CommentItem
    }
  };

  const handleDeleteCommentRequest = (commentId: string) => {
    const foundComment = comments.find(c => c.id === commentId);
    if (foundComment) {
      setCommentToDelete(foundComment);
      setIsConfirmDeleteCommentModalOpen(true);
    }
  };

  const confirmCommentDelete = () => {
    if (commentToDelete) {
      try {
        commentService.deleteComment(commentToDelete.id);
        setComments(prev => prev.filter(c => c.id !== commentToDelete.id));
        addToast({ type: 'success', title: 'Comentário Excluído', message: 'O comentário foi removido.' });
      } catch (error) {
        addToast({ type: 'error', title: 'Erro ao Excluir', message: 'Não foi possível remover o comentário.' });
      }
    }
    setIsConfirmDeleteCommentModalOpen(false);
    setCommentToDelete(null);
  };

  const handleGenerateAiSummary = async () => {
    if (!suggestion || !process.env.API_KEY) {
      setAiSummaryError("A funcionalidade de resumo com IA não está disponível (chave de API não configurada).");
      addToast({type: 'error', title: 'Erro de Configuração IA', message: 'Chave de API não configurada para resumo.'});
      setIsAiSummaryLoading(false); // Ensure loading is false if API key missing
      return;
    }
    if (comments.length === 0) {
        setAiSummaryError("Não há comentários para gerar uma análise.");
        setAiCommentSummary(null);
        setIsAiSummaryLoading(false); // Ensure loading is false
        return;
    }

    setIsAiSummaryLoading(true);
    setAiCommentSummary(null);
    setAiSummaryError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const commentsText = comments.map((c, index) => `Comentário ${index + 1} (Autor: ${c.authorName || c.authorId === currentUserId ? 'Você' : 'Anônimo/Outro'}): "${c.text}"`).join('\n\n');
      
      const prompt = `
Você é um assistente de IA encarregado de analisar os comentários de uma sugestão de melhoria interna em uma empresa.
Sua tarefa é ler a sugestão original e todos os comentários feitos pelos colaboradores, e então gerar uma análise estruturada.

Sugestão Original:
Título: "${suggestion.title}"
Descrição: "${suggestion.description}"

Comentários dos Colaboradores:
${commentsText}

Com base na sugestão e nos comentários, forneça uma análise concisa e objetiva. Sua resposta DEVE SER UM OBJETO JSON no seguinte formato, sem nenhum texto adicional antes ou depois:
\`\`\`json
{
  "overallSentiment": "string (Ex: 'Positivo', 'Negativo', 'Misto com sugestões construtivas', 'Neutro', 'Difícil de determinar')",
  "keyAgreements": ["string (liste os principais pontos de concordância, se houver. Máximo 3 itens)"],
  "keyConcerns": ["string (liste as principais preocupações ou discordâncias, se houver. Máximo 3 itens)"],
  "newIdeasFromComments": ["string (liste novas ideias ou melhorias sugeridas nos comentários, se houver. Máximo 3 itens)"],
  "engagementSummary": "string (Um breve resumo do nível e tipo de engajamento. Ex: 'Alto engajamento com muitas sugestões práticas.' ou 'Baixo engajamento, poucos comentários.' ou 'Comentários focados em viabilidade.')"
}
\`\`\`

Instruções Adicionais para o JSON:
-   Se não houver comentários, ou se os comentários forem muito vagos para extrair informações específicas, os arrays podem ser vazios (ex: \`"keyAgreements": []\`) e as strings de resumo podem indicar isso (ex: \`"overallSentiment": "Sem comentários suficientes para análise"\`).
-   Mantenha as strings concisas e diretas. Para os arrays, cada string deve ser um item de lista curto.
-   Seja o mais objetivo possível. Não inclua frases como "A IA analisou..." na sua resposta. Apenas o JSON.
`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
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
      
      const parsedSummary = JSON.parse(jsonStr) as AiCommentSummary;
      setAiCommentSummary(parsedSummary);
      addToast({ type: 'success', title: 'Análise Gerada!', message: 'A IA analisou os comentários.' });

    } catch (error) {
      console.error("Error generating AI comment summary:", error);
      setAiSummaryError("Ocorreu um erro ao gerar a análise dos comentários. Tente novamente.");
      addToast({ type: 'error', title: 'Erro na Análise IA', message: 'Não foi possível gerar a análise.' });
    } finally {
      setIsAiSummaryLoading(false);
    }
  };


  if (!isOpen || !suggestion) return null;

  const renderAiSummaryDisplay = () => {
    if (!aiCommentSummary) return null;
    const { overallSentiment, keyAgreements, keyConcerns, newIdeasFromComments, engagementSummary } = aiCommentSummary;
    
    const renderList = (title: string, items: string[], icon: React.ReactNode) => {
      if (!items || items.length === 0) return null;
      return (
        <div>
          <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 flex items-center">{icon} {title}</h5>
          <ul className="list-disc list-inside pl-1 space-y-0.5">
            {items.map((item, idx) => <li key={idx} className="text-xs text-gray-500 dark:text-gray-400">{item}</li>)}
          </ul>
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        <p className="text-xs text-gray-700 dark:text-gray-200"><strong>Sentimento Geral:</strong> {overallSentiment}</p>
        {renderList("Pontos de Concordância:", keyAgreements, <ThumbsUp size={12} className="mr-1 text-green-600 dark:text-green-400"/>)}
        {renderList("Pontos de Preocupação:", keyConcerns, <ThumbsDown size={12} className="mr-1 text-red-600 dark:text-red-400"/>)}
        {renderList("Novas Ideias dos Comentários:", newIdeasFromComments, <Lightbulb size={12} className="mr-1 text-yellow-500 dark:text-yellow-400"/>)}
        <p className="text-xs text-gray-700 dark:text-gray-200"><strong>Resumo do Engajamento:</strong> {engagementSummary}</p>
      </div>
    );
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={suggestion.title}
      size="3xl" 
      footer={
        <Button variant="primary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-2">
        {/* Suggestion Info */}
        <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
             <div className="flex items-center">
                {suggestion.isAnonymous ? (
                <Zap size={14} className="mr-1.5 text-yellow-500 dark:text-yellow-400" />
                ) : (
                <User size={14} className="mr-1.5 text-blue-500 dark:text-sky-400" />
                )}
                <span className="font-medium text-gray-700 dark:text-gray-300">Autor:</span>
                <span className="ml-1">{suggestion.isAnonymous ? 'Anônimo' : (suggestion.authorId || 'Colaborador')}</span>
            </div>
            <div className="flex items-center">
                <ThumbsUp size={14} className="mr-1.5 text-green-500 dark:text-green-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Votos Positivos:</span>
                <span className="ml-1">{suggestion.upvotes}</span>
            </div>
            <div className="flex items-center">
                <ThumbsDown size={14} className="mr-1.5 text-red-500 dark:text-red-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Votos Negativos:</span>
                <span className="ml-1">{suggestion.downvotes}</span>
            </div>
            <div className="flex items-center">
                <Calendar size={14} className="mr-1.5 text-primary dark:text-sky-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Última Atualização:</span>
                <span className="ml-1">{formatDateToDisplay(suggestion.updatedAt)}</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Descrição Detalhada:</h4>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {suggestion.description}
              </p>
            </div>
          </div>
        </div>

        {/* AI Comment Summary Section */}
        <div className="space-y-2 py-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-2">
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                <Brain size={18} className="mr-2 text-sky-600 dark:text-sky-400" />
                Análise dos Comentários por IA ✨
                </h4>
                {comments.length > 0 && (
                    <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateAiSummary} 
                    disabled={isAiSummaryLoading}
                    loading={isAiSummaryLoading}
                    className="text-xs border-sky-500 text-sky-600 hover:bg-sky-100 dark:border-sky-600 dark:text-sky-400 dark:hover:bg-sky-700/50 self-start sm:self-center"
                    >
                    {isAiSummaryLoading ? 'Analisando...' : 'Gerar Análise com IA'}
                    </Button>
                )}
            </div>
            
            <div className="mt-1.5 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 min-h-[60px] flex flex-col justify-center">
              {isAiSummaryLoading && (
                <div className="flex items-center justify-center text-sm text-sky-600 dark:text-sky-400">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  A IA está processando os comentários...
                </div>
              )}
              {aiSummaryError && !isAiSummaryLoading && (
                <p className="text-sm text-red-700 dark:text-red-300">{aiSummaryError}</p>
              )}
              {!isAiSummaryLoading && !aiSummaryError && aiCommentSummary && renderAiSummaryDisplay()}
              {!isAiSummaryLoading && !aiSummaryError && !aiCommentSummary && comments.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                  Não há comentários para gerar uma análise.
                </p>
              )}
              {!isAiSummaryLoading && !aiSummaryError && !aiCommentSummary && comments.length > 0 && !process.env.API_KEY && (
                <p className="text-xs text-orange-600 dark:text-orange-400 italic text-center">
                  A análise por IA está desativada (chave de API não configurada).
                </p>
              )}
            </div>
        </div>


        {/* Comments Section */}
        <div className="space-y-4 pt-2">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <MessageSquare size={18} className="mr-2 text-primary dark:text-sky-400" />
            Comentários ({comments.length})
          </h4>

          {/* Add Comment Form */}
          <div className="p-3 bg-gray-100 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
            <Textarea
              label="Adicionar um comentário:"
              id="newCommentText"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              maxLength={1000}
              rows={3}
              error={commentError}
              className="text-sm bg-white dark:bg-gray-700"
              placeholder="Escreva seu comentário aqui..."
            />
            <Button
              onClick={handleAddComment}
              disabled={isSubmittingComment || !newCommentText.trim()}
              loading={isSubmittingComment}
              leftIcon={<Send size={16}/>}
              className="mt-2 w-full sm:w-auto"
            >
              {isSubmittingComment ? 'Enviando...' : 'Enviar Comentário'}
            </Button>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onSaveEdit={handleSaveCommentEdit}
                  onDelete={handleDeleteCommentRequest}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">
              Ainda não há comentários. Seja o primeiro a comentar!
            </p>
          )}
        </div>
      </div>

      {commentToDelete && (
        <ConfirmDeleteCommentModal
          isOpen={isConfirmDeleteCommentModalOpen}
          onClose={() => setIsConfirmDeleteCommentModalOpen(false)}
          onConfirm={confirmCommentDelete}
          commentTextSnippet={commentToDelete.text.substring(0, 100) + (commentToDelete.text.length > 100 ? '...' : '')}
        />
      )}
    </Modal>
  );
};

export default SuggestionDetailsModal;
