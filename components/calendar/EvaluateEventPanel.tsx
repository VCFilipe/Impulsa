import React, { useState, useEffect } from 'react';
import { Event } from '../../types';
import SidePanel from '../ui/SidePanel';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import StarRatingInput from '../ui/StarRatingInput'; 
import { formatDateToDisplay } from '../../utils/dateUtils';

interface EvaluateEventPanelProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSubmit: (evaluationData: { eventId: string, orgRating: number, contentRating: number, comment: string }) => void;
}

const EvaluateEventPanel: React.FC<EvaluateEventPanelProps> = ({ isOpen, onClose, event, onSubmit }) => {
  const [orgRating, setOrgRating] = useState<number>(0); 
  const [contentRating, setContentRating] = useState<number>(0); 
  const [comment, setComment] = useState<string>('');
  const [errors, setErrors] = useState<{ orgRating?: string; contentRating?: string; comment?: string }>({});

  const resetForm = () => {
    setOrgRating(0);
    setContentRating(0);
    setComment('');
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) {
        resetForm();
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: { orgRating?: string; contentRating?: string; comment?: string } = {};
    if (orgRating === 0) {
      newErrors.orgRating = 'Avaliação da organização é obrigatória (1-5 estrelas).';
    }
    if (contentRating === 0) {
      newErrors.contentRating = 'Avaliação do conteúdo é obrigatória (1-5 estrelas).';
    }
    // Comment is now optional
    if (comment.trim().length > 500) { // Still validate max length if comment is provided
      newErrors.comment = 'Comentário não pode exceder 500 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        eventId: event.id,
        orgRating: orgRating, 
        contentRating: contentRating, 
        comment: comment.trim(),
      });
      // Resetting form is handled by useEffect on isOpen or by onClose logic
    }
  };
  
  const handlePanelClose = () => {
    resetForm(); // Ensure form is reset when closed manually
    onClose();
  };

  return (
    <SidePanel isOpen={isOpen} onClose={handlePanelClose} title="Avaliar Evento">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{event.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDateToDisplay(event.date)} às {event.time}
          </p>
        </div>

        <StarRatingInput
          id="orgRating"
          label="Como você avalia a organização do evento?"
          rating={orgRating}
          onRatingChange={(newRating) => {
            setOrgRating(newRating);
            if(errors.orgRating) setErrors(prev => ({...prev, orgRating: undefined}));
          }}
          error={errors.orgRating}
          required
        />

        <StarRatingInput
          id="contentRating"
          label="Como você avalia o conteúdo do evento?"
          rating={contentRating}
          onRatingChange={(newRating) => {
            setContentRating(newRating);
            if(errors.contentRating) setErrors(prev => ({...prev, contentRating: undefined}));
          }}
          error={errors.contentRating}
          required
        />

        <Textarea
          label="Deixe um comentário sobre o evento (Opcional)"
          id="comment"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
             if(errors.comment) setErrors(prev => ({...prev, comment: undefined}));
          }}
          error={errors.comment}
          maxLength={500} // Keep maxLength for UI guidance
          rows={3}
          // removed required prop
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={handlePanelClose}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit}>
            Salvar Avaliação
          </Button>
        </div>
      </div>
    </SidePanel>
  );
};

export default EvaluateEventPanel;