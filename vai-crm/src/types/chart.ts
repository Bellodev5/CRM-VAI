// src/types/charts.ts
export type VendedorPerformance = {
  vendedor: string;
  vendas: number;
  recorrencia: number;
  meta: number;
  percentualAtingido: number;
};

export type VendaPorDia = {
  data: string;
  total: number;
  meta: number;
  diaDaSemana: string;
};

export type VendaPorProduto = {
  produto: string;
  quantidade: number;
  total: number;
};