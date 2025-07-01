
import { Policy, PolicyCategory, PolicyFile } from '../types';

const LOCAL_STORAGE_KEY = 'corporatePolicies';

const getInitialPolicies = (): Policy[] => {
  const now = new Date().toISOString();
  const generatePastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'policy-1',
      title: 'Política de Home Office',
      description: 'Diretrizes e melhores práticas para o trabalho remoto, incluindo segurança da informação e comunicação.',
      category: PolicyCategory.RH,
      files: [
        { id: 'file-1-1', name: 'Manual_Home_Office.pdf', type: 'application/pdf', size: 1200000 },
        { id: 'file-1-2', name: 'Termo_Responsabilidade_Equipamentos.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 45000 },
      ],
      createdAt: generatePastDate(10),
      updatedAt: generatePastDate(10),
    },
    {
      id: 'policy-2',
      title: 'Código de Conduta e Ética',
      description: 'Define os padrões de comportamento esperados de todos os colaboradores da empresa, promovendo um ambiente de respeito e integridade.',
      category: PolicyCategory.COMPLIANCE,
      files: [
        { id: 'file-2-1', name: 'Codigo_Conduta_v1.2.pdf', type: 'application/pdf', size: 850000 },
      ],
      createdAt: generatePastDate(5),
      updatedAt: generatePastDate(3),
    },
    {
      id: 'policy-3',
      title: 'Política de Reembolso de Despesas',
      description: 'Procedimentos e limites para reembolso de despesas relacionadas ao trabalho, como viagens e alimentação.',
      category: PolicyCategory.FINANCEIRO,
      files: [
         { id: 'file-3-1', name: 'Formulario_Reembolso.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 75000 },
         { id: 'file-3-2', name: 'FAQ_Despesas.pdf', type: 'application/pdf', size: 300000 },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'policy-4',
      title: 'Uso de Software e Licenças',
      description: 'Regras para instalação e uso de softwares nos equipamentos da empresa, respeitando as licenças e a segurança.',
      category: PolicyCategory.TI,
      files: [], // No files initially
      createdAt: generatePastDate(20),
      updatedAt: generatePastDate(15),
    },
    {
      id: 'policy-5',
      title: 'Política de Segurança da Informação',
      description: 'Medidas e responsabilidades para proteger os ativos de informação da empresa contra acessos não autorizados e perdas.',
      category: PolicyCategory.TI,
      files: [
        { id: 'file-5-1', name: 'PSI_Completa.pdf', type: 'application/pdf', size: 2500000 },
        { id: 'file-5-2', name: 'Guia_Rapido_Seguranca.pptx', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 1500000 },
      ],
      createdAt: generatePastDate(30),
      updatedAt: generatePastDate(5),
    },
    {
      id: 'policy-6',
      title: 'Política de Férias e Licenças',
      description: 'Regulamentação sobre a marcação de férias, tipos de licenças remuneradas e não remuneradas e seus procedimentos.',
      category: PolicyCategory.RH,
      files: [
        { id: 'file-6-1', name: 'Normas_Ferias_Licencas.pdf', type: 'application/pdf', size: 600000 },
      ],
      createdAt: generatePastDate(45),
      updatedAt: generatePastDate(45),
    },
    {
      id: 'policy-7',
      title: 'Política de Dress Code',
      description: 'Orientações sobre o vestuário adequado para o ambiente de trabalho, considerando diferentes situações e eventos.',
      category: PolicyCategory.RH,
      files: [
        { id: 'file-7-1', name: 'Guia_Vestuario.pdf', type: 'application/pdf', size: 950000 },
        { id: 'file-7-2', name: 'Exemplos_DressCode.png', type: 'image/png', size: 2200000 },
      ],
      createdAt: generatePastDate(12),
      updatedAt: generatePastDate(2),
    },
    {
      id: 'policy-8',
      title: 'Política de Uso de Veículos da Empresa',
      description: 'Normas para a utilização dos veículos da frota corporativa, incluindo manutenção e responsabilidades.',
      category: PolicyCategory.FINANCEIRO, // Could also be Geral or Operacional
      files: [
        { id: 'file-8-1', name: 'Manual_Uso_Veiculos.pdf', type: 'application/pdf', size: 780000 },
      ],
      createdAt: generatePastDate(60),
      updatedAt: generatePastDate(25),
    },
    {
      id: 'policy-9',
      title: 'Política de Prevenção à Lavagem de Dinheiro',
      description: 'Procedimentos e controles internos para prevenir o uso da empresa em atividades de lavagem de dinheiro.',
      category: PolicyCategory.COMPLIANCE,
      files: [
        { id: 'file-9-1', name: 'PLD_FT_Diretrizes.pdf', type: 'application/pdf', size: 1100000 },
      ],
      createdAt: generatePastDate(90),
      updatedAt: generatePastDate(10),
    },
    {
      id: 'policy-10',
      title: 'Política de Gerenciamento de Crises',
      description: 'Planos de ação e comunicação para lidar com situações de crise que possam afetar a empresa.',
      category: PolicyCategory.GERAL,
      files: [
        { id: 'file-10-1', name: 'Plano_Gestao_Crises.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 350000 },
      ],
      createdAt: generatePastDate(22),
      updatedAt: generatePastDate(22),
    },
    {
      id: 'policy-11',
      title: 'Política de Diversidade e Inclusão',
      description: 'Compromisso da empresa com a promoção de um ambiente de trabalho diverso, inclusivo e equitativo para todos.',
      category: PolicyCategory.RH,
      files: [
        { id: 'file-11-1', name: 'Compromisso_Diversidade.pdf', type: 'application/pdf', size: 550000 },
      ],
      createdAt: generatePastDate(18),
      updatedAt: generatePastDate(1),
    },
    {
      id: 'policy-12',
      title: 'Normas para Utilização de Equipamentos de TI',
      description: 'Diretrizes para o uso correto e seguro de computadores, notebooks, celulares e outros dispositivos fornecidos pela empresa.',
      category: PolicyCategory.TI,
      files: [
        { id: 'file-12-1', name: 'Manual_Equipamentos_TI.pdf', type: 'application/pdf', size: 1300000 },
      ],
      createdAt: generatePastDate(35),
      updatedAt: generatePastDate(15),
    },
    {
      id: 'policy-13',
      title: 'Política de Concessão de Crédito a Clientes',
      description: 'Critérios e procedimentos para análise e concessão de crédito a clientes da empresa.',
      category: PolicyCategory.FINANCEIRO,
      files: [
        { id: 'file-13-1', name: 'Analise_Credito_Clientes.pdf', type: 'application/pdf', size: 880000 },
      ],
      createdAt: generatePastDate(50),
      updatedAt: generatePastDate(20),
    },
    {
      id: 'policy-14',
      title: 'Política de Privacidade de Dados de Colaboradores',
      description: 'Como a empresa coleta, utiliza, armazena e protege os dados pessoais dos seus colaboradores.',
      category: PolicyCategory.COMPLIANCE,
      files: [
        { id: 'file-14-1', name: 'Privacidade_Dados_Colaboradores.pdf', type: 'application/pdf', size: 720000 },
      ],
      createdAt: generatePastDate(8),
      updatedAt: generatePastDate(8),
    },
    {
      id: 'policy-15',
      title: 'Procedimento para Solicitação de Compras',
      description: 'Passo a passo para solicitar a compra de materiais, equipamentos ou serviços necessários para o trabalho.',
      category: PolicyCategory.FINANCEIRO,
      files: [
        { id: 'file-15-1', name: 'Fluxo_Solicitacao_Compras.png', type: 'image/png', size: 450000 },
        { id: 'file-15-2', name: 'Formulario_Padrao_Compras.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 60000 },
      ],
      createdAt: generatePastDate(25),
      updatedAt: generatePastDate(6),
    },
    {
      id: 'policy-16',
      title: 'Política de Saúde e Segurança no Trabalho (SST)',
      description: 'Diretrizes para garantir um ambiente de trabalho seguro e saudável, prevenindo acidentes e doenças ocupacionais.',
      category: PolicyCategory.RH, // Or Geral, depending on company structure
      files: [
        { id: 'file-16-1', name: 'Manual_SST.pdf', type: 'application/pdf', size: 1900000 },
      ],
      createdAt: generatePastDate(70),
      updatedAt: generatePastDate(30),
    },
    {
      id: 'policy-17',
      title: 'Manual de Integração de Novos Colaboradores',
      description: 'Guia completo para o processo de onboarding, apresentando a empresa, cultura, benefícios e informações essenciais.',
      category: PolicyCategory.RH,
      files: [
        { id: 'file-17-1', name: 'Guia_Onboarding.pdf', type: 'application/pdf', size: 3500000 },
        { id: 'file-17-2', name: 'Checklist_Integracao.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 90000 },
      ],
      createdAt: generatePastDate(4),
      updatedAt: generatePastDate(4),
    },
    {
      id: 'policy-18',
      title: 'Política de Backup e Recuperação de Dados',
      description: 'Procedimentos para a realização de backups regulares dos dados da empresa e planos para recuperação em caso de desastres.',
      category: PolicyCategory.TI,
      files: [
        { id: 'file-18-1', name: 'Normas_Backup_Recuperacao.pdf', type: 'application/pdf', size: 650000 },
      ],
      createdAt: generatePastDate(40),
      updatedAt: generatePastDate(12),
    },
    {
      id: 'policy-19',
      title: 'Regulamento do Programa de Participação nos Lucros (PLR)',
      description: 'Critérios, metas e forma de cálculo e pagamento da Participação nos Lucros e Resultados.',
      category: PolicyCategory.FINANCEIRO,
      files: [
        { id: 'file-19-1', name: 'Regulamento_PLR_Atual.pdf', type: 'application/pdf', size: 500000 },
      ],
      createdAt: generatePastDate(100),
      updatedAt: generatePastDate(18),
    },
    {
      id: 'policy-20',
      title: 'Política de Uso de Redes Sociais Corporativas',
      description: 'Diretrizes para o uso adequado das plataformas de comunicação interna e redes sociais da empresa.',
      category: PolicyCategory.COMPLIANCE,
      files: [],
      createdAt: generatePastDate(15),
      updatedAt: generatePastDate(7),
    },
     {
      id: 'policy-21',
      title: 'Política de Investimentos e Alocação de Capital',
      description: 'Princípios e diretrizes que norteiam as decisões de investimento e alocação de capital da empresa.',
      category: PolicyCategory.FINANCEIRO,
      files: [
        { id: 'file-21-1', name: 'Diretrizes_Investimento.pdf', type: 'application/pdf', size: 920000 },
      ],
      createdAt: generatePastDate(200),
      updatedAt: generatePastDate(50),
    },
    {
      id: 'policy-22',
      title: 'Procedimento para Resposta a Incidentes de Segurança',
      description: 'Plano de ação detalhado para identificar, conter, erradicar e recuperar de incidentes de segurança da informação.',
      category: PolicyCategory.TI,
      files: [
        { id: 'file-22-1', name: 'Plano_Resposta_Incidentes.pdf', type: 'application/pdf', size: 1250000 },
      ],
      createdAt: generatePastDate(28),
      updatedAt: generatePastDate(9),
    },
    {
      id: 'policy-23',
      title: 'Política de Desenvolvimento e Treinamento de Colaboradores',
      description: 'Estratégias e programas para o desenvolvimento contínuo das competências e habilidades dos colaboradores.',
      category: PolicyCategory.RH,
      files: [
        { id: 'file-23-1', name: 'Programa_Capacitacao.pdf', type: 'application/pdf', size: 750000 },
        { id: 'file-23-2', name: 'Catalogo_Cursos_Internos.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 120000 },
      ],
      createdAt: generatePastDate(33),
      updatedAt: generatePastDate(11),
    },
    {
      id: 'policy-24',
      title: 'Gestão de Fornecedores e Terceiros',
      description: 'Processos para seleção, homologação, monitoramento e avaliação de fornecedores e prestadores de serviço.',
      category: PolicyCategory.COMPLIANCE,
      files: [
        { id: 'file-24-1', name: 'Manual_Gestao_Fornecedores.pdf', type: 'application/pdf', size: 980000 },
      ],
      createdAt: generatePastDate(55),
      updatedAt: generatePastDate(16),
    }
  ];
};

export const getPolicies = (): Policy[] => {
  const storedPolicies = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedPolicies) {
    try {
      const parsed = JSON.parse(storedPolicies) as Policy[];
      return parsed.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (e) {
      console.error("Failed to parse policies from localStorage", e);
    }
  }
  const initialPolicies = getInitialPolicies();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialPolicies));
  return initialPolicies.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const addPolicy = (policyData: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Policy => {
  const policies = getPolicies();
  const now = new Date().toISOString();
  const newPolicy: Policy = {
    ...policyData,
    id: `policy-${new Date().getTime()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  const updatedPolicies = [...policies, newPolicy];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPolicies));
  return newPolicy;
};

export const updatePolicy = (updatedPolicyData: Policy): Policy => {
  let policies = getPolicies();
  const now = new Date().toISOString();
  const finalUpdatedPolicy = { ...updatedPolicyData, updatedAt: now };
  policies = policies.map(policy => (policy.id === finalUpdatedPolicy.id ? finalUpdatedPolicy : policy));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(policies));
  return finalUpdatedPolicy;
};

export const deletePolicy = (policyId: string): void => {
  let policies = getPolicies();
  policies = policies.filter(policy => policy.id !== policyId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(policies));
};