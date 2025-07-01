
import { AIPrompt } from '../types';

const LOCAL_STORAGE_KEY = 'aiPrompts';

const getInitialAIPrompts = (): AIPrompt[] => {
  const now = new Date().toISOString();
  const generatePastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'aiprompt-1',
      title: 'Resumir E-mail Longo',
      description: 'Extrai os pontos chave e ações necessárias de um e-mail extenso, focando em clareza e objetividade.',
      useCase: 'Resumo de Texto',
      promptText: `Resuma o seguinte e-mail em 3 a 5 pontos principais, começando com a informação mais crucial. Para cada ponto, indique se há alguma ação necessária e quem é o responsável. Formate a saída de forma clara e concisa.

E-mail Original:
---
[COLAR E-MAIL AQUI]
---

Resumo e Ações:`,
      createdAt: generatePastDate(5),
      updatedAt: generatePastDate(2),
    },
    {
      id: 'aiprompt-2',
      title: 'Gerar Função Python para Soma de Pares',
      description: 'Cria uma função Python que recebe uma lista de números e retorna a soma de todos os números pares na lista.',
      useCase: 'Geração de Código',
      promptText: `Escreva uma função Python chamada 'soma_numeros_pares' que:
1. Aceite um argumento: uma lista de inteiros.
2. Itere sobre a lista.
3. Some todos os números que são pares.
4. Retorne a soma total dos números pares.
5. Se a lista estiver vazia ou não contiver números pares, deve retornar 0.
Inclua uma docstring explicando o que a função faz, seus argumentos e o que ela retorna.
Adicione dois exemplos de uso simples com a função print.`,
      createdAt: generatePastDate(10),
      updatedAt: generatePastDate(10),
    },
    {
      id: 'aiprompt-3',
      title: 'Brainstorm de Títulos para Post de Blog',
      description: 'Ajuda a gerar 5 títulos criativos e otimizados para SEO para um post de blog sobre um tópico específico.',
      useCase: 'Brainstorming de Ideias',
      promptText: `Gere 5 ideias criativas e atraentes para títulos de posts de blog sobre o tema: "[INSERIR TEMA AQUI]".
Para cada título, sugira:
- Uma breve justificativa (1 frase) do porquê o título é bom.
- 2-3 palavras-chave principais que o título e o post deveriam focar.

Considere o público-alvo: [Descrever o público-alvo, se aplicável, e.g., "profissionais de marketing digital", "iniciantes em programação"].`,
      createdAt: generatePastDate(3),
      updatedAt: generatePastDate(1),
    },
    {
      id: 'aiprompt-4',
      title: 'Traduzir Texto (Inglês para Português BR)',
      description: 'Traduz um texto do inglês para o português brasileiro, mantendo o tom e o significado originais.',
      useCase: 'Tradução',
      promptText: `Traduza o seguinte texto do inglês para o português brasileiro. Mantenha o significado original, o tom (formal/informal) e as nuances culturais, se possível.

Texto em Inglês:
---
[COLAR TEXTO EM INGLÊS AQUI]
---

Tradução para Português (BR):`,
      createdAt: generatePastDate(15),
      updatedAt: generatePastDate(5),
    },
    {
      id: 'aiprompt-5',
      title: 'Explicar Conceito Complexo de Forma Simples',
      description: 'Simplifica a explicação de um conceito técnico ou complexo para um público leigo ou iniciante.',
      useCase: 'Explicação',
      promptText: `Explique o conceito de "[INSERIR CONCEITO COMPLEXO AQUI]" de forma simples e clara, como se estivesse explicando para alguém que nunca ouviu falar sobre isso antes (por exemplo, um adolescente ou um completo iniciante na área).
Use analogias do dia a dia, se possível, e evite jargões técnicos ao máximo.
O objetivo é que a pessoa entenda a ideia central do conceito.
Estruture a explicação em 2-3 parágrafos curtos.`,
      createdAt: generatePastDate(8),
      updatedAt: generatePastDate(3),
    },
    {
      id: 'aiprompt-6',
      title: 'Criar Descrição de Produto Otimizada',
      description: 'Gera uma descrição de produto persuasiva e otimizada para e-commerce, destacando benefícios e características.',
      useCase: 'Redação de Marketing',
      promptText: `Crie uma descrição de produto para e-commerce para o seguinte item:
Nome do Produto: [NOME DO PRODUTO]
Principais Características: [LISTAR 3-5 CARACTERÍSTICAS IMPORTANTES]
Público-Alvo: [DESCRIBER O PÚBLICO]
Benefício Principal: [QUAL O MAIOR BENEFÍCIO/SOLUÇÃO QUE O PRODUTO OFERECE?]

A descrição deve:
- Ser persuasiva e engajadora.
- Destacar os benefícios para o cliente.
- Incluir as principais características de forma natural.
- Ter entre 100 e 150 palavras.
- Usar 2-3 palavras-chave relevantes para SEO (sugira quais seriam).
- Ter um call-to-action sutil no final.`,
      createdAt: generatePastDate(12),
      updatedAt: generatePastDate(4),
    }
  ];
};

export const getAIPrompts = (): AIPrompt[] => {
  const storedPrompts = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedPrompts) {
    try {
      const parsed = JSON.parse(storedPrompts) as AIPrompt[];
      return parsed.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (e) {
      console.error("Failed to parse AI prompts from localStorage", e);
    }
  }
  const initialPrompts = getInitialAIPrompts();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialPrompts));
  return initialPrompts.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const addAIPrompt = (promptData: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>): AIPrompt => {
  const prompts = getAIPrompts();
  const now = new Date().toISOString();
  const newPrompt: AIPrompt = {
    ...promptData,
    id: `aiprompt-${new Date().getTime()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  const updatedPrompts = [newPrompt, ...prompts];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPrompts));
  return newPrompt;
};

export const updateAIPrompt = (updatedPromptData: AIPrompt): AIPrompt => {
  let prompts = getAIPrompts();
  const now = new Date().toISOString();
  const finalUpdatedPrompt = { ...updatedPromptData, updatedAt: now };
  prompts = prompts.map(prompt => (prompt.id === finalUpdatedPrompt.id ? finalUpdatedPrompt : prompt));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prompts));
  return finalUpdatedPrompt;
};

export const deleteAIPrompt = (promptId: string): void => {
  let prompts = getAIPrompts();
  prompts = prompts.filter(prompt => prompt.id !== promptId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prompts));
};
