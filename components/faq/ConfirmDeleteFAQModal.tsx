import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteFAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  faqQuestion: string; // Changed from policyName to faqQuestion
}

const ConfirmDeleteFAQModal: React.FC<ConfirmDeleteFAQModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  faqQuestion,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Exclusão de FAQ" // Updated title
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Excluir FAQ
          </Button>
        </>
      }
    >
      <div className="text-center py-2"> 
        <AlertTriangle size={48} className="mx-auto text-secondary dark:text-red-400 mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Tem certeza que deseja excluir permanentemente a pergunta frequente:
        </p>
        <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-4 break-words">"{faqQuestion}"?</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Esta ação não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteFAQModal;