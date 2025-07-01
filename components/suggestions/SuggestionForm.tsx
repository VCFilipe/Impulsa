import React, { useState, useEffect } from "react";
import { Suggestion } from "../../types";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Switch from "../ui/Switch";
import Button from "../ui/Button";
import { Wand2, Loader2 } from "lucide-react"; // Changed Brain to Wand2
import { GoogleGenAI } from "@google/genai";
import { useToast } from "../../contexts/ToastContext";
import { GEMINI_API_KEY } from "@/config/envs";

interface SuggestionFormProps {
  suggestionToEdit?: Suggestion | null;
  onSubmit: (
    suggestion:
      | Omit<
          Suggestion,
          "id" | "upvotes" | "downvotes" | "createdAt" | "updatedAt"
        >
      | Suggestion
  ) => void;
  onCancel: () => void;
  initialData?: {
    title?: string;
    description?: string;
    isAnonymous?: boolean;
  };
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({
  suggestionToEdit,
  onSubmit,
  onCancel,
  initialData,
}) => {
  const getInitialFormState = () => ({
    title: initialData?.title || "",
    description: initialData?.description || "",
    isAnonymous:
      initialData?.isAnonymous === undefined ? false : initialData.isAnonymous,
  });

  const [formData, setFormData] = useState<
    Omit<
      Suggestion,
      "id" | "upvotes" | "downvotes" | "authorId" | "createdAt" | "updatedAt"
    >
  >(getInitialFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isImprovingText, setIsImprovingText] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (suggestionToEdit) {
      setFormData({
        title: suggestionToEdit.title,
        description: suggestionToEdit.description,
        isAnonymous: suggestionToEdit.isAnonymous,
      });
    } else {
      setFormData(getInitialFormState());
    }
    setErrors({});
  }, [suggestionToEdit, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSwitchChange = (name: "isAnonymous", checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImproveWriting = async () => {
    if (!GEMINI_API_KEY) {
      addToast({
        type: "error",
        title: "Erro de Configuração IA",
        message: "A chave de API para IA não está configurada.",
      });
      return;
    }
    if (!formData.description.trim()) {
      addToast({
        type: "info",
        title: "Campo Vazio",
        message: "Escreva uma descrição antes de usar a IA para melhorá-la.",
      });
      return;
    }

    setIsImprovingText(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const prompt = `
Você é um assistente de redação especializado em tornar sugestões corporativas mais claras, concisas, persuasivas e profissionais. Sua tarefa é refinar o texto da descrição da sugestão a seguir.

Instruções importantes:
1.  **Preservação Total da Informação:** Mantenha ABSOLUTAMENTE TODAS as informações, detalhes e nuances presentes no texto original. Não omita nada.
2.  **Sem Novas Informações:** NÃO adicione nenhuma informação, fato ou detalhe que não esteja explicitamente no texto original.
3.  **Clareza, Concisão e Persuasão:** Melhore a estrutura das frases, a gramática e a escolha das palavras para aumentar a clareza, reduzir redundâncias ou ambiguidades, e tornar a sugestão mais persuasiva.
4.  **Tom Profissional e Construtivo:** Mantenha um tom apropriado para uma sugestão em ambiente corporativo, buscando ser informativo, direto ao ponto e construtivo.
5.  **Formato:** Retorne apenas o texto refinado, sem introduções ou comentários adicionais seus. Se o texto original já estiver excelente e não necessitar de mudanças significativas, retorne o texto original.

Texto original da descrição da sugestão a ser refinado:
---
${formData.description}
---

Texto refinado da descrição da sugestão:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
      });

      const improvedText = response.text;
      if (
        improvedText &&
        improvedText.trim() &&
        improvedText.trim() !== formData.description.trim()
      ) {
        setFormData((prev) => ({ ...prev, description: improvedText.trim() }));
        addToast({
          type: "success",
          title: "Texto Melhorado!",
          message: "A descrição da sugestão foi refinada pela IA.",
        });
      } else {
        addToast({
          type: "info",
          title: "Sem Mudanças Significativas",
          message:
            "A IA considerou a descrição original adequada ou não sugeriu alterações relevantes.",
        });
      }
    } catch (error) {
      console.error("Error improving text with AI:", error);
      addToast({
        type: "error",
        title: "Erro na IA",
        message:
          "Não foi possível melhorar o texto da descrição. Tente novamente.",
      });
    } finally {
      setIsImprovingText(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Título é obrigatório.";
    if (formData.title.trim().length > 150)
      newErrors.title = "Título não pode exceder 150 caracteres.";

    if (!formData.description.trim())
      newErrors.description = "Descrição é obrigatória.";
    if (formData.description.trim().length > 2000)
      newErrors.description = "Descrição não pode exceder 2000 caracteres.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submissionData: Omit<
        Suggestion,
        "id" | "upvotes" | "downvotes" | "createdAt" | "updatedAt" | "authorId"
      > & { authorId?: string } = {
        ...formData,
      };
      if (!formData.isAnonymous) {
        submissionData.authorId = "mockAuthorUser";
      }

      if (suggestionToEdit) {
        onSubmit({
          ...submissionData,
          id: suggestionToEdit.id,
          upvotes: suggestionToEdit.upvotes,
          downvotes: suggestionToEdit.downvotes,
          createdAt: suggestionToEdit.createdAt,
          updatedAt: suggestionToEdit.updatedAt,
          authorId: formData.isAnonymous
            ? undefined
            : suggestionToEdit.authorId || "mockAuthorUser",
        });
      } else {
        onSubmit(submissionData);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Título da Sugestão"
        id="title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        maxLength={150}
        required
      />
      <div>
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Descrição Detalhada da Sugestão
            {true && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImproveWriting}
            disabled={isImprovingText || !formData.description.trim()}
            className="text-xs px-2 py-1 text-primary dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-sky-400/10"
            title="Melhorar descrição com IA"
          >
            {isImprovingText ? (
              <Loader2 size={14} className="animate-spin mr-1.5" />
            ) : (
              <Wand2 size={14} className="mr-1.5" />
            )}
            Melhorar
          </Button>
        </div>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          maxLength={2000}
          rows={6}
          required
        />
      </div>

      <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
        <Switch
          id="isAnonymous"
          label="Postar anonimamente?"
          checked={formData.isAnonymous}
          onChange={(checked) => handleSwitchChange("isAnonymous", checked)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formData.isAnonymous
            ? "Sua identidade não será exibida publicamente com esta sugestão."
            : "Seu nome (simulado) poderá ser exibido com esta sugestão."}
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {suggestionToEdit ? "Salvar Alterações" : "Enviar Sugestão"}
        </Button>
      </div>
    </form>
  );
};

export default SuggestionForm;
