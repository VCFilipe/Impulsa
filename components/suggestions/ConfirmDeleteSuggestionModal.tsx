import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  suggestionTitle: string;
}

const ConfirmDeleteSuggestionModal: React.FC<ConfirmDeleteSuggestionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  suggestionTitle,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Exclusão de Sugestão"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Excluir Sugestão
          </Button>
        </>
      }
    >
      <div className="text-center py-2"> 
        <AlertTriangle size={48} className="mx-auto text-secondary dark:text-red-400 mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Tem certeza que deseja excluir permanentemente a sugestão:
        </p>
        <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-4 break-words">"{suggestionTitle}"?</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Esta ação não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteSuggestionModal;