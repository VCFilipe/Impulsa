
import React, { useState, useRef, useEffect, ChangeEvent } from 'react'; // Added ChangeEvent
import { Comment } from '../../types';
import { formatDateToDisplay } from '../../utils/dateUtils';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { Edit3, Trash2, Save, X, UserCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onSaveEdit: (commentId: string, newText: string) => Promise<void>;
  onDelete: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, currentUserId, onSaveEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null); 
  const { addToast } = useToast();

  const isAuthor = comment.authorId === currentUserId;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editedText.length, editedText.length);
    }
  }, [isEditing, editedText.length]);


  const handleEdit = () => {
    setEditedText(comment.text);
    setIsEditing(true);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(comment.text);
    setEditError('');
  };

  const handleSave = async () => {
    if (!editedText.trim()) {
      setEditError('O comentário não pode estar vazio.');
      return;
    }
    if (editedText.trim().length > 1000) {
      setEditError('O comentário não pode exceder 1000 caracteres.');
      return;
    }
    setEditError('');
    setIsSavingEdit(true);
    try {
      await onSaveEdit(comment.id, editedText.trim());
      setIsEditing(false);
      addToast({ type: 'success', title: 'Comentário Atualizado', message: 'Seu comentário foi salvo.' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erro ao Salvar', message: 'Não foi possível salvar o comentário.' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center">
          <UserCircle size={18} className="mr-1.5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {comment.authorName || 'Colaborador'}
            {isAuthor && <span className="text-xs text-primary dark:text-sky-400 ml-1">(Você)</span>}
          </span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">{formatDateToDisplay(comment.createdAt)}</span>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={editedText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditedText(e.target.value)}
            error={editError}
            maxLength={1000}
            rows={3}
            className="text-sm bg-white dark:bg-gray-700"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSavingEdit} leftIcon={<X size={14}/>} className="text-xs">
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} loading={isSavingEdit} leftIcon={<Save size={14}/>} className="text-xs">
              {isSavingEdit ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {comment.text}
          </p>
          {isAuthor && (
            <div className="mt-2 flex justify-end space-x-2">
              <Button variant="ghost" size="sm" onClick={handleEdit} leftIcon={<Edit3 size={14}/>} className="text-xs px-2 py-1 text-primary dark:text-sky-400 hover:bg-primary/10 dark:hover:bg-sky-400/10">
                Editar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(comment.id)} leftIcon={<Trash2 size={14}/>} className="text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                Excluir
              </Button>
            </div>
          )}
        </>
      )}
       {comment.updatedAt !== comment.createdAt && !isEditing && (
         <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right italic">Editado em: {formatDateToDisplay(comment.updatedAt)}</p>
       )}
    </div>
  );
};

export default CommentItem;
