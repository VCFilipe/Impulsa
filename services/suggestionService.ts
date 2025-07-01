
import { Suggestion, SuggestionVote, SuggestionVoteType } from '../types';
import * as commentService from './commentService'; // Import comment service

const SUGGESTIONS_STORAGE_KEY = 'corporateSuggestions';
const VOTES_STORAGE_KEY = 'suggestionVotes';
export const MOCK_USER_ID_SUGGESTIONS = 'suggestionUser789';

const getInitialSuggestions = (): Suggestion[] => {
  const now = new Date();
  const generatePastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'sug-1',
      title: 'Melhorar o Programa de Mentoria Interna',
      description: 'O programa atual é bom, mas poderia ter mais estrutura e acompanhamento para os mentorados e mentores. Sugiro encontros trimestrais de feedback e um sistema de matching mais eficiente.',
      isAnonymous: false,
      authorId: 'userEmployee1',
      upvotes: 15,
      downvotes: 2,
      createdAt: generatePastDate(10),
      updatedAt: generatePastDate(10),
    },
    {
      id: 'sug-2',
      title: 'Opções de Lanche Mais Saudáveis na Copa',
      description: 'Gostaria de ver mais frutas frescas, iogurtes naturais, castanhas e opções integrais disponíveis na copa, em vez de tantos biscoitos recheados e salgadinhos industrializados.',
      isAnonymous: true,
      upvotes: 25,
      downvotes: 1,
      createdAt: generatePastDate(5),
      updatedAt: generatePastDate(3),
    },
    {
      id: 'sug-3',
      title: 'Dia Temático Mensal para Integração das Equipes',
      description: 'Proponho um dia temático por mês (ex: dia do pijama, dia do time de futebol favorito, dia da cultura geek) para descontrair e aumentar a integração entre as equipes de diferentes departamentos.',
      isAnonymous: false,
      authorId: 'userEmployee2',
      upvotes: 8,
      downvotes: 5,
      createdAt: generatePastDate(2),
      updatedAt: generatePastDate(1),
    },
    {
      id: 'sug-4',
      title: 'Implementar Coleta Seletiva Mais Eficiente nos Andares',
      description: 'As lixeiras atuais para recicláveis são poucas e muitas vezes mal utilizadas. Sugiro lixeiras identificadas por cor em todos os andares e campanhas de conscientização.',
      isAnonymous: true,
      upvotes: 18,
      downvotes: 0,
      createdAt: generatePastDate(12),
      updatedAt: generatePastDate(12),
    },
    {
      id: 'sug-5',
      title: 'Workshops de Desenvolvimento de Soft Skills',
      description: 'Oferecer workshops sobre comunicação eficaz, liderança, inteligência emocional e gestão do tempo seria muito valioso para o desenvolvimento profissional de todos.',
      isAnonymous: false,
      authorId: 'userEmployee3',
      upvotes: 22,
      downvotes: 1,
      createdAt: generatePastDate(7),
      updatedAt: generatePastDate(4),
    },
    {
      id: 'sug-6',
      title: 'Espaço de Descompressão com Jogos e Livros',
      description: 'Criar um pequeno espaço com puffs, jogos de tabuleiro, videogames e livros para que os colaboradores possam relaxar e interagir durante os intervalos.',
      isAnonymous: false,
      authorId: 'userEmployee1',
      upvotes: 12,
      downvotes: 3,
      createdAt: generatePastDate(20),
      updatedAt: generatePastDate(15),
    },
    {
      id: 'sug-7',
      title: 'Flexibilização do Horário de Almoço',
      description: 'Permitir que o horário de almoço seja mais flexível (ex: entre 11h e 14h, com 1h de duração) ajudaria a evitar filas no refeitório e atenderia melhor às necessidades individuais.',
      isAnonymous: true,
      upvotes: 30,
      downvotes: 2,
      createdAt: generatePastDate(3),
      updatedAt: generatePastDate(3),
    },
    {
      id: 'sug-8',
      title: 'Bicicletário Seguro e Vestiário com Chuveiros',
      description: 'Incentivar o uso de bicicletas como meio de transporte, oferecendo um bicicletário seguro e um vestiário com chuveiros para quem vem pedalando.',
      isAnonymous: false,
      authorId: 'userEmployee4',
      upvotes: 17,
      downvotes: 0,
      createdAt: generatePastDate(30),
      updatedAt: generatePastDate(25),
    },
    {
      id: 'sug-9',
      title: 'Clube do Livro Corporativo',
      description: 'Criar um clube do livro para incentivar a leitura e a troca de ideias sobre diversos temas, não apenas relacionados ao trabalho.',
      isAnonymous: true,
      upvotes: 9,
      downvotes: 1,
      createdAt: generatePastDate(18),
      updatedAt: generatePastDate(18),
    },
    {
      id: 'sug-10',
      title: 'Programa de Voluntariado Corporativo',
      description: 'Organizar e incentivar a participação dos colaboradores em ações de voluntariado, apoiando causas sociais e fortalecendo o employer branding.',
      isAnonymous: false,
      authorId: 'userEmployee2',
      upvotes: 28,
      downvotes: 0,
      createdAt: generatePastDate(45),
      updatedAt: generatePastDate(40),
    },
    {
      id: 'sug-11',
      title: 'Melhorar a Qualidade do Café Servido',
      description: 'O café da máquina atual não é dos melhores. Poderíamos ter opções de café em grão moído na hora ou parcerias com cafeterias locais.',
      isAnonymous: true,
      upvotes: 14,
      downvotes: 4,
      createdAt: generatePastDate(6),
      updatedAt: generatePastDate(6),
    },
    {
      id: 'sug-12',
      title: 'Cursos de Idiomas In Company ou Subsidiados',
      description: 'Oferecer cursos de inglês, espanhol ou outros idiomas relevantes para a empresa, seja in company ou com subsídio, seria um grande diferencial.',
      isAnonymous: false,
      authorId: 'userEmployee5',
      upvotes: 20,
      downvotes: 1,
      createdAt: generatePastDate(25),
      updatedAt: generatePastDate(22),
    },
    {
      id: 'sug-13',
      title: 'Estações de Trabalho Mais Ergonômicas',
      description: 'Investir em cadeiras mais ergonômicas e suportes para monitores para prevenir problemas de saúde e melhorar o conforto no dia a dia.',
      isAnonymous: true,
      upvotes: 16,
      downvotes: 0,
      createdAt: generatePastDate(1),
      updatedAt: generatePastDate(1),
    },
    {
      id: 'sug-14',
      title: 'Happy Hour Mensal Patrocinado pela Empresa',
      description: 'Um happy hour mensal, mesmo que simples, com comes e bebes patrocinados, ajudaria muito na integração e no clima organizacional.',
      isAnonymous: false,
      authorId: 'userEmployee3',
      upvotes: 11,
      downvotes: 2,
      createdAt: generatePastDate(14),
      updatedAt: generatePastDate(14),
    },
    {
      id: 'sug-15',
      title: 'Plataforma Interna para Troca de Conhecimentos (Wiki)',
      description: 'Criar uma wiki interna onde os colaboradores possam documentar processos, compartilhar conhecimentos e encontrar informações importantes de forma fácil.',
      isAnonymous: true,
      upvotes: 19,
      downvotes: 0,
      createdAt: generatePastDate(60),
      updatedAt: generatePastDate(50),
    },
    {
      id: 'sug-16',
      title: 'Treinamentos sobre Ferramentas de IA para Produtividade',
      description: 'Oferecer treinamentos sobre como usar ferramentas de inteligência artificial (ChatGPT, Copilot, etc.) para otimizar tarefas e aumentar a produtividade.',
      isAnonymous: false,
      authorId: 'userEmployee4',
      upvotes: 23,
      downvotes: 0,
      createdAt: generatePastDate(8),
      updatedAt: generatePastDate(8),
    },
    {
      id: 'sug-17',
      title: 'Programas de Saúde Mental e Mindfulness',
      description: 'Sessões de mindfulness, palestras sobre saúde mental e acesso facilitado a terapeutas seriam muito benéficos para o bem-estar dos colaboradores.',
      isAnonymous: true,
      upvotes: 26,
      downvotes: 1,
      createdAt: generatePastDate(11),
      updatedAt: generatePastDate(9),
    },
    {
      id: 'sug-18',
      title: 'Gamificação para Metas e Treinamentos',
      description: 'Usar elementos de gamificação (pontos, rankings, badges) para engajar os colaboradores no atingimento de metas e na participação em treinamentos.',
      isAnonymous: false,
      authorId: 'userEmployee1',
      upvotes: 7,
      downvotes: 3,
      createdAt: generatePastDate(19),
      updatedAt: generatePastDate(19),
    },
    {
      id: 'sug-19',
      title: 'Melhorias na Comunicação Interna sobre Decisões Estratégicas',
      description: 'Aumentar a transparência e a frequência da comunicação sobre as decisões estratégicas da empresa, para que todos se sintam mais incluídos e informados.',
      isAnonymous: true,
      upvotes: 13,
      downvotes: 1,
      createdAt: generatePastDate(4),
      updatedAt: generatePastDate(4),
    },
    {
      id: 'sug-20',
      title: 'Incentivo a Projetos de Inovação Interdepartamentais',
      description: 'Criar um programa que incentive e financie pequenos projetos de inovação propostos por equipes multidisciplinares de diferentes departamentos.',
      isAnonymous: false,
      authorId: 'userEmployee5',
      upvotes: 21,
      downvotes: 0,
      createdAt: generatePastDate(35),
      updatedAt: generatePastDate(32),
    },
    {
      id: 'sug-21',
      title: 'Criação de um Comitê de Sustentabilidade',
      description: 'Formar um comitê com representantes de diversas áreas para propor e implementar iniciativas de sustentabilidade na empresa.',
      isAnonymous: false,
      authorId: 'userEmployee2',
      upvotes: 10,
      downvotes: 0,
      createdAt: generatePastDate(90),
      updatedAt: generatePastDate(80),
    },
    {
      id: 'sug-22',
      title: 'Ampliar as Opções de Refeição Vegetariana/Vegana no Refeitório',
      description: 'Garantir que haja pelo menos uma opção de prato principal vegetariano e vegano todos os dias, e que sejam variadas e saborosas.',
      isAnonymous: true,
      upvotes: 24,
      downvotes: 1,
      createdAt: generatePastDate(16),
      updatedAt: generatePastDate(13),
    },
    {
      id: 'sug-23',
      title: 'Canal Aberto para Feedback Direto com a Liderança (Ex: "Café com o CEO")',
      description: 'Sessões informais e periódicas onde os colaboradores possam conversar diretamente com a alta liderança, tirar dúvidas e dar feedback.',
      isAnonymous: false,
      authorId: 'userEmployee3',
      upvotes: 17,
      downvotes: 2,
      createdAt: generatePastDate(22),
      updatedAt: generatePastDate(22),
    }
  ];
};

