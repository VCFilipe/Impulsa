import React from 'react';
import { PolicyFile } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FileText, FileImage, FileArchive, FileQuestion, Paperclip } from 'lucide-react';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: PolicyFile | null;
}

const getFileIcon = (fileType: string | undefined): React.ReactNode => {
  if (!fileType) return <FileQuestion size={48} className="text-gray-400 dark:text-gray-500" />;
  const typeLower = fileType.toLowerCase();

  if (typeLower.includes('pdf')) return <FileText size={48} className="text-red-500 dark:text-red-400" />;
  if (typeLower.includes('doc') || typeLower.includes('word')) return <FileText size={48} className="text-blue-500 dark:text-sky-400" />;
  if (typeLower.includes('xls') || typeLower.includes('excel')) return <FileText size={48} className="text-green-500 dark:text-green-400" />;
  if (typeLower.includes('ppt') || typeLower.includes('powerpoint')) return <FileText size={48} className="text-orange-500 dark:text-orange-400" />;
  if (typeLower.includes('image') || typeLower.includes('jpg') || typeLower.includes('jpeg') || typeLower.includes('png') || typeLower.includes('gif')) return <FileImage size={48} className="text-indigo-500 dark:text-indigo-400" />;
  if (typeLower.includes('zip') || typeLower.includes('rar') || typeLower.includes('archive')) return <FileArchive size={48} className="text-yellow-500 dark:text-yellow-400" />;
  
  return <FileQuestion size={48} className="text-gray-500 dark:text-gray-400" />;
};

const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null || bytes === 0) return 'Tamanho desconhecido';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileViewerModal: React.FC<FileViewerModalProps> = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Visualizar Anexo: ${file.name}`}
      size="lg"
      footer={
        <Button variant="primary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="text-center py-4">
        <div className="mb-6 mx-auto w-fit">
          {getFileIcon(file.type)}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 break-all" title={file.name}>
          {file.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">Tipo:</span> {file.type || 'Desconhecido'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span className="font-medium text-gray-700 dark:text-gray-300">Tamanho:</span> {formatFileSize(file.size)}
        </p>
        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-md border border-gray-200 dark:border-gray-600">
          <p className="text-gray-700 dark:text-gray-300 italic">
            Simulação de visualização de arquivo.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Em uma aplicação real, o conteúdo do arquivo "{file.name}" seria carregado e exibido aqui.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default FileViewerModal;