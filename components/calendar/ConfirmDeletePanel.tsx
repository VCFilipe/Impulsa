import React from 'react';
import SidePanel from '../ui/SidePanel';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeletePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
}

const ConfirmDeletePanel: React.FC<ConfirmDeletePanelProps> = ({ isOpen, onClose, onConfirm, eventName }) => {
  return (
    <SidePanel isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão">
      <div className="flex flex-col justify-between h-full">
        <div className="text-center mb-6">
          <AlertTriangle size={48} className="mx-auto text-secondary dark:text-red-400 mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Tem certeza que deseja excluir o evento:
          </p>
          <p className="font-semibold text-gray-800 dark:text-gray-100 mb-4 break-words">"{eventName}"?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Esta ação não poderá ser desfeita.</p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Excluir
          </Button>
        </div>
      </div>
    </SidePanel>
  );
};

export default ConfirmDeletePanel;