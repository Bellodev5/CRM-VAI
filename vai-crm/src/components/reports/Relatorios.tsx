import { useMemo, useState } from "react";
import { Deal } from "../../types";
import { money } from "../../utils/calculations";
import { Section } from "../common/Section";
import { Label } from "../common/Label";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";

type RelatoriosProps = {
  deals: Deal[];
  onExport: () => void;
};

// Função para converter snake_case para camelCase
const snakeToCamel = (obj: any): Deal => {
  if (!obj) return obj;
  
  return {
    id: obj.id,
    createdAt: obj.created_at || obj.createdAt || new Date().toISOString(),
    owner_id: obj.owner_id || obj.ownerId,
    owner: obj.owner,
    status: obj.status,
    produto: obj.produto,
    empresa: obj.empresa,
    cnpj: obj.cnpj,
    responsavel: obj.responsavel,
    whatsapp: obj.whatsapp,
    email: obj.email,
    formaPagamento: obj.forma_pagamento || obj.formaPagamento,
    qtdConexoes: obj.qtd_conexoes || obj.qtdConexoes || 0,
    qtdUsuarios: obj.qtd_usuarios || obj.qtdUsuarios || 0,
    plataformaHabilitada: obj.plataforma_habilitada || obj.plataformaHabilitada || false,
    qtdUraCanais: obj.qtd_ura_canais || obj.qtdUraCanais || 0,
    qtdIaCanais: obj.qtd_ia_canais || obj.qtdIaCanais || 0,
    qtdApiOficial: obj.qtd_api_oficial || obj.qtdApiOficial || 0,
    leadsValor: obj.leads_valor || obj.leadsValor || 0,
    desconto: obj.desconto || 0,
    subtotal: obj.subtotal || 0,
    total: obj.total || 0,
    treinamentoData: obj.treinamento_data || obj.treinamentoData,
    treinamentoHora: obj.treinamento_hora || obj.treinamentoHora,
    treinamentoStatus: obj.treinamento_status || obj.treinamentoStatus || "pendente",
    tipoVenda: obj.tipo_venda || obj.tipoVenda || "nova",
    pagamentoConfirmado: obj.pagamento_confirmado || obj.pagamentoConfirmado || false,
    agendaOk: obj.agenda_ok || obj.agendaOk || false,
    qualidadeOK: obj.qualidade_ok || obj.qualidadeOK || false,
    observacoes: obj.observacoes || [],
    comprovante: obj.comprovante || ""
  };
};

export function Relatorios({ deals, onExport }: RelatoriosProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [vendedor, setVendedor] = useState("");

  // Converter deals para camelCase
  const dealsNormalizados = useMemo(() => {
    console.log("📊 Deals recebidos no Relatorios:", deals);
    const normalizados = deals.map(snakeToCamel);
    console.log("📊 Deals normalizados:", normalizados);
    console.log("💰 Primeiro deal - total:", normalizados[0]?.total, "pagamento:", normalizados[0]?.pagamentoConfirmado);
    return normalizados;
  }, [deals]);

  const vendedores = Array.from(
    new Set(dealsNormalizados.map((d) => d.owner).filter(Boolean))
  ) as string[];

  const filtered = useMemo(() => {
    const df = dateFrom ? new Date(dateFrom) : null;
    const dt = dateTo ? new Date(dateTo) : null;
    return dealsNormalizados.filter((d) => {
      if (vendedor && d.owner !== vendedor) return false;
      const when = new Date(d.createdAt);
      if (df && when < df) return false;
      if (dt && when > dt) return false;
      return true;
    });
  }, [dealsNormalizados, vendedor, dateFrom, dateTo]);

  const headers = [
    "Data",
    "Vendedor",
    "Empresa",
    "CNPJ",
    "Responsável",
    "WhatsApp",
    "Email",
    "Status",
    "Pagamento",
    "Total",
  ];

  const rows = filtered.map((d) => [
    new Date(d.createdAt).toLocaleDateString(),
    d.owner || "-",
    d.empresa,
    d.cnpj,
    d.responsavel,
    d.whatsapp,
    d.email || "",
    d.status.toUpperCase(),
    d.pagamentoConfirmado ? "OK" : "Pendente",
    money(d.total || 0),
  ]);

  // Cálculo do total faturado CORRIGIDO
  const totalFaturado = filtered
    .filter((d) => d.pagamentoConfirmado)
    .reduce((s, d) => s + Number(d.total || 0), 0);

  console.log("💰 Calculando total faturado:");
  console.log("🔍 Total de deals filtrados:", filtered.length);
  console.log("✅ Deals com pagamento confirmado:", filtered.filter(d => d.pagamentoConfirmado).length);
  console.log("💰 Soma total:", totalFaturado);

  return (
    <Section
      title="Relatórios & Resultado Mensal"
      right={
        <>
          <Button onClick={onExport}>Exportar CSV</Button>
        </>
      }
    >
      <div className="grid md:grid-cols-4 gap-3 mb-3">
        <div>
          <Label>De</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <Label>Até</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Vendedor</Label>
          <Select value={vendedor} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVendedor(e.target.value)}>
            <option value="">Todos</option>
            {vendedores.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </div>
      </div>
      
      {filtered.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="text-left px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b">
                    {r.map((c, j) => (
                      <td key={j} className="px-3 py-2 whitespace-nowrap">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-100 p-3 rounded-lg">
                <div className="text-slate-600">Total de registros:</div>
                <div className="text-lg font-bold">{filtered.length}</div>
              </div>
              
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <div className="text-emerald-600">Total geral:</div>
                <div className="text-lg font-bold text-emerald-800">
                  {money(filtered.reduce((sum, d) => sum + Number(d.total || 0), 0))}
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-blue-600">Total faturado:</div>
                <div className="text-lg font-bold text-blue-800">
                  {money(totalFaturado)}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {filtered.filter(d => d.pagamentoConfirmado).length} vendas confirmadas
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-slate-500">
          Nenhuma venda encontrada com os filtros selecionados.
        </div>
      )}
    </Section>
  );
}