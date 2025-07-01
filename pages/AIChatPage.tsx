import React, { useState, useEffect, useCallback, useRef } from "react";
import { AIPrompt, ChatMessage } from "../types";
import * as aiPromptService from "../services/aiPromptService";
import { GoogleGenAI, Chat } from "@google/genai";
import { useToast } from "../contexts/ToastContext";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import {
  Sparkles,
  MessageSquare,
  ClipboardList,
  User,
  Send,
  Loader2,
  Trash2,
} from "lucide-react";
import { GEMINI_API_KEY } from "@/config/envs";

// --- Local Storage Service ---
const CHAT_HISTORY_STORAGE_KEY = "aiChatHistory";

const getAllHistories = (): Record<string, ChatMessage[]> => {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to parse chat history from localStorage", e);
    return {};
  }
};

const saveChatHistory = (agentId: string, messages: ChatMessage[]): void => {
  try {
    const allHistories = getAllHistories();
    allHistories[agentId] = messages;
    localStorage.setItem(
      CHAT_HISTORY_STORAGE_KEY,
      JSON.stringify(allHistories)
    );
  } catch (e) {
    console.error("Failed to save chat history to localStorage", e);
  }
};

const getChatHistory = (agentId: string): ChatMessage[] => {
  return getAllHistories()[agentId] || [];
};

const clearChatHistory = (agentId: string): void => {
  try {
    const allHistories = getAllHistories();
    delete allHistories[agentId];
    localStorage.setItem(
      CHAT_HISTORY_STORAGE_KEY,
      JSON.stringify(allHistories)
    );
  } catch (e) {
    console.error("Failed to clear chat history from localStorage", e);
  }
};

// --- Helper & Sub-Components ---

const toGeminiHistory = (messages: ChatMessage[]) => {
  return messages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));
};

