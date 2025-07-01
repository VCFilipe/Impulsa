
import { Comment } from '../types';
import { MOCK_USER_ID_SUGGESTIONS } from './suggestionService'; // For current user's comments

const COMMENTS_STORAGE_KEY = 'suggestionComments';

const getInitialComments = (): Comment[] => {
  const now = new Date();
  const generatePastDate = (daysAgo: number, hoursAgo: number = 0) => 
    new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000).toISOString();

  return [
    // Comments for 'sug-2' (Opções de Lanche Mais Saudáveis)
    {
      id: 'cmt-1',
      suggestionId: 'sug-2',
      authorId: 'userEmployeeAlpha',
      authorName: 'Colaborador Alpha',
      text: 'Excelente ideia! Realmente precisamos de mais opções saudáveis. Frutas seriam ótimo.',
      createdAt: generatePastDate(2, 5),
      updatedAt: generatePastDate(2, 5),
    },
    {
      id: 'cmt-2',
      suggestionId: 'sug-2',
      authorId: MOCK_USER_ID_SUGGESTIONS, // Current user's comment
      authorName: 'Você (Mock User)',
      text: 'Concordo totalmente. Castanhas e iogurtes também seriam muito bem-vindos!',
      createdAt: generatePastDate(1, 2),
      updatedAt: generatePastDate(1, 1),
    },
    {
      id: 'cmt-3',
      suggestionId: 'sug-2',
      authorId: 'userEmployeeBeta',
      authorName: 'Colaborador Beta',
      text: 'Acho que o custo pode ser um problema, mas vale a pena investigar.',
      createdAt: generatePastDate(0, 10),
      updatedAt: generatePastDate(0, 10),
    },
    // Comments for 'sug-1' (Melhorar Programa de Mentoria)
    {
      id: 'cmt-4',
      suggestionId: 'sug-1',
      authorId: 'userEmployeeGamma',
      authorName: 'Colaborador Gamma',
      text: 'O programa de mentoria é uma iniciativa valiosa. Apoio a ideia de mais estrutura e acompanhamento.',
      createdAt: generatePastDate(3),
      updatedAt: generatePastDate(3),
    },
    {
      id: 'cmt-5',
      suggestionId: 'sug-1',
      authorId: 'userEmployeeDelta',
      authorName: 'Colaborador Delta',
      text: 'Talvez workshops para mentores também fossem úteis.',
      createdAt: generatePastDate(1),
      updatedAt: generatePastDate(1),
    },
  ];
};


export const getCommentsForSuggestion = (suggestionId: string): Comment[] => {
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  let allComments: Comment[] = [];
  if (stored) {
    try {
      allComments = JSON.parse(stored) as Comment[];
    } catch (e) {
      console.error("Failed to parse comments from localStorage", e);
      allComments = [];
    }
  } else {
    // Initialize with mock data if no comments are stored yet
    allComments = getInitialComments();
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
  }
  return allComments
    .filter(comment => comment.suggestionId === suggestionId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Newest first
};

const saveAllComments = (comments: Comment[]): void => {
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
};

export const addComment = (commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Comment => {
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  let allComments: Comment[] = [];
   if (stored) {
    try {
      allComments = JSON.parse(stored) as Comment[];
    } catch (e) {
      console.error("Failed to parse comments from localStorage during add", e);
      allComments = getInitialComments(); // Fallback to initial if storage is corrupt
    }
  } else {
     allComments = getInitialComments(); // Initialize if nothing in storage
  }

  const now = new Date().toISOString();
  const newComment: Comment = {
    ...commentData,
    id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  
  const updatedComments = [...allComments, newComment];
  saveAllComments(updatedComments);
  return newComment;
};

export const updateComment = (commentId: string, newText: string): Comment | null => {
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!stored) return null;
  
  let allComments: Comment[] = JSON.parse(stored);
  const commentIndex = allComments.findIndex(comment => comment.id === commentId);

  if (commentIndex > -1) {
    allComments[commentIndex] = {
      ...allComments[commentIndex],
      text: newText,
      updatedAt: new Date().toISOString(),
    };
    saveAllComments(allComments);
    return allComments[commentIndex];
  }
  return null;
};

export const deleteComment = (commentId: string): void => {
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!stored) return;

  let allComments: Comment[] = JSON.parse(stored);
  allComments = allComments.filter(comment => comment.id !== commentId);
  saveAllComments(allComments);
};

export const deleteAllCommentsForSuggestion = (suggestionId: string): void => {
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!stored) return;

  let allComments: Comment[] = JSON.parse(stored);
  allComments = allComments.filter(comment => comment.suggestionId !== suggestionId);
  saveAllComments(allComments);
};
