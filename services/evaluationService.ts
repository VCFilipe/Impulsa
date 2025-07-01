
import { Evaluation } from '../types';

const LOCAL_STORAGE_KEY = 'corporateEventEvaluations';
const MOCK_USER_ID_PREFIX = 'user'; // Prefix for generating diverse mock user IDs

// Helper to generate varied mock user IDs
const generateMockUserId = (index: number): string => `${MOCK_USER_ID_PREFIX}${index + 1}`;

const createInitialKickoffEvaluations = (eventId: string): Evaluation[] => {
  const kickoffEvaluations: Evaluation[] = [];
  const comments = [
    "Excelente organização, conteúdo muito relevante e bem apresentado. Superou minhas expectativas!",
    "Muito bom! A organização foi impecável e o conteúdo extremamente útil para nossos próximos passos.",
    "Gostei bastante. A clareza dos objetivos e a forma como foram comunicados foram pontos altos.",
    "Evento produtivo. A logística funcionou bem e as discussões foram ricas.",
    "Organização nota 10, mas achei o conteúdo um pouco denso para um kick-off. Talvez pudesse ser mais dinâmico.",
    "Conteúdo excelente, porém a organização do coffee break deixou a desejar um pouco.",
    "Interessante. Alguns pontos do conteúdo poderiam ser mais aprofundados, mas no geral foi bom.",
    "Achei a organização boa, mas o conteúdo foi um pouco repetitivo em relação a outros planejamentos.",
    "Razoável. A organização estava ok, mas o conteúdo não trouxe muitas novidades para mim.",
    "Poderia ser melhor. Tivemos alguns problemas técnicos com o projetor e o conteúdo foi superficial.",
    "Não atendeu às minhas expectativas. A organização estava confusa e o conteúdo vago.",
    "Conteúdo bom, mas a duração do evento foi excessiva. Cansativo.",
    "A organização foi perfeita. O conteúdo, embora bom, poderia ter mais exemplos práticos.",
    "Evento muito bem estruturado. As metas apresentadas são desafiadoras, mas claras.",
    "Gostei da dinâmica e da interação. Conteúdo pertinente e bem planejado.",
    "Organização impecável! Conteúdo de alto nível, inspirador para o próximo ano.",
    "Sessões bem divididas, organização eficiente. Conteúdo poderia ter focado mais em inovação.",
    "Tudo correu bem. Organização sem falhas, conteúdo sólido e direcionado.",
    "Um bom pontapé inicial. Organização eficiente e conteúdo alinhado com as necessidades.",
    "Evento necessário e bem executado. Conteúdo claro e organização que facilitou a participação."
  ];

  const ratings = [
    { org: 5, content: 5 }, { org: 5, content: 4 }, { org: 4, content: 5 }, { org: 4, content: 4 },
    { org: 5, content: 3 }, { org: 3, content: 5 }, { org: 4, content: 3 }, { org: 3, content: 3 },
    { org: 3, content: 2 }, { org: 2, content: 3 }, { org: 2, content: 2 }, { org: 4, content: 2 },
    { org: 5, content: 4 }, { org: 5, content: 5 }, { org: 4, content: 4 }, { org: 5, content: 5 },
    { org: 4, content: 3 }, { org: 5, content: 4 }, { org: 4, content: 4 }, { org: 4, content: 5 }
  ];

  for (let i = 0; i < 20; i++) {
    kickoffEvaluations.push({
      eventId: eventId,
      userId: generateMockUserId(i),
      orgRating: ratings[i].org,
      contentRating: ratings[i].content,
      comment: comments[i],
      timestamp: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(), // Spread out timestamps
    });
  }
  return kickoffEvaluations;
};


// Helper to get all evaluations from localStorage
const getAllStoredEvaluations = (): { [eventId: string]: Evaluation[] } => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  let allEvaluations: { [eventId: string]: Evaluation[] } = {};

  if (stored) {
    try {
      allEvaluations = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse evaluations from localStorage", e);
      allEvaluations = {}; // Start fresh if parsing fails
    }
  }

  // Special handling for "Planejamento Estratégico 2026 - Kick-off" (ID: '2025-01')
  const kickoffEventId = '2025-01';
  if (!allEvaluations[kickoffEventId] || allEvaluations[kickoffEventId].length === 0) {
    console.log(`Initializing static evaluations for event ${kickoffEventId}`);
    allEvaluations[kickoffEventId] = createInitialKickoffEvaluations(kickoffEventId);
    // Save back to localStorage after adding initial data
    saveAllStoredEvaluations(allEvaluations);
  }
  
  return allEvaluations;
};

// Helper to save all evaluations to localStorage
const saveAllStoredEvaluations = (allEvaluations: { [eventId: string]: Evaluation[] }): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allEvaluations));
};

export const addEvaluation = (evaluationData: {
  eventId: string;
  userId?: string; 
  orgRating: number; 
  contentRating: number; 
  comment: string;
  timestamp?: string; 
}): Evaluation => {
  const allEvaluations = getAllStoredEvaluations();
  const eventId = evaluationData.eventId;
  // Use a unique mock user ID if none is provided, ensuring it's different from static ones for new evaluations
  const newUserId = evaluationData.userId || `newUser-${Date.now().toString(36)}`;


  const newEvaluation: Evaluation = {
    eventId: eventId,
    userId: newUserId,
    orgRating: evaluationData.orgRating, 
    contentRating: evaluationData.contentRating, 
    comment: evaluationData.comment,
    timestamp: evaluationData.timestamp || new Date().toISOString(),
  };

  if (!allEvaluations[eventId]) {
    allEvaluations[eventId] = [];
  }
  
  allEvaluations[eventId] = allEvaluations[eventId].filter(evalItem => evalItem.userId !== newEvaluation.userId);
  allEvaluations[eventId].push(newEvaluation);

  saveAllStoredEvaluations(allEvaluations);
  return newEvaluation;
};

export const getEvaluationsForEvent = (eventId: string): Evaluation[] => {
  const allEvaluations = getAllStoredEvaluations();
  return (allEvaluations[eventId] || []).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getEvaluationSummaryForEvent = (eventId: string): { avgOrgRating: number; avgContentRating: number; count: number } => {
  const eventEvaluations = getEvaluationsForEvent(eventId);
  if (eventEvaluations.length === 0) {
    return { avgOrgRating: 0, avgContentRating: 0, count: 0 };
  }

  const totalOrgRating = eventEvaluations.reduce((sum, ev) => sum + ev.orgRating, 0);
  const totalContentRating = eventEvaluations.reduce((sum, ev) => sum + ev.contentRating, 0);
  
  return {
    avgOrgRating: parseFloat((totalOrgRating / eventEvaluations.length).toFixed(1)),
    avgContentRating: parseFloat((totalContentRating / eventEvaluations.length).toFixed(1)),
    count: eventEvaluations.length,
  };
};

export const deleteEvaluationsForEvent = (eventId: string): void => {
  const allEvaluations = getAllStoredEvaluations();
  if (allEvaluations[eventId]) {
    delete allEvaluations[eventId];
    saveAllStoredEvaluations(allEvaluations);
  }
};

export const getAllEvaluations = (): Evaluation[] => {
    const allStored = getAllStoredEvaluations();
    return Object.values(allStored).flat().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
