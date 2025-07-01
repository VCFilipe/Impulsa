
import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  commentTextSnippet: string;
}

const ConfirmDeleteCommentModal: React.FC<ConfirmDeleteCommentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  commentTextSnippet,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Exclusão de Comentário"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Excluir Comentário
          </Button>
        </>
      }
    >
      <div className="text-center py-2">
        <AlertTriangle size={48} className="mx-auto text-secondary dark:text-red-400 mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Tem certeza que deseja excluir permanentemente o comentário:
        </p>
        <p className="font-medium text-gray-700 dark:text-gray-200 text-md mb-4 italic bg-gray-100 dark:bg-gray-700 p-2 rounded break-words line-clamp-3">
          "{commentTextSnippet}"?
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Esta ação não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteCommentModal;
