import React, { useState, useEffect, useRef } from "react";
import { Announcement, AnnouncementCategory } from "../../types";
import { ANNOUNCEMENT_CATEGORIES } from "../../constants";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import Switch from "../ui/Switch";
import Button from "../ui/Button";
import { UploadCloud, Wand2, Loader2, ImagePlus, X } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { useToast } from "../../contexts/ToastContext";
import { GEMINI_API_KEY } from "@/config/envs";

interface AnnouncementFormProps {
  announcementToEdit?: Announcement | null;
  onSubmit: (
    announcement:
      | Omit<
          Announcement,
          "id" | "createdAt" | "updatedAt" | "authorId" | "authorName"
        >
      | Announcement
  ) => void;
  onCancel: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  announcementToEdit,
  onSubmit,
  onCancel,
}) => {
  const initialFormState = {
    title: "",
    content: "",
    category: ANNOUNCEMENT_CATEGORIES[0],
    isPinned: false,
    imageUrl: "",
    isRead: false, // Added isRead to initial state
  };

  const [formData, setFormData] =
    useState<
      Omit<
        Announcement,
        "id" | "createdAt" | "updatedAt" | "authorId" | "authorName"
      >
    >(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isImprovingContent, setIsImprovingContent] = useState(false);
  const { addToast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (announcementToEdit) {
      setFormData({
        title: announcementToEdit.title,
        content: announcementToEdit.content,
        category: announcementToEdit.category,
        isPinned: announcementToEdit.isPinned,
        imageUrl: announcementToEdit.imageUrl || "",
        isRead: announcementToEdit.isRead, // Set isRead from announcementToEdit
      });
      if (announcementToEdit.imageUrl) {
        setImagePreview(announcementToEdit.imageUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData(initialFormState);
      setImagePreview(null);
    }
    setErrors({});
  }, [announcementToEdit]);

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

  const handleSwitchChange = (name: "isPinned", checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        addToast({
          type: "error",
          title: "Arquivo Grande",
          message: "A imagem não pode exceder 2MB.",
        });
        if (imageInputRef.current) imageInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData((prev) => ({ ...prev, imageUrl: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = ""; // Reset file input
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // --- IA Features ---
  const handleImproveContent = async () => {
    if (!GEMINI_API_KEY) {
      addToast({
        type: "error",
        title: "Erro de Configuração IA",
        message: "A chave de API para IA não está configurada.",
      });
      return;
    }
    if (!formData.content.trim()) {
      addToast({
        type: "info",
        title: "Campo Vazio",
        message: "Escreva o conteúdo antes de usar a IA para melhorá-lo.",
      });
      return;
    }
    setIsImprovingContent(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const prompt = `Você é um assistente de redação especializado em comunicados internos corporativos. Refine o texto a seguir para torná-lo mais claro, conciso, profissional e engajador, mantendo todas as informações originais e sem adicionar novas. Se o texto já estiver excelente, retorne o original.
Texto original:
---
${formData.content}
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
        improvedText.trim() !== formData.content.trim()
      ) {
        setFormData((prev) => ({ ...prev, content: improvedText.trim() }));
        addToast({
          type: "success",
          title: "Conteúdo Melhorado!",
          message: "O conteúdo foi refinado pela IA.",
        });
      } else {
        addToast({
          type: "info",
          title: "Sem Mudanças Significativas",
          message: "A IA considerou o conteúdo original adequado.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erro na IA",
        message: "Não foi possível melhorar o conteúdo.",
      });
    } finally {
      setIsImprovingContent(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Título é obrigatório.";
    if (formData.title.trim().length > 150)
      newErrors.title = "Título não pode exceder 150 caracteres.";

    if (!formData.content.trim()) newErrors.content = "Conteúdo é obrigatório.";
    if (formData.content.trim().length > 10000)
      newErrors.content = "Conteúdo não pode exceder 10000 caracteres.";

    if (!formData.category) newErrors.category = "Categoria é obrigatória.";

    if (
      formData.imageUrl &&
      !formData.imageUrl.startsWith("data:image/") &&
      !formData.imageUrl.startsWith("http")
    ) {
      newErrors.imageUrl = "URL da imagem parece inválida.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // The formData passed to onSubmit will now include `isRead`
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Título do Comunicado
            {true && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        </div>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          maxLength={150}
          required
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Conteúdo Completo
            {true && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImproveContent}
            disabled={isImprovingContent || !formData.content.trim()}
            className="text-xs px-2 py-1 text-primary dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-sky-400/10"
            title="Melhorar conteúdo com IA"
          >
            {isImprovingContent ? (
              <Loader2 size={14} className="animate-spin mr-1.5" />
            ) : (
              <Wand2 size={14} className="mr-1.5" />
            )}
            Melhorar
          </Button>
        </div>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          error={errors.content}
          maxLength={10000}
          rows={8}
          required
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Categoria
            {true && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        </div>
        <Select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={ANNOUNCEMENT_CATEGORIES.map((cat) => ({
            value: cat,
            label: cat,
          }))}
          error={errors.category}
          required
        />
      </div>

      <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Imagem de Destaque (Opcional)
        </label>
        {imagePreview && (
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview do comunicado"
              className="w-full h-40 object-cover rounded-md border border-gray-300 dark:border-gray-500"
            />
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-1.5 right-1.5 p-1 opacity-75 group-hover:opacity-100"
              aria-label="Remover imagem"
            >
              <X size={16} />
            </Button>
          </div>
        )}
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageFileSelect}
          className="hidden"
          id="announcement-image-input"
          accept="image/png, image/jpeg, image/gif, image/webp"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => imageInputRef.current?.click()}
          leftIcon={<ImagePlus size={16} />}
          className="w-full bg-white dark:bg-gray-600 dark:hover:bg-gray-500 dark:border-gray-500 dark:text-gray-200"
        >
          {imagePreview ? "Alterar Imagem" : "Selecionar Imagem"}
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tamanho máximo: 2MB. Formatos: JPG, PNG, GIF, WebP.
        </p>
        {errors.imageUrl && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {errors.imageUrl}
          </p>
        )}

        <Input
          label="Ou cole uma URL da imagem (Opcional)"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          error={errors.imageUrl}
          placeholder="https://exemplo.com/imagem.jpg"
          disabled={!!imagePreview && formData.imageUrl === imagePreview}
        />
        {imagePreview && formData.imageUrl === imagePreview && (
          <p className="text-xs text-orange-500 dark:text-orange-400">
            Para usar URL, remova a imagem local selecionada acima.
          </p>
        )}
      </div>

      <Switch
        id="isPinned"
        label="Fixar este comunicado no topo?"
        checked={formData.isPinned}
        onChange={(checked) => handleSwitchChange("isPinned", checked)}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {announcementToEdit ? "Salvar Alterações" : "Publicar Comunicado"}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