export const getSuggestions = (): Suggestion[] => {
  const stored = localStorage.getItem(SUGGESTIONS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Suggestion[];
    } catch (e) {
      console.error("Failed to parse suggestions", e);
    }
  }
  const initial = getInitialSuggestions();
  localStorage.setItem(SUGGESTIONS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveSuggestions = (suggestions: Suggestion[]): void => {
  localStorage.setItem(SUGGESTIONS_STORAGE_KEY, JSON.stringify(suggestions));
};

export const addSuggestion = (data: Omit<Suggestion, 'id' | 'upvotes' | 'downvotes' | 'createdAt' | 'updatedAt'>): Suggestion => {
  const suggestions = getSuggestions();
  const now = new Date().toISOString();
  const newSuggestion: Suggestion = {
    ...data,
    id: `sug-${Date.now()}`,
    upvotes: 0,
    downvotes: 0,
    createdAt: now,
    updatedAt: now,
  };
  const updatedSuggestions = [newSuggestion, ...suggestions];
  saveSuggestions(updatedSuggestions);
  return newSuggestion;
};

export const updateSuggestion = (updatedData: Suggestion): Suggestion => {
  let suggestions = getSuggestions();
  const now = new Date().toISOString();
  const finalUpdatedSuggestion = { ...updatedData, updatedAt: now };
  suggestions = suggestions.map(s => (s.id === finalUpdatedSuggestion.id ? finalUpdatedSuggestion : s));
  saveSuggestions(suggestions);
  return finalUpdatedSuggestion;
};

export const deleteSuggestion = (suggestionId: string): void => {
  let suggestions = getSuggestions();
  suggestions = suggestions.filter(s => s.id !== suggestionId);
  saveSuggestions(suggestions);
  
  commentService.deleteAllCommentsForSuggestion(suggestionId); // Delete associated comments

  let allVotes = getVotes();
  allVotes = allVotes.filter(vote => vote.suggestionId !== suggestionId);
  saveVotes(allVotes);
};

const getVotes = (): SuggestionVote[] => {
  const stored = localStorage.getItem(VOTES_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as SuggestionVote[];
    } catch (e) {
      console.error("Failed to parse votes", e);
    }
  }
  // Initialize some votes for the new suggestions as well
  const initialVotes: SuggestionVote[] = [
      { suggestionId: 'sug-1', userId: MOCK_USER_ID_SUGGESTIONS, type: SuggestionVoteType.UPVOTE},
      { suggestionId: 'sug-2', userId: MOCK_USER_ID_SUGGESTIONS, type: SuggestionVoteType.UPVOTE},
      { suggestionId: 'sug-4', userId: MOCK_USER_ID_SUGGESTIONS, type: SuggestionVoteType.UPVOTE},
      { suggestionId: 'sug-5', userId: MOCK_USER_ID_SUGGESTIONS, type: SuggestionVoteType.DOWNVOTE}, // Example downvote
      { suggestionId: 'sug-7', userId: MOCK_USER_ID_SUGGESTIONS, type: SuggestionVoteType.UPVOTE},
      { suggestionId: 'sug-10', userId: MOCK_USER_ID_SUGGESTIONS, type: SuggestionVoteType.UPVOTE},
      { suggestionId: 'sug-16', userId: MOCK_USER_ID_SUGGESTIONS, type: SuggestionVoteType.UPVOTE},
      { suggestionId: 'sug-17', userId: MOCK_USER_ID_SUGGESTIONS, type: SuggestionVoteType.UPVOTE},
      { suggestionId: 'sug-20', userId: MOCK_USER_ID_SUGGESTIONS, type: SuggestionVoteType.UPVOTE},
      { suggestionId: 'sug-22', userId: MOCK_USER_ID_SUGGESTIONS, type: SuggestionVoteType.UPVOTE},
  ];
  localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(initialVotes));
  return initialVotes;
};

