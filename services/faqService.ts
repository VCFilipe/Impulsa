
import { FAQ, PolicyCategory } from '../types';

const LOCAL_STORAGE_KEY = 'corporateFAQs';

const getInitialFAQs = (): FAQ[] => {
  const now = new Date().toISOString();
  const generatePastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'faq-1',
      question: 'Como solicitar férias?',
      answer: 'As férias devem ser solicitadas através do Portal do Colaborador, na seção "Minhas Solicitações", com antecedência mínima de 30 dias. Consulte a Política de Férias para mais detalhes sobre fracionamento e períodos aquisitivos.',
      category: PolicyCategory.RH,
      createdAt: generatePastDate(15),
      updatedAt: generatePastDate(15),
    },
    {
      id: 'faq-2',
      question: 'Qual o procedimento para reembolso de despesas de viagem?',
      answer: 'O reembolso é feito mediante apresentação de notas fiscais e preenchimento do formulário de despesas disponível na Intranet (Seção Financeiro > Reembolsos). O prazo para solicitação é de até 15 dias após o término da viagem. Consulte a Política de Reembolso para limites e tipos de despesas elegíveis.',
      category: PolicyCategory.FINANCEIRO,
      createdAt: generatePastDate(10),
      updatedAt: generatePastDate(5),
    },
    {
      id: 'faq-3',
      question: 'Esqueci minha senha da rede/VPN, como proceder?',
      answer: 'Para redefinir sua senha da rede ou VPN, acesse o portal de autoatendimento de senhas (link na página inicial da Intranet) ou entre em contato com o Suporte de TI através do ramal 5000 ou abrindo um chamado no sistema HelpDesk TI.',
      category: PolicyCategory.TI,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'faq-4',
      question: 'Onde encontro o Código de Conduta da empresa?',
      answer: 'O Código de Conduta está disponível na seção "Políticas" deste portal (categoria Compliance) e também foi enviado por e-mail para todos os colaboradores no momento da admissão ou atualização. É fundamental a leitura e compreensão deste documento.',
      category: PolicyCategory.COMPLIANCE,
      createdAt: generatePastDate(20),
      updatedAt: generatePastDate(2),
    },
    {
        id: 'faq-5',
        question: 'Como funciona o programa de indicação de novos talentos?',
        answer: 'Nosso programa "Indique um Talento" oferece bônus por indicações efetivadas. Detalhes sobre os critérios de elegibilidade, valores dos bônus e o formulário de indicação estão na página de Carreiras Internas do Portal RH.',
        category: PolicyCategory.RH,
        createdAt: generatePastDate(7),
        updatedAt: generatePastDate(7),
    },
    {
        id: 'faq-6',
        question: 'Quais são os horários de funcionamento do refeitório e quais refeições são servidas?',
        answer: 'O refeitório funciona para café da manhã das 07:00 às 09:00, almoço das 11:30 às 14:00 (com opções de prato principal, vegetariano, saladas e sobremesas), e lanche da tarde (frutas e snacks) das 16:00 às 17:00.',
        category: PolicyCategory.GERAL,
        createdAt: generatePastDate(3),
        updatedAt: generatePastDate(1),
    },
    {
      id: 'faq-7',
      question: 'Como acesso meu holerite (contracheque)?',
      answer: 'Seu holerite está disponível online no Portal do Colaborador, na seção "Financeiro > Meus Documentos". Geralmente é liberado até o 5º dia útil do mês.',
      category: PolicyCategory.FINANCEIRO,
      createdAt: generatePastDate(25),
      updatedAt: generatePastDate(25),
    },
    {
      id: 'faq-8',
      question: 'Preciso instalar um software específico no meu computador. Qual o procedimento?',
      answer: 'A instalação de qualquer software não padrão deve ser solicitada via chamado no HelpDesk TI. A equipe de TI avaliará a necessidade, compatibilidade e licença antes da instalação. Consulte a "Política de Uso de Software e Licenças".',
      category: PolicyCategory.TI,
      createdAt: generatePastDate(12),
      updatedAt: generatePastDate(4),
    },
    {
      id: 'faq-9',
      question: 'Como reportar uma violação ao Código de Conduta ou uma preocupação ética?',
      answer: 'Você pode reportar violações ou preocupações através do Canal de Denúncias anônimo (link disponível na Intranet e na Política de Compliance) ou diretamente ao seu gestor, RH ou departamento de Compliance.',
      category: PolicyCategory.COMPLIANCE,
      createdAt: generatePastDate(30),
      updatedAt: generatePastDate(10),
    },
    {
      id: 'faq-10',
      question: 'A empresa oferece algum benefício para saúde e bem-estar além do plano de saúde?',
      answer: 'Sim! Oferecemos programas como ginástica laboral, parcerias com academias (Gympass), acompanhamento psicológico através de plataforma online e campanhas de vacinação. Consulte a seção "Benefícios" no Portal RH para mais detalhes.',
      category: PolicyCategory.RH,
      createdAt: generatePastDate(18),
      updatedAt: generatePastDate(6),
    },
    {
      id: 'faq-11',
      question: 'Qual é a política para trabalho em feriados?',
      answer: 'O trabalho em feriados é excepcional e deve ser aprovado previamente pelo gestor. Geralmente, há compensação em banco de horas ou pagamento adicional, conforme a legislação e a política interna. Detalhes na Política de Jornada de Trabalho.',
      category: PolicyCategory.RH,
      createdAt: generatePastDate(40),
      updatedAt: generatePastDate(15),
    },
    {
      id: 'faq-12',
      question: 'Como solicitar um novo crachá em caso de perda ou dano?',
      answer: 'Em caso de perda ou dano do crachá, comunique imediatamente ao departamento de Segurança Patrimonial ou RH para bloqueio e solicitação de uma nova via. Pode haver um custo para a segunda via em caso de perda, conforme política interna.',
      category: PolicyCategory.GERAL,
      createdAt: generatePastDate(9),
      updatedAt: generatePastDate(9),
    },
    {
      id: 'faq-13',
      question: 'Posso usar o e-mail corporativo para fins pessoais?',
      answer: 'O e-mail corporativo destina-se primariamente a comunicações profissionais. Usos pessoais esporádicos e breves são tolerados, desde que não infrinjam as políticas de segurança, código de conduta ou sobrecarreguem os sistemas. Consulte a Política de Uso de Recursos de TI.',
      category: PolicyCategory.TI,
      createdAt: generatePastDate(22),
      updatedAt: generatePastDate(8),
    },
    {
      id: 'faq-14',
      question: 'Como funciona o adiantamento salarial (vale)?',
      answer: 'A empresa oferece a possibilidade de adiantamento de uma porcentagem do salário, geralmente pago no dia 20 de cada mês. A adesão é opcional e pode ser feita através do Portal do Colaborador. Verifique as condições na Política de Remuneração.',
      category: PolicyCategory.FINANCEIRO,
      createdAt: generatePastDate(50),
      updatedAt: generatePastDate(20),
    },
    {
      id: 'faq-15',
      question: 'Quais são os procedimentos em caso de emergência médica no escritório?',
      answer: 'Em caso de emergência médica, acione imediatamente a brigada de emergência interna (ramal 1900) ou o serviço de segurança. Temos kits de primeiros socorros e profissionais treinados. Conheça as rotas de fuga e pontos de encontro.',
      category: PolicyCategory.GERAL,
      createdAt: generatePastDate(60),
      updatedAt: generatePastDate(30),
    },
    {
      id: 'faq-16',
      question: 'A empresa possui política de home office flexível ou híbrido?',
      answer: 'Sim, possuímos uma Política de Home Office que detalha os critérios de elegibilidade, responsabilidades e formato (integral, híbrido). Converse com seu gestor e consulte a política na seção RH para entender as possibilidades para sua função.',
      category: PolicyCategory.RH,
      createdAt: generatePastDate(5),
      updatedAt: generatePastDate(5),
    },
    {
      id: 'faq-17',
      question: 'Como obter suporte para o sistema XPTO que usamos no departamento?',
      answer: 'Para suporte específico do sistema XPTO, consulte o manual do usuário disponível na pasta compartilhada do seu departamento ou abra um chamado no HelpDesk TI, categoria "Sistemas Corporativos", especificando o nome do sistema.',
      category: PolicyCategory.TI,
      createdAt: generatePastDate(14),
      updatedAt: generatePastDate(3),
    },
    {
      id: 'faq-18',
      question: 'Posso levar visitantes para conhecer o escritório?',
      answer: 'Visitas devem ser agendadas e aprovadas previamente. O colaborador anfitrião é responsável por registrar o visitante na recepção e acompanhá-lo durante toda a permanência nas instalações. Consulte a Política de Acesso e Segurança.',
      category: PolicyCategory.GERAL,
      createdAt: generatePastDate(28),
      updatedAt: generatePastDate(11),
    },
    {
      id: 'faq-19',
      question: 'O que é o programa de PLR (Participação nos Lucros e Resultados) e quem é elegível?',
      answer: 'O PLR é um programa que distribui uma parcela dos lucros da empresa entre os colaboradores, com base no atingimento de metas individuais e coletivas. Todos os funcionários efetivos são elegíveis. O regulamento completo está na seção Políticas > Financeiro.',
      category: PolicyCategory.FINANCEIRO,
      createdAt: generatePastDate(90),
      updatedAt: generatePastDate(45),
    },
    {
      id: 'faq-20',
      question: 'Como posso me candidatar a vagas internas?',
      answer: 'As vagas internas são divulgadas no Portal do Colaborador, na seção "Carreiras > Oportunidades Internas". Você pode se candidatar diretamente pela plataforma. Encorajamos o desenvolvimento e a mobilidade interna!',
      category: PolicyCategory.RH,
      createdAt: generatePastDate(11),
      updatedAt: generatePastDate(11),
    },
    {
      id: 'faq-21',
      question: 'Existe alguma restrição para uso de celular pessoal durante o horário de trabalho?',
      answer: 'O uso de celular pessoal é permitido com bom senso, para assuntos breves e urgentes. Em reuniões ou atividades que exijam foco, recomenda-se deixá-lo no silencioso. Evite distrações excessivas que comprometam sua produtividade e a dos colegas.',
      category: PolicyCategory.GERAL,
      createdAt: generatePastDate(16),
      updatedAt: generatePastDate(6),
    },
    {
      id: 'faq-22',
      question: 'Como funciona o sistema de avaliação de desempenho?',
      answer: 'Nossa avaliação de desempenho ocorre semestralmente e envolve autoavaliação, avaliação do gestor e feedback 360 (para algumas posições). O objetivo é identificar pontos fortes, áreas de desenvolvimento e alinhar expectativas. Mais informações no Portal RH > Desempenho.',
      category: PolicyCategory.RH,
      createdAt: generatePastDate(120),
      updatedAt: generatePastDate(60),
    },
    {
      id: 'faq-23',
      question: 'A empresa oferece algum tipo de auxílio-creche ou benefício para filhos?',
      answer: 'Sim, oferecemos auxílio-creche para filhos de colaboradores até uma certa idade, conforme os critérios definidos na nossa Política de Benefícios. Consulte o documento no Portal RH para verificar os valores e condições.',
      category: PolicyCategory.RH,
      createdAt: generatePastDate(75),
      updatedAt: generatePastDate(19),
    },
    {
      id: 'faq-24',
      question: 'Qual o processo para solicitar alteração de dados cadastrais (ex: endereço, estado civil)?',
      answer: 'Você pode solicitar a alteração dos seus dados cadastrais diretamente no Portal do Colaborador, na seção "Meus Dados". Para algumas alterações, como estado civil, pode ser necessário anexar documentação comprobatória.',
      category: PolicyCategory.RH,
      createdAt: generatePastDate(8),
      updatedAt: generatePastDate(8),
    },
    {
      id: 'faq-25',
      question: 'Como devo proceder se identificar um potencial conflito de interesses?',
      answer: 'Qualquer potencial conflito de interesses, real ou aparente, deve ser imediatamente comunicado ao seu gestor direto ou ao departamento de Compliance para análise e orientação. A transparência é fundamental. Consulte o Código de Conduta para exemplos.',
      category: PolicyCategory.COMPLIANCE,
      createdAt: generatePastDate(45),
      updatedAt: generatePastDate(13),
    },
     {
      id: 'faq-26',
      question: 'Como funciona o estacionamento para funcionários?',
      answer: 'O estacionamento é limitado e funciona por sistema de rodízio ou prioridade para determinados cargos. Verifique com o departamento Administrativo ou RH sobre a disponibilidade de vagas e os critérios para utilização.',
      category: PolicyCategory.GERAL,
      createdAt: generatePastDate(32),
      updatedAt: generatePastDate(17),
    }
  ];
};

