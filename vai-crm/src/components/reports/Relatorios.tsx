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

export function Relatorios({ deals, onExport }: RelatoriosProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [vendedor, setVendedor] = useState("");

  const vendedores = Array.from(
    new Set(deals.map((d) => d.owner).filter(Boolean))
  ) as string[];

  const filtered = useMemo(() => {
    const df = dateFrom ? new Date(dateFrom) : null;
    const dt = dateTo ? new Date(dateTo) : null;
    return deals.filter((d) => {
      if (vendedor && d.owner !== vendedor) return false;
      const when = new Date(d.createdAt);
      if (df && when < df) return false;
      if (dt && when > dt) return false;
      return true;
    });
  }, [deals, vendedor, dateFrom, dateTo]);

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

  const totalFaturado = filtered
    .filter((d) => d.pagamentoConfirmado)
    .reduce((s, d) => s + Number(d.total || 0), 0);

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
        <b>Total faturado (filtrado):</b> {money(totalFaturado)}
      </div>
    </Section>
  );
}