const saveVotes = (votes: SuggestionVote[]): void => {
  localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
};

const recalculateVoteCounts = (suggestionId: string): void => {
  const allVotes = getVotes();
  const suggestionVotes = allVotes.filter(vote => vote.suggestionId === suggestionId);
  
  const upvotes = suggestionVotes.filter(vote => vote.type === SuggestionVoteType.UPVOTE).length;
  const downvotes = suggestionVotes.filter(vote => vote.type === SuggestionVoteType.DOWNVOTE).length;

  let suggestions = getSuggestions();
  suggestions = suggestions.map(s => {
    if (s.id === suggestionId) {
      return { ...s, upvotes, downvotes };
    }
    return s;
  });
  saveSuggestions(suggestions);
};

export const addOrUpdateVote = (suggestionId: string, userId: string, voteType: SuggestionVoteType): void => {
  let allVotes = getVotes();
  const existingVoteIndex = allVotes.findIndex(
    vote => vote.suggestionId === suggestionId && vote.userId === userId
  );

  if (existingVoteIndex > -1) {
    // If current vote is same as new vote, remove it (toggle off)
    if (allVotes[existingVoteIndex].type === voteType) {
      allVotes.splice(existingVoteIndex, 1);
    } else { // If different, update to new vote type
      allVotes[existingVoteIndex].type = voteType;
    }
  } else { // No existing vote, add new one
    allVotes.push({ suggestionId, userId, type: voteType });
  }
  saveVotes(allVotes);
  recalculateVoteCounts(suggestionId);
};

export const getUserVoteForSuggestion = (suggestionId: string, userId: string): SuggestionVoteType | null => {
  const allVotes = getVotes();
  const userVote = allVotes.find(
    vote => vote.suggestionId === suggestionId && vote.userId === userId
  );
  return userVote ? userVote.type : null;
};

export const getRecentSuggestions = (limit: number = 3): Suggestion[] => {
  const allSuggestions = getSuggestions();
  return allSuggestions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getTopVotedSuggestions = (limit: number = 3): Suggestion[] => {
  const allSuggestions = getSuggestions();
  return allSuggestions
    .sort((a, b) => {
      const scoreA = a.upvotes - a.downvotes;
      const scoreB = b.upvotes - b.downvotes;
      if (scoreB !== scoreA) {
        return scoreB - scoreA; // Primary sort: net upvotes (up - down) descending
      }
      if (b.upvotes !== a.upvotes) {
        return b.upvotes - a.upvotes; // Secondary sort: total upvotes descending
      }
      // Tertiary sort: more recent suggestions first if scores and upvotes are equal
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); 
    })
    .slice(0, limit);
};