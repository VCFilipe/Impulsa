
import React, { useState, useEffect } from 'react';
import { AIPrompt } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Select from '../ui/Select'; // Importar Select
import { AI_PROMPT_USE_CASES } from '../../constants'; // Importar casos de uso predefinidos

interface AIPromptFormProps {
  promptToEdit?: AIPrompt | null;
  onSubmit: (prompt: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'> | AIPrompt) => void;
  onCancel: () => void;
  initialData?: Partial<Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>>; // Para preenchimento via IA
}

const AIPromptForm: React.FC<AIPromptFormProps> = ({ promptToEdit, onSubmit, onCancel, initialData }) => {
  const getInitialFormState = () => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    useCase: initialData?.useCase || (AI_PROMPT_USE_CASES.length > 0 ? AI_PROMPT_USE_CASES[0] : ''),
    promptText: initialData?.promptText || '',
  });

  const [formData, setFormData] = useState<Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>>(getInitialFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (promptToEdit) {
      setFormData({
        title: promptToEdit.title,
        description: promptToEdit.description,
        useCase: promptToEdit.useCase,
        promptText: promptToEdit.promptText,
      });
    } else if (initialData) {
      setFormData(getInitialFormState()); // Utiliza initialData se não estiver editando
    }
    else {
      // Reset para o estado inicial padrão (campos vazios, primeiro caso de uso)
       setFormData({
        title: '',
        description: '',
        useCase: AI_PROMPT_USE_CASES.length > 0 ? AI_PROMPT_USE_CASES[0] : '',
        promptText: '',
      });
    }
    setErrors({});
  }, [promptToEdit, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório.';
    if (formData.title.trim().length > 150) newErrors.title = 'Título não pode exceder 150 caracteres.';
    
    if (!formData.useCase.trim()) newErrors.useCase = 'Caso de uso é obrigatório.';
    // Validação de tamanho para useCase não é mais necessária se for select, mas manter se ainda houver chance de entrada manual em algum cenário futuro.
    // if (formData.useCase.trim().length > 100) newErrors.useCase = 'Caso de uso não pode exceder 100 caracteres.';

    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória.';
    if (formData.description.trim().length > 500) newErrors.description = 'Descrição não pode exceder 500 caracteres.';
    
    if (!formData.promptText.trim()) newErrors.promptText = 'Texto do prompt é obrigatório.';
    if (formData.promptText.trim().length > 10000) newErrors.promptText = 'Texto do prompt não pode exceder 10000 caracteres.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (promptToEdit) {
        onSubmit({ ...formData, id: promptToEdit.id, createdAt: promptToEdit.createdAt, updatedAt: promptToEdit.updatedAt });
      } else {
        onSubmit(formData);
      }
    }
  };

  const useCaseOptions = AI_PROMPT_USE_CASES.map(uc => ({ value: uc, label: uc }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Título do Prompt"
        id="title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        maxLength={150}
        required
        placeholder="Ex: Resumir E-mail Longo"
      />
      <Select
        label="Caso de Uso"
        id="useCase"
        name="useCase"
        value={formData.useCase}
        onChange={handleChange}
        error={errors.useCase}
        options={useCaseOptions}
        required
      />
      <Textarea
        label="Descrição Curta do Prompt"
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        maxLength={500}
        rows={3}
        required
        placeholder="Explique brevemente o que o prompt faz e para que serve."
      />
      <Textarea
        label="Texto do Prompt (Para LLM)"
        id="promptText"
        name="promptText"
        value={formData.promptText}
        onChange={handleChange}
        error={errors.promptText}
        maxLength={10000}
        rows={10}
        required
        placeholder="Cole ou escreva aqui o prompt completo que será usado pela IA."
        className="font-mono text-sm"
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {promptToEdit ? 'Salvar Alterações' : 'Criar Prompt'}
        </Button>
      </div>
    </form>
  );
};

export default AIPromptForm;