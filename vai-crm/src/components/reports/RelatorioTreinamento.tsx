import { useMemo, useState } from "react";
import { Deal } from "../../types";
import { Icons } from "../common/Icons";
import { Input } from "../common/Input";
import { Label } from "../common/Label";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { money } from "../../utils/calculations";

type RelatorioTreinamentoProps = {
  deals: Deal[];
};

export function RelatorioTreinamento({ deals }: RelatorioTreinamentoProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroVendedor, setFiltroVendedor] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<Deal[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const VENDEDORES_FIXOS = ["Elison", "Cris", "Rodrigo", "Parceiros"];
  const vendedoresExistentes = Array.from(new Set(deals.map(d => d.owner).filter(Boolean)));
  const vendedores = Array.from(new Set([...VENDEDORES_FIXOS, ...vendedoresExistentes]));

  const buscarEmpresas = (termo: string) => {
    if (!termo.trim()) {
      setResultadosBusca([]);
      setMostrarResultados(false);
      return;
    }
    
    const termoLower = termo.toLowerCase();
    const resultados = deals.filter(d => {
      return (
        d.empresa.toLowerCase().includes(termoLower) ||
        d.responsavel.toLowerCase().includes(termoLower) ||
        d.whatsapp.includes(termo) ||
        (d.cnpj && d.cnpj.includes(termo))
      );
    });
    
    setResultadosBusca(resultados);
    setMostrarResultados(true);
  };

  const treinamentos = useMemo(() => {
    return deals.filter(d => {
      if (filtroStatus !== "todos" && d.treinamentoStatus !== filtroStatus) {
        return false;
      }
      
      if (filtroVendedor !== "todos" && d.owner !== filtroVendedor) {
        return false;
      }
      
      if (busca) {
        const termo = busca.toLowerCase();
        return (
          d.empresa.toLowerCase().includes(termo) ||
          d.responsavel.toLowerCase().includes(termo) ||
          d.whatsapp.includes(termo) ||
          (d.cnpj && d.cnpj.includes(termo))
        );
      }
      
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [deals, filtroStatus, filtroVendedor, busca]);

  const estatisticas = useMemo(() => {
    const total = deals.filter(d => d.treinamentoStatus).length;
    const pendentes = deals.filter(d => d.treinamentoStatus === "pendente").length;
    const agendados = deals.filter(d => d.treinamentoStatus === "agendado").length;
    const concluidos = deals.filter(d => d.treinamentoStatus === "concluido").length;
    const cancelados = deals.filter(d => d.treinamentoStatus === "cancelado").length;
    
    return { total, pendentes, agendados, concluidos, cancelados };
  }, [deals]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "bg-yellow-100 text-yellow-800";
      case "agendado": return "bg-blue-100 text-blue-800";
      case "concluido": return "bg-emerald-100 text-emerald-800";
      case "cancelado": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pendente": return "Pendente";
      case "agendado": return "Agendado";
      case "concluido": return "Concluído";
      case "cancelado": return "Cancelado";
      default: return "Sem status";
    }
  };
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-3 md:p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 mt-1">
            {estatisticas.total}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">Treinamentos</div>
        </div>
        
        <div className="bg-white rounded-lg md:rounded-xl border border-yellow-200 p-3 md:p-4 shadow-sm">
          <div className="text-xs text-yellow-600 font-medium">Pendentes</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-yellow-600 mt-1">
            {estatisticas.pendentes}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">Aguardando</div>
        </div>
        
        <div className="bg-white rounded-lg md:rounded-xl border border-blue-200 p-3 md:p-4 shadow-sm">
          <div className="text-xs text-blue-600 font-medium">Agendados</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600 mt-1">
            {estatisticas.agendados}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">Marcados</div>
        </div>
        
        <div className="bg-white rounded-lg md:rounded-xl border border-emerald-200 p-3 md:p-4 shadow-sm">
          <div className="text-xs text-emerald-600 font-medium">Concluídos</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-emerald-600 mt-1">
            {estatisticas.concluidos}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">Finalizados</div>
        </div>
        
        <div className="bg-white rounded-lg md:rounded-xl border border-red-200 p-3 md:p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs text-red-600 font-medium">Cancelados</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-red-600 mt-1">
            {estatisticas.cancelados}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">Não realizados</div>
        </div>
      </div>

      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-200 p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div>
            <Label>Status</Label>
            <Select
              value={filtroStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroStatus(e.target.value)}
              className="text-sm md:text-base"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="agendado">Agendado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </div>
          
          <div>
            <Label>Vendedor</Label>
            <Select
              value={filtroVendedor}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroVendedor(e.target.value)}
              className="text-sm md:text-base"
            >
              <option value="todos">Todos os vendedores</option>
              {vendedores.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <Label>Buscar empresa, responsável ou WhatsApp</Label>
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                value={busca}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setBusca(e.target.value);
                  buscarEmpresas(e.target.value);
                }}
                placeholder="Digite nome da empresa, responsável, WhatsApp ou CNPJ..."
                className="pl-10 w-full text-sm md:text-base"
              />
              
              {mostrarResultados && resultadosBusca.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {resultadosBusca.map((deal) => (
                    <div 
                      key={deal.id}
                      className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      onClick={() => {
                        setBusca(deal.empresa);
                        setMostrarResultados(false);
                      }}
                    >
                      <div className="font-medium text-slate-900">{deal.empresa}</div>
                      <div className="text-sm text-slate-600">
                        {deal.responsavel} • {deal.whatsapp}
                      </div>
                      {deal.cnpj && (
                        <div className="text-xs text-slate-500">CNPJ: {deal.cnpj}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Busque por nome da empresa, responsável, WhatsApp ou CNPJ
            </div>
          </div>
        </div>
        
        {(filtroStatus !== "todos" || filtroVendedor !== "todos" || busca) && (
          <div className="mt-3 md:mt-4">
            <Button
              onClick={() => {
                setFiltroStatus("todos");
                setFiltroVendedor("todos");
                setBusca("");
                setResultadosBusca([]);
                setMostrarResultados(false);
              }}
              className="text-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Icons.Filter className="inline mr-2" size={14} />
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Icons.Info className="text-blue-500" size={18} />
          <div className="text-sm text-blue-700">
            Mostrando <span className="font-bold">{treinamentos.length}</span> treinamentos
            {filtroStatus !== "todos" && ` com status "${filtroStatus}"`}
            {filtroVendedor !== "todos" && ` do vendedor "${filtroVendedor}"`}
            {busca && ` para busca "${busca}"`}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                    Empresa
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                    Responsável
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                    Vendedor
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                    Data/Hora
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                    Valor
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {treinamentos.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50">
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-medium text-slate-900">{deal.empresa}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[150px]">{deal.cnpj || "Sem CNPJ"}</div>
                      <div className="text-sm text-slate-600 sm:hidden mt-1">
                        Vendedor: {deal.owner}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{deal.responsavel}</div>
                      <div className="text-sm text-slate-500">{deal.whatsapp}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-slate-900 hidden sm:table-cell">
                      {deal.owner}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-slate-900 hidden md:table-cell">
                      {deal.treinamentoData ? (
                        <div>
                          <div>{new Date(deal.treinamentoData).toLocaleDateString('pt-BR')}</div>
                          <div className="text-slate-500">{deal.treinamentoHora}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Não agendado</span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.treinamentoStatus)}`}>
                        {getStatusText(deal.treinamentoStatus)}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm font-bold text-slate-900 hidden lg:table-cell">
                      {money(deal.total || 0)}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col sm:flex-row gap-1 md:gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                          onClick={() => window.open(`https://wa.me/55${deal.whatsapp.replace(/\D/g, '')}`, '_blank')}
                        >
                          <Icons.Phone size={12} className="inline mr-1" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </Button>
                        <Button
                          size="sm"
                          className="bg-orange-50 text-orange-600 hover:bg-orange-100 text-xs px-2 py-1"
                        >
                          <Icons.Calendar size={12} className="inline mr-1" />
                          <span className="hidden sm:inline">Agendar</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {treinamentos.length === 0 && (
          <div className="text-center py-8 md:py-12 px-4 text-slate-500">
            <Icons.FileText className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-3 md:mb-4" />
            <p className="text-sm md:text-base">Nenhum treinamento encontrado com os filtros selecionados.</p>
            {(filtroStatus !== "todos" || filtroVendedor !== "todos" || busca) && (
              <p className="text-xs text-slate-400 mt-2">
                Tente limpar os filtros para ver todos os treinamentos.
              </p>
            )}
          </div>
        )}
        
        {treinamentos.length > 0 && (
          <div className="border-t border-slate-200 px-4 md:px-6 py-3 bg-slate-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <div className="text-sm text-slate-600">
                Mostrando <span className="font-semibold">{treinamentos.length}</span> de{" "}
                <span className="font-semibold">{deals.length}</span> treinamentos
              </div>
              <div className="text-sm text-slate-600">
                Valor total: <span className="font-bold text-orange-600">
                  {money(treinamentos.reduce((sum, d) => sum + (d.total || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}