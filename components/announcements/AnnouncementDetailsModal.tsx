
import React from 'react';
import { Announcement } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatDateToDisplay } from '../../utils/dateUtils';
import { Tag, Calendar, UserCircle } from 'lucide-react';
import { DEFAULT_ANNOUNCEMENT_IMAGE_URL } from '../../constants';

interface AnnouncementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

const AnnouncementDetailsModal: React.FC<AnnouncementDetailsModalProps> = ({ isOpen, onClose, announcement }) => {

  if (!isOpen || !announcement) return null;

  const displayImageUrl = announcement.imageUrl || DEFAULT_ANNOUNCEMENT_IMAGE_URL;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={announcement.title}
      size="3xl" 
      footer={
        <Button variant="primary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 py-1">
        {displayImageUrl && (
            <div className="w-full max-h-80 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
                <img src={displayImageUrl} alt={`Imagem para ${announcement.title}`} className="w-full h-full object-contain" />
            </div>
        )}
        <div className="pb-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center">
              <Tag size={14} className="mr-1.5 text-primary dark:text-sky-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Categoria:</span>
              <span className="ml-1">{announcement.category}</span>
            </div>
             <div className="flex items-center">
              <UserCircle size={14} className="mr-1.5 text-primary dark:text-sky-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Autor:</span>
              <span className="ml-1">{announcement.authorName}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5 text-primary dark:text-sky-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Última Atualização:</span>
              <span className="ml-1">{formatDateToDisplay(announcement.updatedAt)}</span>
            </div>
          </div>
          
          <div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {announcement.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AnnouncementDetailsModal;
