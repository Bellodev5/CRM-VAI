import { Deal, Produto } from "../types";
import { UNIT_PRICE } from "../constants";

export const newId = () =>
  crypto?.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2);

export const money = (n: number) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function getProdutoBasePrice(produto: Produto | ""): number {
  switch (produto) {
    case "VAI Simples":
      return 150;
    case "VAI + Canais Sociais":
      return 350;
    case "VAI + Canais + IA":
      return 550;
    case "VAI + Canais + IA + URA":
      return 850;
    case "VAI + Canais + IA + URA + Consultoria":
      return 1200;
    default:
      return 0;
  }
}

export function calcTotal(d: Deal) {
  if (d.valorManual) {
    const total = Number(d.valorManual) || 0;
    return { subtotal: total, total };
  }
  
  const subtotal = (
    getProdutoBasePrice(d.produto) +
    d.qtdConexoes * UNIT_PRICE.conexaoWhatsapp +
    d.qtdUsuarios * UNIT_PRICE.usuario +
    (d.plataformaHabilitada ? UNIT_PRICE.plataforma : 0) +
    d.qtdUraCanais * UNIT_PRICE.uraCanal +
    d.qtdIaCanais * UNIT_PRICE.iaCanal +
    d.qtdApiOficial * UNIT_PRICE.apiOficial +
    (Number(d.leadsValor) || 0)
  );
  
  const desconto = Number(d.desconto) || 0;
  const total = Math.max(0, subtotal - desconto);
  
  return { subtotal, total };
}

export const BLANK_DEAL = (owner: string, owner_id?: number): Deal => ({
  id: newId(),
  createdAt: new Date().toISOString(),
  owner,
  owner_id,
  status: "treinamento_pendente",
  
  produto: "",
  
  empresa: "",
  cnpj: "",
  responsavel: "",
  whatsapp: "",
  email: "",
  
  formaPagamento: "",
  
  qtdConexoes: 0,
  qtdUsuarios: 0,
  plataformaHabilitada: true,
  qtdUraCanais: 0,
  qtdIaCanais: 0,
  qtdApiOficial: 0,
  leadsValor: 0,
  
  desconto: 0,
  subtotal: 0,
  total: 0,
  
  treinamentoData: "",
  treinamentoHora: "",
  treinamentoStatus: "pendente",
  
  tipoVenda: "nova",
  comprovante: "",
  
  pagamentoConfirmado: false,
  agendaOk: false,
  qualidadeOK: false,
  
  observacoes: Array.from({ length: 30 }, () => ({ 
    data: "", 
    nota: "" 
  })),
});