interface AgentSelectorProps {
  prompts: AIPrompt[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  isLoading: boolean;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
  prompts,
  selectedAgentId,
  onSelectAgent,
  isLoading,
}) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700/50 flex flex-col h-full">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
        <Sparkles size={20} className="mr-2 text-primary dark:text-sky-400" />
        Selecione um Agente
      </h2>
    </div>
    <div className="flex-grow overflow-y-auto">
      <nav className="p-2 space-y-1">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelectAgent(prompt.id)}
            disabled={isLoading}
            className={`w-full flex items-start text-left p-2 rounded-md transition-colors duration-150 ${
              selectedAgentId === prompt.id
                ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
            } ${isLoading ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <ClipboardList
              size={20}
              className="mr-3 mt-1 flex-shrink-0 text-gray-400 dark:text-gray-500"
            />
            <div className="flex-grow">
              <p className="text-sm font-medium">{prompt.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {prompt.description}
              </p>
            </div>
          </button>
        ))}
      </nav>
    </div>
  </div>
);

const ChatWelcome: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-8">
    <MessageSquare
      size={64}
      className="mb-4 text-gray-300 dark:text-gray-600"
    />
    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
      Bem-vindo ao Chat IA
    </h2>
    <p className="mt-2 max-w-md">
      Selecione um agente na barra lateral para iniciar uma conversa. Cada
      agente é especializado em uma tarefa diferente.
    </p>
    <div className="mt-6 flex items-center text-sm text-primary dark:text-sky-400">
      <Sparkles size={18} className="mr-2" />
      <span>Potencializado por Gemini</span>
    </div>
  </div>
);

interface ChatMessageViewProps {
  message: ChatMessage;
}

const ChatMessageView: React.FC<ChatMessageViewProps> = ({ message }) => {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-600">
          <Sparkles className="h-4 w-4 text-primary dark:text-sky-400" />
        </div>
      )}
      <div
        className={`flex flex-col gap-1 max-w-xl ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`p-3 rounded-lg whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-white dark:bg-sky-600 dark:text-sky-50 rounded-br-none"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-none"
          }`}
        >
          <p className="text-sm font-normal">{message.text}</p>
        </div>
        <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      {isUser && (
        <div className="flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 bg-primary/80 dark:bg-sky-700">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSendMessage,
  isLoading,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) onSendMessage();
    }
  };
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
      <div className="flex items-center space-x-3">
        <Textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem aqui... (Shift+Enter para nova linha)"
          rows={1}
          disabled={isLoading}
          className="flex-grow resize-none max-h-40 overflow-y-auto !py-2 bg-white dark:bg-gray-700"
        />
        <Button
          onClick={onSendMessage}
          disabled={isLoading || !input.trim()}
          className="self-end"
          aria-label="Enviar mensagem"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </Button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const AIChatPage: React.FC = () => {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<Record<string, Chat | null>>(
    {}
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrompts(aiPromptService.getAIPrompts());
  }, []);

  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
  }, [chatMessages, isLoading]);

  const selectedAgent = prompts.find((p) => p.id === selectedAgentId);

  const getOrCreateChatSession = useCallback(
    (agentId: string): Chat => {
      if (chatSessions[agentId]) return chatSessions[agentId]!;

      const agentPrompt = prompts.find((p) => p.id === agentId);
      if (!agentPrompt) throw new Error("Agente não encontrado");

      console.log(import.meta.env.GEMINI_API_KEY);

      if (!GEMINI_API_KEY) {
        addToast({
          type: "error",
          title: "Erro de Configuração",
          message: "A chave de API para IA não está configurada.",
        });
        throw new Error("Chave de API não configurada");
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const history = getChatHistory(agentId);

      const chat = ai.chats.create({
        model: "gemini-2.5-flash-preview-04-17",
        history: toGeminiHistory(history),
        config: { systemInstruction: agentPrompt.promptText },
      });

      setChatSessions((prev) => ({ ...prev, [agentId]: chat }));
      return chat;
    },
    [prompts, chatSessions, addToast]
  );

  const handleSelectAgent = useCallback(
    (agentId: string) => {
      if (isLoading) return;
      setSelectedAgentId(agentId);
      setChatMessages(getChatHistory(agentId));
    },
    [isLoading]
  );

  const handleSendMessage = async () => {
    console.log("entrou aqui");
    if (!currentInput.trim() || !selectedAgentId || isLoading) return;

    console.log(import.meta.env.VITE_GEMINI_API_KEY, "entrou aqui");

    const userMessage: ChatMessage = {
      role: "user",
      text: currentInput.trim(),
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    const tempInput = currentInput;
    setCurrentInput("");
    setIsLoading(true);

    try {
      const chat = getOrCreateChatSession(selectedAgentId);
      const response = await chat.sendMessage({ message: userMessage.text });

      const modelMessage: ChatMessage = {
        role: "model",
        text: response.text,
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updatedMessages, modelMessage];
      setChatMessages(finalMessages);
      saveChatHistory(selectedAgentId, finalMessages);
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      addToast({
        type: "error",
        title: "Erro na IA",
        message: "Não foi possível obter uma resposta. Tente novamente.",
      });
      setChatMessages(updatedMessages.slice(0, -1)); // Revert user message on error
      setCurrentInput(tempInput); // Restore user input
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (
      selectedAgentId &&
      window.confirm(
        `Tem certeza que deseja apagar o histórico de conversa com "${selectedAgent?.title}"?`
      )
    ) {
      clearChatHistory(selectedAgentId);
      setChatMessages([]);
      setChatSessions((prev) => ({ ...prev, [selectedAgentId]: null }));
      addToast({
        type: "info",
        title: "Histórico Limpo",
        message: `A conversa com ${selectedAgent?.title} foi apagada.`,
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-[calc(100vh-6.5rem)] bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Adicionar menu suspenso para mobile */}
      <div className="sm:hidden p-2 border-b dark:border-gray-700">
        <select
          value={selectedAgentId || ""}
          onChange={(e) => handleSelectAgent(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          aria-label="Selecionar Agente"
        >
          <option value="" disabled>
            Selecione um agente...
          </option>
          {prompts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      <div className="w-1/3 min-w-[280px] max-w-[350px] h-full hidden sm:block">
        <AgentSelector
          prompts={prompts}
          selectedAgentId={selectedAgentId}
          onSelectAgent={handleSelectAgent}
          isLoading={isLoading}
        />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {!selectedAgentId ? (
          <ChatWelcome />
        ) : (
          <>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate pr-2">
                {selectedAgent?.title || "Chat"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                disabled={isLoading || chatMessages.length === 0}
                title="Limpar histórico da conversa"
              >
                <Trash2 size={16} className="mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Limpar</span>
              </Button>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {chatMessages.map((msg, index) => (
                <ChatMessageView key={index} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2.5 max-w-xl">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 bg-gray-200 dark:bg-gray-600">
                      <Sparkles className="h-4 w-4 text-primary dark:text-sky-400" />
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 rounded-bl-none">
                      <div className="flex items-center space-x-1.5">
                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ChatInput
              input={currentInput}
              setInput={setCurrentInput}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AIChatPage;
