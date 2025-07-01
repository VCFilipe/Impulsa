
import React, { useState, useEffect } from 'react';
import { Event, EventCategory, EventType } from '../../types';
import { EVENT_CATEGORIES, EVENT_TYPES } from '../../constants';
import { formatDateForStorage, parseDisplayDate, formatDateToDisplay } from '../../utils/dateUtils';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Switch from '../ui/Switch';
import Button from '../ui/Button';
import { Wand2, Loader2 } from 'lucide-react'; // Changed Brain to Wand2
import { GoogleGenAI } from "@google/genai";
import { useToast } from '../../contexts/ToastContext';

interface EventFormProps {
  eventToEdit?: Event | null;
  defaultDate?: string; // Nova prop para data padrão
  onSubmit: (event: Omit<Event, 'id'> | Event) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ eventToEdit, defaultDate, onSubmit, onCancel }) => {
  const getInitialFormState = () => ({
    title: '',
    description: '',
    date: defaultDate || formatDateForStorage(new Date()), // Usa defaultDate se fornecido
    time: '09:00',
    category: EventCategory.REUNIAO,
    type: EventType.EVENTO,
    isEvaluable: false,
    requiresAttendance: false,
  });

  const [formData, setFormData] = useState<Omit<Event, 'id'>>(getInitialFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isImprovingText, setIsImprovingText] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title,
        description: eventToEdit.description,
        date: eventToEdit.date, // Espera YYYY-MM-DD
        time: eventToEdit.time,
        category: eventToEdit.category,
        type: eventToEdit.type,
        isEvaluable: eventToEdit.type === EventType.EVENTO ? eventToEdit.isEvaluable : false,
        requiresAttendance: eventToEdit.type === EventType.EVENTO ? eventToEdit.requiresAttendance : false,
      });
    } else {
      // Reseta para o estado inicial, considerando que defaultDate pode mudar
      setFormData(getInitialFormState());
    }
    setErrors({}); // Clear errors when form opens or item changes
  }, [eventToEdit, defaultDate]); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // value é YYYY-MM-DD de <input type="date">
    setFormData(prev => ({ ...prev, [name]: value }));
     if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const handleSwitchChange = (name: 'isEvaluable' | 'requiresAttendance', checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as EventType;
    setFormData(prev => ({
      ...prev,
      type: newType,
      isEvaluable: newType === EventType.EVENTO ? prev.isEvaluable : false,
      requiresAttendance: newType === EventType.EVENTO ? prev.requiresAttendance : false,
    }));
  };

  const handleImproveWriting = async () => {
    if (!process.env.API_KEY) {
      addToast({ type: 'error', title: 'Erro de Configuração IA', message: 'A chave de API para IA não está configurada.' });
      return;
    }
    if (!formData.description.trim()) {
      addToast({ type: 'info', title: 'Campo Vazio', message: 'Escreva uma descrição antes de usar a IA para melhorá-la.' });
      return;
    }

    setIsImprovingText(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
Você é um assistente de redação especializado em clareza e concisão para descrições de eventos corporativos. Sua tarefa é refinar o texto a seguir, tornando-o mais claro, objetivo, profissional e convidativo.

Instruções importantes:
1.  **Preservação Total da Informação:** Mantenha ABSOLUTAMENTE TODAS as informações, detalhes e nuances presentes no texto original. Não omita nada.
2.  **Sem Novas Informações:** NÃO adicione nenhuma informação, fato ou detalhe que não esteja explicitamente no texto original.
3.  **Clareza e Concisão:** Melhore a estrutura das frases, a gramática e a escolha das palavras para aumentar a clareza e reduzir redundâncias ou ambiguidades.
4.  **Tom Profissional e Convidativo:** Mantenha um tom apropriado para um evento corporativo, buscando ser informativo e, quando aplicável, engajador.
5.  **Formato:** Retorne apenas o texto refinado, sem introduções ou comentários adicionais seus. Se o texto original já estiver excelente e não necessitar de mudanças significativas, retorne o texto original.

Texto original a ser refinado:
---
${formData.description}
---

Texto refinado:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
      });

      const improvedText = response.text;
      if (improvedText && improvedText.trim() && improvedText.trim() !== formData.description.trim()) {
        setFormData(prev => ({ ...prev, description: improvedText.trim() }));
        addToast({ type: 'success', title: 'Texto Melhorado!', message: 'A descrição foi refinada pela IA.' });
      } else {
        addToast({ type: 'info', title: 'Sem Mudanças Significativas', message: 'A IA considerou o texto original adequado ou não sugeriu alterações relevantes.' });
      }
    } catch (error) {
      console.error("Error improving text with AI:", error);
      addToast({ type: 'error', title: 'Erro na IA', message: 'Não foi possível melhorar o texto. Tente novamente.' });
    } finally {
      setIsImprovingText(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório.';
    if (formData.title.trim().length > 100) newErrors.title = 'Título não pode exceder 100 caracteres.';
    
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória.';
    if (formData.description.trim().length > 1000) newErrors.description = 'Descrição não pode exceder 1000 caracteres.';

    if (!formData.date) newErrors.date = 'Data é obrigatória.';
    if (!formData.time) newErrors.time = 'Horário é obrigatório.';
    else if (!/^\d{2}:\d{2}$/.test(formData.time)) newErrors.time = 'Formato de horário inválido (HH:MM).';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (eventToEdit) {
        onSubmit({ ...formData, id: eventToEdit.id });
      } else {
        onSubmit(formData);
      }
    }
  };
  
  const isEventoType = formData.type === EventType.EVENTO;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Título do Evento"
        id="title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        maxLength={100}
        required
      />
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Descrição
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
          maxLength={1000}
          rows={5}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Data"
          id="date"
          name="date"
          type="date" 
          value={formData.date}
          onChange={handleDateChange}
          error={errors.date}
          required
          className="dark:[color-scheme:dark]" 
        />
        <Input
          label="Horário"
          id="time"
          name="time"
          type="time"
          value={formData.time}
          onChange={handleChange}
          error={errors.time}
          required
          className="dark:[color-scheme:dark]" 
        />
      </div>
      <Select
        label="Categoria"
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={EVENT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
        required
      />
      <Select
        label="Tipo"
        id="type"
        name="type"
        value={formData.type}
        onChange={handleTypeChange}
        options={EVENT_TYPES.map(type => ({ value: type, label: type }))}
        required
      />
      
      <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
        <Switch
          id="isEvaluable"
          label="Evento Avaliável?"
          checked={formData.isEvaluable}
          onChange={(checked) => handleSwitchChange('isEvaluable', checked)}
          disabled={!isEventoType}
        />
        <Switch
          id="requiresAttendance"
          label="Exige presença?"
          checked={formData.requiresAttendance}
          onChange={(checked) => handleSwitchChange('requiresAttendance', checked)}
          disabled={!isEventoType}
        />
        {!isEventoType && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Opções de "Avaliável" e "Exige presença" são aplicáveis apenas para o tipo "Evento".</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {eventToEdit ? 'Salvar Alterações' : 'Criar Evento'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
