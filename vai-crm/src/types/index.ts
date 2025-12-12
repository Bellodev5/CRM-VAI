export const PAYMENT_METHODS = ["Pix", "Credito", "Dinheiro", "Boleto"] as const;
export const ROLES = ["Vendedor", "Suporte", "Treinamento", "Gerencia"] as const;

export const PRODUTOS = [
  "VAI Simples",
  "VAI + Canais Sociais",
  "VAI + Canais + IA",
  "VAI + Canais + IA + URA",
  "VAI + Canais + IA + URA + Consultoria"
] as const;

export const PIPELINE = [
  { id: "novo", name: "Cadastro" },
  { id: "treinamento_pendente", name: "Treinamento Pendente" },
  { id: "treinamento_agendado", name: "Treinamento Agendado" },
  { id: "experiencia", name: "Experiência (30 dias)" },
  { id: "ativo", name: "Ativo" },
  { id: "inativo", name: "Inativo" },
  { id: "atraso", name: "Em Atraso" },
] as const;

export const VENDEDORES_FIXOS = [
  { id: 1, name: "Elison", role: "Vendedor" },
  { id: 2, name: "Cris", role: "Vendedor" },
  { id: 3, name: "Rodrigo", role: "Vendedor" },
  { id: 4, name: "Parceiros", role: "Vendedor" }
] as const;

export type Role = typeof ROLES[number];
export type PaymentMethod = typeof PAYMENT_METHODS[number];
export type PipelineStatus = typeof PIPELINE[number]["id"];
export type Produto = typeof PRODUTOS[number];
export type VendedorFixo = typeof VENDEDORES_FIXOS[number];

export type Deal = {
  id: string;
  createdAt: string;
  owner_id?: number;
  owner?: string;
  status: PipelineStatus;
  
  produto: Produto | "";
  
  empresa: string;
  cnpj: string;
  responsavel: string;
  whatsapp: string;
  email: string;
  
  formaPagamento: PaymentMethod | "";
  
  qtdConexoes: number;
  qtdUsuarios: number;
  plataformaHabilitada: boolean;
  qtdUraCanais: number;
  qtdIaCanais: number;
  qtdApiOficial: number;
  leadsValor: number;
  
  desconto: number;
  subtotal?: number;
  valorManual?: string;
  total?: number;
  
  treinamentoData: string;
  treinamentoHora: string;
  treinamentoStatus: "pendente" | "agendado" | "concluido" | "cancelado";

  tipoVenda: "nova" | "recorrencia";

  comprovante?: string;

  pagamentoConfirmado: boolean;
  agendaOk: boolean;
  qualidadeOK: boolean;
  
  observacoes: { data: string; nota: string }[];
};

export type User = {
  id?: number;
  name: string;
  email?: string;
  role: Role;
};

export type Settings = {
  brand: {
    title: string;
    subtitle: string;
    primary: string;
    accent: string;
  };
};