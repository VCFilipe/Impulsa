
import { Announcement, AnnouncementCategory } from '../types';

const LOCAL_STORAGE_KEY = 'corporateAnnouncements';

const getInitialAnnouncements = (): Announcement[] => {
  const now = new Date();
  const generatePastDate = (daysAgo: number, hoursAgo: number = 0, minutesAgo: number = 0) =>
    new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000 - minutesAgo * 60 * 1000).toISOString();

  return [
    {
      id: 'ann-1',
      title: 'Manutenção Programada dos Servidores neste Fim de Semana',
      content: `Prezados colaboradores,\n\nInformamos que haverá uma manutenção programada em nossos servidores principais neste fim de semana, começando às 22:00 de sábado (27/07) e com previsão de término às 06:00 de domingo (28/07).\n\nDurante este período, alguns sistemas internos, incluindo o Portal de RH e o sistema de BI, poderão apresentar instabilidade ou ficar temporariamente indisponíveis. O acesso à internet e e-mail não serão afetados.\n\nAgradecemos a compreensão.`,
      category: AnnouncementCategory.TECNOLOGIA_NOVOS,
      authorId: 'ti-dept',
      authorName: 'Departamento de TI',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dGVjaG5vbG9neSUyMGRhdGElMjBjZW50ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      isPinned: true,
      isRead: false, // Adicionado
      createdAt: generatePastDate(2, 5), 
      updatedAt: generatePastDate(2, 3), 
    },
    {
      id: 'ann-2',
      title: 'Nova Política de Home Office: Detalhes e Implementação',
      content: `Caros colegas,\n\nÉ com satisfação que anunciamos a nova Política de Home Office, que entrará em vigor a partir de 01/08/2024. Esta política visa oferecer maior flexibilidade e bem-estar, mantendo nossa produtividade e colaboração.\n\nPrincipais pontos:\n- Modelo híbrido para a maioria das funções (3 dias no escritório, 2 dias remotos).\n- Subsídio para despesas de internet e energia.\n- Requisitos de segurança e ergonomia para o trabalho remoto.\n\nO documento completo da política está disponível na seção "Políticas > Recursos Humanos" do portal. Haverá um webinar na próxima quarta-feira às 10:00 para tirar dúvidas. Link será enviado por e-mail.\n\nContamos com a colaboração de todos para o sucesso desta nova fase!`,
      category: AnnouncementCategory.RH_COMUNICA,
      authorId: 'rh-dept',
      authorName: 'Recursos Humanos',
      imageUrl: 'https://images.unsplash.com/photo-1586953208448-3151cf797f10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGhvZWFyY2h8MTF8fGhvbmUlMjBvZmZpY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      isPinned: true,
      isRead: true, // Adicionado
      createdAt: generatePastDate(1, 10), 
      updatedAt: generatePastDate(1, 2),  
    },
    {
      id: 'ann-3',
      title: 'Conquista da Certificação ISO 9001!',
      content: `É com grande orgulho que compartilhamos uma excelente notícia: nossa empresa conquistou a certificação ISO 9001!\n\nEste é um reconhecimento do nosso compromisso com a qualidade, processos eficientes e a satisfação de nossos clientes. Agradecemos a dedicação e o empenho de cada colaborador que tornou esta conquista possível.\n\nVamos celebrar juntos este marco importante!\n\n#SomosQualidade #ISO9001 #Conquista`,
      category: AnnouncementCategory.CONQUISTAS_EQUIPES,
      authorId: 'diretoria-comm',
      authorName: 'Diretoria Executiva',
      imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2VsZWJyYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      isPinned: false,
      isRead: false, // Adicionado
      createdAt: generatePastDate(0, 2), 
      updatedAt: generatePastDate(0, 2),
    },
    {
      id: 'ann-4',
      title: 'Happy Hour de Fim de Mês: Edição Julina!',
      content: `Preparem as camisas xadrez e os chapéus de palha! Nosso tradicional Happy Hour de Fim de Mês será uma Festa Julina!\n\nData: 31/07 (Quarta-feira)\nHorário: A partir das 17:30\nLocal: Área de convivência\n\nTeremos comidas típicas, música e muita diversão. Não perca!\n\nEsperamos vocês!`,
      category: AnnouncementCategory.EVENTOS_EMPRESARIAIS,
      authorId: 'eventos-corp',
      authorName: 'Comitê de Eventos',
      isPinned: false,
      isRead: true, // Adicionado
      createdAt: generatePastDate(3, 0), 
      updatedAt: generatePastDate(3, 0),
    },
    {
      id: 'ann-5',
      title: 'Atualização do Sistema de CRM - Novas Funcionalidades',
      content: 'Informamos que o sistema de CRM foi atualizado na última noite. As novas funcionalidades incluem um dashboard personalizável e integração aprimorada com o funil de vendas. Um guia rápido foi enviado por e-mail e o treinamento completo está agendado para a próxima semana. Em caso de dúvidas, contate o suporte de TI.',
      category: AnnouncementCategory.TECNOLOGIA_NOVOS,
      authorId: 'ti-dept',
      authorName: 'Departamento de TI',
      isPinned: false,
      isRead: false, // Adicionado
      createdAt: generatePastDate(5, 0),
      updatedAt: generatePastDate(5, 0),
    },
    {
      id: 'ann-6',
      title: 'Lembrete: Prazo Final para Inscrição no Programa de Desenvolvimento de Líderes',
      content: 'Lembramos a todos os interessados que o prazo final para inscrição no Programa de Desenvolvimento de Líderes é nesta sexta-feira, 26/07. Não perca a oportunidade de aprimorar suas habilidades de liderança. Inscrições pelo Portal RH.',
      category: AnnouncementCategory.RH_COMUNICA,
      authorId: 'rh-dept',
      authorName: 'Recursos Humanos',
      isPinned: false,
      isRead: false, // Adicionado
      createdAt: generatePastDate(4, 0),
      updatedAt: generatePastDate(4, 0),
    },
     {
      id: 'ann-7',
      title: 'Abertura das Inscrições para o Hackathon Interno 2024!',
      content: `Chegou a hora de colocar suas ideias inovadoras em prática! Estão abertas as inscrições para o Hackathon Interno 2024, com o tema "Soluções Sustentáveis para o Nosso Negócio".\n\nForme sua equipe (3-5 pessoas) e inscreva seu projeto até 15/08.\nPremiação para os 3 melhores projetos!\n\nMais informações e regulamento no hotsite do Hackathon (link na intranet).\n\n#Inovação #Sustentabilidade #HackathonEmpresaInc`,
      category: AnnouncementCategory.EVENTOS_EMPRESARIAIS,
      authorId: 'inovacao-comite',
      authorName: 'Comitê de Inovação',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aGFja2F0aG9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      isPinned: false,
      isRead: true, // Adicionado
      createdAt: generatePastDate(7, 0),
      updatedAt: generatePastDate(7, 0),
    },
    {
      id: 'ann-8',
      title: 'Projeto Alpha: Fase de Testes Concluída com Sucesso!',
      content: 'A equipe do Projeto Alpha tem o prazer de anunciar a conclusão bem-sucedida da fase de testes da nova plataforma de e-commerce. Agradecemos a todos os testadores voluntários pelo feedback valioso. Próximos passos: ajustes finais e preparação para o lançamento em Setembro.',
      category: AnnouncementCategory.PROJETOS_ATUALIZACOES,
      authorId: 'projeto-alpha-lead',
      authorName: 'Líder do Projeto Alpha',
      isPinned: false,
      isRead: false, // Adicionado
      createdAt: generatePastDate(10, 0),
      updatedAt: generatePastDate(9, 0),
    },
  ];
};

