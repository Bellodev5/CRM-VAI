import { Deal } from "../types";

export function money(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

// Função para calcular valores com base no produto selecionado
export function calcTotal(deal: Deal): { subtotal: number; total: number } {
  // Preços base dos produtos
  const produtoPrecos: Record<string, number> = {
    "VAI Simples": 150,
    "VAI + Canais Sociais": 300,
    "VAI + Canais + IA": 500,
    "VAI + Canais + IA + URA": 750,
    "VAI + Canais + IA + URA + Consultoria": 1200
  };

  let subtotal = 0;
  
  // Adiciona valor do produto base
  if (deal.produto && produtoPrecos[deal.produto]) {
    subtotal += produtoPrecos[deal.produto];
  }
  
  // Adiciona conexões WhatsApp (R$ 25 cada)
  subtotal += (deal.qtdConexoes || 0) * 25;
  
  // Adiciona usuários (R$ 25 cada)
  subtotal += (deal.qtdUsuarios || 0) * 25;
  
  // Adiciona plataforma (R$ 100 se habilitada)
  subtotal += deal.plataformaHabilitada ? 100 : 0;
  
  // Adiciona URA (R$ 250 por canal)
  subtotal += (deal.qtdUraCanais || 0) * 250;
  
  // Adiciona IA (R$ 90 por canal)
  subtotal += (deal.qtdIaCanais || 0) * 90;
  
  // Adiciona API Oficial (R$ 50 por unidade)
  subtotal += (deal.qtdApiOficial || 0) * 50;
  
  // Adiciona valor dos leads
  subtotal += deal.leadsValor || 0;
  
  // Aplica desconto
  const desconto = deal.desconto || 0;
  let total = subtotal - desconto;
  
  // Se houver valor manual, usa ele
  if (deal.valorManual) {
    const valorManualNum = parseFloat(deal.valorManual);
    if (!isNaN(valorManualNum) && valorManualNum > 0) {
      total = valorManualNum;
    }
  }
  
  // Garante que não fique negativo
  total = Math.max(0, total);
  
  return { subtotal, total };
}

// Função para criar um deal em branco
export function BLANK_DEAL(ownerName: string, ownerId?: number): Deal {
  const today = new Date();
  const dataStr = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  
  return {
    id: '',
    createdAt: dataStr,
    owner_id: ownerId,
    owner: ownerName,
    status: 'novo',
    produto: '',
    empresa: '',
    cnpj: '',
    responsavel: '',
    whatsapp: '',
    email: '',
    formaPagamento: '',
    qtdConexoes: 0,
    qtdUsuarios: 0,
    plataformaHabilitada: false,
    qtdUraCanais: 0,
    qtdIaCanais: 0,
    qtdApiOficial: 0,
    leadsValor: 0,
    desconto: 0,
    subtotal: 0,
    total: 0,
    treinamentoData: '',
    treinamentoHora: '',
    treinamentoStatus: 'pendente',
    tipoVenda: 'nova',
    pagamentoConfirmado: false,
    agendaOk: false,
    qualidadeOK: false,
    observacoes: []
  };
}

// Função auxiliar para converter string para número seguro
export function safeNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}