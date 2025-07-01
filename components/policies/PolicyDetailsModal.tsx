
import React from 'react';
import { Policy } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatDateToDisplay } from '../../utils/dateUtils';
import { Tag, Calendar } from 'lucide-react';

interface PolicyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
}

const PolicyDetailsModal: React.FC<PolicyDetailsModalProps> = ({ isOpen, onClose, policy }) => {
  if (!isOpen || !policy) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={policy.title}
      size="2xl" // Changed from lg to 2xl
      footer={
        <Button variant="primary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Tag size={14} className="mr-1.5 text-primary dark:text-sky-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Categoria:</span>
            <span className="ml-1">{policy.category}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={14} className="mr-1.5 text-primary dark:text-sky-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Última Atualização:</span>
            <span className="ml-1">{formatDateToDisplay(policy.updatedAt)}</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Descrição Completa:</h4>
          <div className="max-h-[60vh] overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {policy.description}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PolicyDetailsModal;