export const getAnnouncements = (): Announcement[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Announcement[];
      return parsed.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    } catch (e) {
      console.error("Failed to parse announcements from localStorage", e);
    }
  }
  const initial = getInitialAnnouncements();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
  return initial.sort((a, b) => { 
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};

const saveAnnouncements = (announcements: Announcement[]) => {
  announcements.sort((a, b) => { // Ensure consistent sorting before saving
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(announcements));
   // Dispatch event whenever announcements are saved
  window.dispatchEvent(new CustomEvent('announcementsUpdated'));
};


export const addAnnouncement = (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName' | 'isRead'>): Announcement => {
  const announcements = getAnnouncements();
  const now = new Date().toISOString();
  const newAnnouncement: Announcement = {
    ...data,
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    authorId: 'current-user-mock', 
    authorName: 'Você (Usuário Atual)', 
    isRead: false, // Novo comunicado é sempre não lido
    createdAt: now,
    updatedAt: now,
  };
  const updatedAnnouncements = [newAnnouncement, ...announcements];
  saveAnnouncements(updatedAnnouncements);
  return newAnnouncement;
};

export const updateAnnouncement = (updatedData: Announcement): Announcement => {
  let announcements = getAnnouncements();
  const now = new Date().toISOString();
  const originalAnnouncement = announcements.find(a => a.id === updatedData.id);

  const finalUpdatedData = { 
    ...updatedData, 
    updatedAt: now,
    authorId: originalAnnouncement?.authorId || 'system-update', 
    authorName: originalAnnouncement?.authorName || 'Sistema', 
    isRead: originalAnnouncement?.id === updatedData.id ? updatedData.isRead : (originalAnnouncement?.isRead || false), // Preserve original isRead unless explicitly changed
  };
  
  announcements = announcements.map(ann => (ann.id === finalUpdatedData.id ? finalUpdatedData : ann));
  saveAnnouncements(announcements);
  return finalUpdatedData;
};

export const deleteAnnouncement = (announcementId: string): void => {
  let announcements = getAnnouncements();
  announcements = announcements.filter(ann => ann.id !== announcementId);
  saveAnnouncements(announcements);
};

export const markAnnouncementAsRead = (announcementId: string): void => {
  let announcements = getAnnouncements();
  const announcement = announcements.find(ann => ann.id === announcementId);
  if (announcement && !announcement.isRead) {
    announcement.isRead = true;
    updateAnnouncement(announcement); // Use update to ensure updatedAt is changed and event is dispatched
  }
};

export const markAnnouncementAsUnread = (announcementId: string): void => {
  let announcements = getAnnouncements();
  const announcement = announcements.find(ann => ann.id === announcementId);
  if (announcement && announcement.isRead) {
    announcement.isRead = false;
    updateAnnouncement(announcement);
  }
};

export const getUnreadAnnouncementsCount = (): number => {
  return getAnnouncements().filter(ann => !ann.isRead).length;
};

export const getRecentUnreadAnnouncements = (limit: number = 3): Announcement[] => {
  return getAnnouncements()
    .filter(ann => !ann.isRead)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Mais recentes primeiro
    .slice(0, limit);
};

export const getPinnedAnnouncements = (limit: number = 3): Announcement[] => {
  return getAnnouncements().filter(ann => ann.isPinned).slice(0, limit);
};

export const getRecentNonPinnedAnnouncements = (limit: number = 5): Announcement[] => {
  return getAnnouncements().filter(ann => !ann.isPinned).slice(0, limit);
};