import React, { useState, useEffect, useRef } from "react";
import { Policy, PolicyCategory, PolicyFile } from "../../types";
import { POLICY_CATEGORIES } from "../../constants";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { UploadCloud, Paperclip, X, Wand2, Loader2 } from "lucide-react"; // Changed Brain to Wand2
import { GoogleGenAI } from "@google/genai";
import { useToast } from "../../contexts/ToastContext";
import { GEMINI_API_KEY } from "@/config/envs";

interface PolicyFormProps {
  policyToEdit?: Policy | null;
  onSubmit: (
    policy: Omit<Policy, "id" | "createdAt" | "updatedAt"> | Policy
  ) => void;
  onCancel: () => void;
}

const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null || bytes === 0) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `(${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]})`;
};

const PolicyForm: React.FC<PolicyFormProps> = ({
  policyToEdit,
  onSubmit,
  onCancel,
}) => {
  const initialFormState = {
    title: "",
    description: "",
    category: POLICY_CATEGORIES[0],
    files: [] as PolicyFile[],
  };

  const [formData, setFormData] =
    useState<Omit<Policy, "id" | "createdAt" | "updatedAt">>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImprovingText, setIsImprovingText] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (policyToEdit) {
      setFormData({
        title: policyToEdit.title,
        description: policyToEdit.description,
        category: policyToEdit.category,
        files: [...policyToEdit.files],
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [policyToEdit]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newPolicyFiles: PolicyFile[] = Array.from(selectedFiles).map(
        (file) => ({
          id: `file-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          name: file.name,
          type: file.type || "unknown",
          size: file.size,
        })
      );

      setFormData((prev) => {
        const existingFileNames = new Set(prev.files.map((f) => f.name));
        const trulyNewFiles = newPolicyFiles.filter(
          (nf) => !existingFileNames.has(nf.name)
        );
        return { ...prev, files: [...prev.files, ...trulyNewFiles] };
      });

      if (errors.files) {
        setErrors((prev) => ({ ...prev, files: "" }));
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((file) => file.id !== fileIdToRemove),
    }));
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
Você é um assistente de redação especializado em clareza e concisão para documentos formais, como políticas internas. Sua tarefa é refinar o texto a seguir, tornando-o mais claro, objetivo e profissional.

Instruções importantes:
1.  **Preservação Total da Informação:** Mantenha ABSOLUTAMENTE TODAS as informações, detalhes e nuances presentes no texto original. Não omita nada.
2.  **Sem Novas Informações:** NÃO adicione nenhuma informação, fato ou detalhe que não esteja explicitamente no texto original.
3.  **Clareza e Concisão:** Melhore a estrutura das frases, a gramática e a escolha das palavras para aumentar a clareza e reduzir redundâncias ou ambiguidades.
4.  **Tom Profissional:** Mantenha um tom formal e apropriado para um documento de política empresarial.
5.  **Formato:** Retorne apenas o texto refinado, sem introduções ou comentários adicionais seus. Se o texto original já estiver excelente e não necessitar de mudanças significativas, retorne o texto original.

Texto original a ser refinado:
---
${formData.description}
---

Texto refinado:`;

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
          message: "A descrição foi refinada pela IA.",
        });
      } else {
        addToast({
          type: "info",
          title: "Sem Mudanças Significativas",
          message:
            "A IA considerou o texto original adequado ou não sugeriu alterações relevantes.",
        });
      }
    } catch (error) {
      console.error("Error improving text with AI:", error);
      addToast({
        type: "error",
        title: "Erro na IA",
        message: "Não foi possível melhorar o texto. Tente novamente.",
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
    if (!formData.category) newErrors.category = "Categoria é obrigatória.";
    if (formData.files.length > 10)
      newErrors.files = "Número máximo de 10 arquivos anexos atingido.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (policyToEdit) {
        onSubmit({
          ...formData,
          id: policyToEdit.id,
          createdAt: policyToEdit.createdAt,
          updatedAt: policyToEdit.updatedAt,
        });
      } else {
        onSubmit(formData);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Título da Política"
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
            Descrição Completa
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
          rows={5}
          required
        />
      </div>
      <Select
        label="Categoria"
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={POLICY_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
        required
      />

      <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
        <label
          htmlFor="file-upload-button"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Anexos
        </label>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          id="policy-file-input"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
        />
        <Button
          id="file-upload-button"
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          leftIcon={<UploadCloud size={16} />}
          className="w-full bg-white dark:bg-gray-600 dark:hover:bg-gray-500 dark:border-gray-500 dark:text-gray-200"
        >
          Selecionar Arquivos do Computador
        </Button>

        {errors.files && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.files}
          </p>
        )}

        {formData.files.length > 0 && (
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
            {formData.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-1.5 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-500 shadow-sm"
              >
                <div className="flex items-center truncate min-w-0">
                  <Paperclip
                    size={14}
                    className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0"
                  />
                  <span
                    className="text-gray-700 dark:text-gray-200 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <span className="text-gray-400 dark:text-gray-400 ml-1.5 text-xs flex-shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(file.id)}
                  className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 p-1 ml-2 flex-shrink-0"
                  aria-label={`Remover arquivo ${file.name}`}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {policyToEdit ? "Salvar Alterações" : "Criar Política"}
        </Button>
      </div>
    </form>
  );
};

export default PolicyForm;
