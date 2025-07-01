import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeletePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  policyName: string;
}

const ConfirmDeletePolicyModal: React.FC<ConfirmDeletePolicyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  policyName,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Exclusão de Política"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Excluir Política
          </Button>
        </>
      }
    >
      <div className="text-center py-2">
        <AlertTriangle size={48} className="mx-auto text-secondary dark:text-red-400 mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Tem certeza que deseja excluir permanentemente a política:
        </p>
        <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-4 break-words">"{policyName}"?</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Esta ação não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDeletePolicyModal;