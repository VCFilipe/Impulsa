
import React, { useState, useEffect } from 'react';
import { FAQ, PolicyCategory } from '../../types'; // PolicyCategory is reused for FAQ categories
import { POLICY_CATEGORIES } from '../../constants'; // Reused for categories
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Wand2, Loader2 } from 'lucide-react'; // Changed Brain to Wand2
import { GoogleGenAI } from "@google/genai";
import { useToast } from '../../contexts/ToastContext';

interface FAQFormProps {
  faqToEdit?: FAQ | null;
  onSubmit: (faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'> | FAQ) => void;
  onCancel: () => void;
}

const FAQForm: React.FC<FAQFormProps> = ({ faqToEdit, onSubmit, onCancel }) => {
  const initialFormState = {
    question: '',
    answer: '',
    category: POLICY_CATEGORIES[0], // Default to first category
  };

  const [formData, setFormData] = useState<Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isImprovingText, setIsImprovingText] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (faqToEdit) {
      setFormData({
        question: faqToEdit.question,
        answer: faqToEdit.answer,
        category: faqToEdit.category,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({}); // Clear errors when form opens or item changes
  }, [faqToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImproveWriting = async () => {
    if (!process.env.API_KEY) {
      addToast({ type: 'error', title: 'Erro de Configuração IA', message: 'A chave de API para IA não está configurada.' });
      return;
    }
    if (!formData.answer.trim()) {
      addToast({ type: 'info', title: 'Campo Vazio', message: 'Escreva uma resposta antes de usar a IA para melhorá-la.' });
      return;
    }

    setIsImprovingText(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
Você é um assistente de redação especializado em criar respostas claras, concisas e úteis para Perguntas Frequentes (FAQs) em um ambiente corporativo. Sua tarefa é refinar o texto da resposta a seguir.

Instruções importantes:
1.  **Preservação Total da Informação:** Mantenha ABSOLUTAMENTE TODAS as informações, detalhes e nuances presentes no texto original. Não omita nada.
2.  **Sem Novas Informações:** NÃO adicione nenhuma informação, fato ou detalhe que não esteja explicitamente no texto original.
3.  **Clareza, Concisão e Utilidade:** Melhore a estrutura das frases, a gramática e a escolha das palavras para aumentar a clareza, reduzir redundâncias ou ambiguidades, e garantir que a resposta seja o mais útil possível para o colaborador.
4.  **Tom Profissional e Acessível:** Mantenha um tom apropriado para um FAQ interno, buscando ser informativo, direto ao ponto e fácil de entender.
5.  **Formato:** Retorne apenas o texto refinado, sem introduções ou comentários adicionais seus. Se o texto original já estiver excelente e não necessitar de mudanças significativas, retorne o texto original.

Texto original da resposta a ser refinado:
---
${formData.answer}
---

Texto refinado da resposta:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
      });

      const improvedText = response.text;
      if (improvedText && improvedText.trim() && improvedText.trim() !== formData.answer.trim()) {
        setFormData(prev => ({ ...prev, answer: improvedText.trim() }));
        addToast({ type: 'success', title: 'Texto Melhorado!', message: 'A resposta foi refinada pela IA.' });
      } else {
        addToast({ type: 'info', title: 'Sem Mudanças Significativas', message: 'A IA considerou a resposta original adequada ou não sugeriu alterações relevantes.' });
      }
    } catch (error) {
      console.error("Error improving text with AI:", error);
      addToast({ type: 'error', title: 'Erro na IA', message: 'Não foi possível melhorar o texto da resposta. Tente novamente.' });
    } finally {
      setIsImprovingText(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.question.trim()) newErrors.question = 'Pergunta é obrigatória.';
    if (formData.question.trim().length > 300) newErrors.question = 'Pergunta não pode exceder 300 caracteres.';
    
    if (!formData.answer.trim()) newErrors.answer = 'Resposta é obrigatória.';
    if (formData.answer.trim().length > 5000) newErrors.answer = 'Resposta não pode exceder 5000 caracteres.';

    if (!formData.category) newErrors.category = 'Categoria é obrigatória.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (faqToEdit) {
        // Ensure all fields of FAQ are passed for update
        onSubmit({ ...formData, id: faqToEdit.id, createdAt: faqToEdit.createdAt, updatedAt: faqToEdit.updatedAt });
      } else {
        onSubmit(formData);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Textarea
        label="Pergunta"
        id="question"
        name="question"
        value={formData.question}
        onChange={handleChange}
        error={errors.question}
        maxLength={300}
        rows={3} 
        required
      />
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Resposta
            {true && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImproveWriting}
            disabled={isImprovingText || !formData.answer.trim()}
            className="text-xs px-2 py-1 text-primary dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-sky-400/10"
            title="Melhorar resposta com IA"
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
          label="" 
          id="answer"
          name="answer"
          value={formData.answer}
          onChange={handleChange}
          error={errors.answer}
          maxLength={5000}
          rows={8} 
          required
        />
      </div>
      <Select
        label="Categoria"
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={POLICY_CATEGORIES.map(cat => ({ value: cat, label: cat }))} 
        required
      />
      <div className="flex justify-end space-x-3 pt-4"> 
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {faqToEdit ? 'Salvar Alterações' : 'Criar FAQ'}
        </Button>
      </div>
    </form>
  );
};

export default FAQForm;