export const getFAQs = (): FAQ[] => {
  const storedFAQs = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedFAQs) {
    try {
      const parsed = JSON.parse(storedFAQs) as FAQ[];
      // Sort by most recently updated first
      return parsed.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (e) {
      console.error("Failed to parse FAQs from localStorage", e);
    }
  }
  const initialFAQs = getInitialFAQs();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialFAQs));
  return initialFAQs.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const addFAQ = (faqData: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): FAQ => {
  const faqs = getFAQs();
  const now = new Date().toISOString();
  const newFAQ: FAQ = {
    ...faqData,
    id: `faq-${new Date().getTime()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  const updatedFAQs = [newFAQ, ...faqs]; // Add to the beginning
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFAQs));
  return newFAQ;
};

export const updateFAQ = (updatedFAQData: FAQ): FAQ => {
  let faqs = getFAQs();
  const now = new Date().toISOString();
  const finalUpdatedFAQ = { ...updatedFAQData, updatedAt: now };
  faqs = faqs.map(faq => (faq.id === finalUpdatedFAQ.id ? finalUpdatedFAQ : faq));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(faqs));
  return finalUpdatedFAQ;
};

export const deleteFAQ = (faqId: string): void => {
  let faqs = getFAQs();
  faqs = faqs.filter(faq => faq.id !== faqId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(faqs));
};