import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { LogOut, AlertTriangle } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Saída"
      size="md" 
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} leftIcon={<LogOut size={16}/>}>
            Sair
          </Button>
        </>
      }
    >
      <div className="text-center py-2">
        <AlertTriangle size={48} className="mx-auto text-secondary dark:text-red-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"> 
          Tem certeza que deseja sair do sistema?
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Esta ação não poderá ser desfeita.
        </p>
      </div>
    </Modal>
  );
};

export default LogoutConfirmModal;