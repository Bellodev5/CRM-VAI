// src/components/reports/Dashboard.tsx - VERSÃO COM MAPEAMENTO DE CAMPOS
import { useMemo, useState, useEffect } from "react";
import { Deal } from "../../types";
import { money } from "../../utils/calculations";
import { Icons } from "../common/Icons";
import { Input } from "../common/Input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocalState } from "../../utils/storage";

type DashboardProps = {
  deals: Deal[];
  dateFrom: string;
  dateTo: string;
  owner: string | "";
};

type VendedorPerformance = {
  vendedor: string;
  vendas: number;
  recorrencia: number;
  meta: number;
  percentualAtingido: number;
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

export function Dashboard({ deals, dateFrom, dateTo, owner }: DashboardProps) {
  const [metaMensal, setMetaMensal] = useLocalState<number>("vai_crm_meta_mensal", 50000);
  const [metaInput, setMetaInput] = useState(metaMensal.toString());
  
  // Converter deals de snake_case para camelCase
  const dealsNormalizados = useMemo(() => {
    console.log("📥 Deals recebidos (bruto):", deals);
    const normalizados = deals.map(snakeToCamel);
    console.log("📥 Deals normalizados (camelCase):", normalizados);
    return normalizados;
  }, [deals]);
  
  // Para debug
  useEffect(() => {
    console.log("🔄 Dashboard atualizado com deals:", dealsNormalizados.length);
    console.log("💰 Primeiro deal normalizado:", dealsNormalizados[0]);
    console.log("💰 Total do primeiro deal:", dealsNormalizados[0]?.total);
    console.log("💰 Pagamento confirmado?", dealsNormalizados[0]?.pagamentoConfirmado);
  }, [dealsNormalizados]);
  
  const filtered = useMemo(() => {
    const df = dateFrom ? new Date(dateFrom) : null;
    const dt = dateTo ? new Date(dateTo) : null;
    return dealsNormalizados.filter((d) => {
      if (owner && d.owner !== owner) return false;
      
      // Se não tiver createdAt, não incluir no filtro
      if (!d.createdAt) return false;
      
      try {
        const when = new Date(d.createdAt);
        if (isNaN(when.getTime())) return false;
        
        if (df && when < df) return false;
        if (dt && when > dt) return false;
        return true;
      } catch (error) {
        console.warn("Erro ao processar data do deal:", d.createdAt, error);
        return false;
      }
    });
  }, [dealsNormalizados, dateFrom, dateTo, owner]);
  
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);
  
  // Extrair vendedores de forma segura
  const vendedores = useMemo(() => {
    const owners = filtered
      .map(d => d?.owner)
      .filter(owner => owner && typeof owner === 'string' && owner.trim() !== "");
    
    return [...new Set(owners)] as string[];
  }, [filtered]);
  
  // Performance dos vendedores com validações
  const performanceVendedores = useMemo(() => {
    const performance: VendedorPerformance[] = [];
    
    vendedores.forEach(vendedor => {
      if (!vendedor || vendedor.trim() === "") return;
      
      const vendasVendedor = filtered.filter(d => d.owner === vendedor);
      const vendasNormais = vendasVendedor.filter(d => d.status !== "ativo");
      const vendasRecorrencia = vendasVendedor.filter(d => d.status === "ativo");
      
      const totalVendas = vendasNormais.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
      const totalRecorrencia = vendasRecorrencia.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
      const metaVendedor = metaMensal / (vendedores.length || 1);
      const percentual = metaVendedor > 0 ? ((totalVendas + totalRecorrencia) / metaVendedor) * 100 : 0;
      
      performance.push({
        vendedor: vendedor || "Sem Vendedor",
        vendas: totalVendas,
        recorrencia: totalRecorrencia,
        meta: metaVendedor,
        percentualAtingido: percentual
      });
    });
    
    return performance.sort((a, b) => b.vendas - a.vendas);
  }, [filtered, vendedores, metaMensal]);
  
  const vendasPorDia = useMemo(() => {
    const dias = eachDayOfInterval({ start: inicioMes, end: fimMes });
    const vendasPorData = new Map<string, number>();
    
    filtered.forEach(deal => {
      if (!deal.createdAt) {
        console.warn("Deal sem createdAt encontrado:", deal);
        return;
      }
      
      try {
        if (typeof deal.createdAt !== 'string') {
          console.warn("createdAt não é uma string:", deal.createdAt);
          return;
        }
        
        const dataVenda = parseISO(deal.createdAt);
        
        if (!isValid(dataVenda)) {
          console.warn("Data inválida após parseISO:", deal.createdAt);
          return;
        }
        
        const dataStr = format(dataVenda, 'yyyy-MM-dd');
        const valorAtual = vendasPorData.get(dataStr) || 0;
        vendasPorData.set(dataStr, valorAtual + (Number(deal.total) || 0));
      } catch (error) {
        console.warn("Erro ao processar data do deal:", deal.createdAt, error);
      }
    });
    
    return dias.map(dia => {
      const dataStr = format(dia, 'yyyy-MM-dd');
      const totalVendas = vendasPorData.get(dataStr) || 0;
      
      return {
        data: format(dia, 'dd/MM'),
        total: totalVendas,
        diaDaSemana: format(dia, 'EEEE', { locale: ptBR })
      };
    });
  }, [filtered, inicioMes, fimMes]);
  
  // CÁLCULOS CORRIGIDOS - Usando Number() para garantir que seja número
  const faturado = filtered
    .filter((d) => d.pagamentoConfirmado)
    .reduce((s, d) => s + Number(d.total || 0), 0);
    
  const ativos = filtered.filter((d) => d.status === "ativo").length;
  const inativos = filtered.filter((d) => d.status === "inativo").length;
  const atraso = filtered.filter((d) => d.status === "atraso").length;
  const pendentes = filtered.filter(d => d.status === "treinamento_pendente" || d.status === "treinamento_agendado").length;
  
  const totalVendidoMes = filtered.reduce((sum, d) => sum + Number(d.total || 0), 0);
  const percentualMeta = metaMensal > 0 ? (totalVendidoMes / metaMensal) * 100 : 0;
  const valorRestante = Math.max(0, metaMensal - totalVendidoMes);
  
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: p.color }}>
              {p.name}: <span className="font-medium">R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const handleMetaChange = (value: string) => {
    setMetaInput(value);
    const novaMeta = parseFloat(value.replace(',', '.'));
    if (!isNaN(novaMeta) && novaMeta >= 0) {
      setMetaMensal(novaMeta);
    }
  };

  const formatarNumero = (num: number) => {
    if (num >= 1000000) {
      return `R$ ${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `R$ ${(num / 1000).toFixed(0)}k`;
    }
    return `R$ ${num.toLocaleString('pt-BR')}`;
  };

  // Função segura para gerar iniciais
  const getIniciais = (nome: string | undefined) => {
    if (!nome || nome.trim() === "") return "SV";
    
    const partes = nome.split(' ').filter(n => n && n.length > 0);
    if (partes.length === 0) return "SV";
    
    const iniciais = partes
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    return iniciais;
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium truncate">Faturamento</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 mt-1 truncate">
            {money(faturado)}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">Confirmado</div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium truncate">Ativos</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-emerald-600 mt-1">{ativos}</div>
          <div className="text-xs text-slate-400 mt-1 truncate">Clientes ativos</div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium truncate">Inativos</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-red-600 mt-1">{inativos}</div>
          <div className="text-xs text-slate-400 mt-1 truncate">Clientes inativos</div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium truncate">Atraso</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-amber-600 mt-1">{atraso}</div>
          <div className="text-xs text-slate-400 mt-1 truncate">Pagamentos</div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm col-span-2 md:col-span-1">
          <div className="text-xs text-slate-500 font-medium truncate">Pendentes</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-purple-600 mt-1">{pendentes}</div>
          <div className="text-xs text-slate-400 mt-1 truncate">Treinamento</div>
        </div>
      </div>
      
      {/* Meta Mensal e Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div className="flex items-center gap-2">
              <Icons.DollarSign className="text-orange-500 flex-shrink-0" size={20} />
              <h3 className="text-base md:text-lg font-semibold text-slate-900 truncate">
                Progresso da Meta Mensal
              </h3>
            </div>
            <div className="text-sm text-slate-500">
              {format(inicioMes, 'MMMM', { locale: ptBR })}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900">
                  {percentualMeta.toFixed(1)}%
                </div>
                <div className={`text-lg font-bold ${
                  percentualMeta >= 100 
                    ? 'text-emerald-600' 
                    : 'text-orange-600'
                }`}>
                  {percentualMeta >= 100 ? '🎯 Meta Superada!' : 'Em andamento'}
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-slate-200 rounded-full h-4 md:h-5">
                  <div 
                    className={`h-4 md:h-5 rounded-full transition-all duration-700 ${
                      percentualMeta >= 100 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}
                    style={{ width: `${Math.min(percentualMeta, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs md:text-sm text-slate-600 mt-2">
                  <span>R$ 0</span>
                  <span>{formatarNumero(metaMensal)}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-medium mb-1">Meta Total</div>
                <div className="relative">
                  <Icons.DollarSign className="absolute left-0 top-1/2 transform -translate-y-1/2 text-blue-500" size={16} />
                  <Input
                    type="number"
                    value={metaInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMetaChange(e.target.value)}
                    className="pl-6 w-full text-base h-10 border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="text-lg font-bold text-blue-800 mt-1">
                  {formatarNumero(metaMensal)}
                </div>
              </div>
              
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <div className="text-xs text-emerald-600 font-medium mb-1">Atingido</div>
                <div className="text-2xl font-bold text-emerald-800">
                  {formatarNumero(totalVendidoMes)}
                </div>
                <div className="text-sm text-emerald-600 mt-1">
                  {percentualMeta.toFixed(1)}% da meta
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border ${
                valorRestante > 0 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className={`text-xs font-medium mb-1 ${
                  valorRestante > 0 ? 'text-orange-600' : 'text-emerald-600'
                }`}>
                  {valorRestante > 0 ? 'Restante' : 'Excedente'}
                </div>
                <div className={`text-2xl font-bold ${
                  valorRestante > 0 ? 'text-orange-800' : 'text-emerald-800'
                }`}>
                  {formatarNumero(Math.abs(valorRestante))}
                </div>
                <div className={`text-sm mt-1 ${
                  valorRestante > 0 ? 'text-orange-600' : 'text-emerald-600'
                }`}>
                  {valorRestante > 0 ? 'Para atingir a meta' : 'Meta superada em'}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-700">
                {percentualMeta >= 100 ? (
                  <div className="flex items-center gap-2">
                    <Icons.Check className="text-emerald-500" size={18} />
                    <span>
                      <strong>Parabéns!</strong> A meta de {formatarNumero(metaMensal)} foi superada em {formatarNumero(totalVendidoMes - metaMensal)} ({percentualMeta.toFixed(1)}%).
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Icons.Clock className="text-orange-500" size={18} />
                    <span>
                      <strong>Progresso:</strong> Faltam {formatarNumero(valorRestante)} para atingir a meta de {formatarNumero(metaMensal)} ({percentualMeta.toFixed(1)}% concluído).
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div className="flex items-center gap-2">
              <Icons.User className="text-orange-500 flex-shrink-0" size={20} />
              <h3 className="text-base md:text-lg font-semibold text-slate-900 truncate">
                Performance por Vendedor
              </h3>
            </div>
            <div className="text-sm text-slate-500">
              Total: {vendedores.length} vendedores
            </div>
          </div>
          
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceVendedores}
                margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="vendedor" 
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(value) => value >= 1000 ? `R$ ${(value/1000).toFixed(0)}k` : `R$ ${value}`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar 
                  dataKey="vendas" 
                  name="Novas Vendas" 
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="recorrencia" 
                  name="Recorrência" 
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Vendas por Dia */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div className="flex items-center gap-2">
            <Icons.Calendar className="text-orange-500 flex-shrink-0" size={20} />
            <h3 className="text-base md:text-lg font-semibold text-slate-900 truncate">
              Vendas por Dia
            </h3>
          </div>
          <div className="text-sm text-slate-500">
            {format(inicioMes, 'dd/MM')} a {format(fimMes, 'dd/MM')}
          </div>
        </div>
        
        <div className="h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={vendasPorDia}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="data" 
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(value) => value >= 1000 ? `R$ ${(value/1000).toFixed(0)}k` : `R$ ${value}`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="total"
                name="Vendas Realizadas"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 2 }}
                activeDot={{ r: 4, fill: '#1d4ed8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Desempenho Individual */}
      {performanceVendedores.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div className="flex items-center gap-2">
              <Icons.User className="text-orange-500 flex-shrink-0" size={20} />
              <h3 className="text-base md:text-lg font-semibold text-slate-900 truncate">
                Desempenho Individual
              </h3>
            </div>
            <div className="text-sm text-slate-500 text-right">
              Meta individual: {formatarNumero(metaMensal / (vendedores.length || 1))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {performanceVendedores.map((vendedor, index) => {
              if (!vendedor || !vendedor.vendedor) return null;
              
              return (
                <div 
                  key={vendedor.vendedor} 
                  className="border border-slate-200 rounded-lg p-3 md:p-4 hover:shadow-sm transition-shadow min-w-0"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {getIniciais(vendedor.vendedor)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-slate-900 text-sm md:text-base block truncate">
                          {vendedor.vendedor}
                        </span>
                        <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block truncate ${
                          vendedor.percentualAtingido >= 100 
                            ? "bg-green-100 text-green-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {vendedor.percentualAtingido.toFixed(0)}% da meta
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <div className="flex justify-between text-xs md:text-sm mb-1">
                        <span className="text-slate-600 truncate">Novas Vendas:</span>
                        <span className="font-medium text-blue-600 ml-2 text-right truncate">
                          {formatarNumero(vendedor.vendas)}
                        </span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                          style={{ 
                            width: `${vendedor.meta > 0 ? Math.min((vendedor.vendas / vendedor.meta) * 100, 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs md:text-sm mb-1">
                        <span className="text-slate-600 truncate">Recorrência:</span>
                        <span className="font-medium text-emerald-600 ml-2 text-right truncate">
                          {formatarNumero(vendedor.recorrencia)}
                        </span>
                      </div>
                      <div className="w-full bg-emerald-100 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ 
                            width: `${vendedor.meta > 0 ? Math.min((vendedor.recorrencia / vendedor.meta) * 100, 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs md:text-sm mb-1">
                        <span className="text-slate-600 truncate">Meta Individual:</span>
                        <span className="font-medium text-purple-600 ml-2 text-right truncate">
                          {formatarNumero(vendedor.meta)}
                        </span>
                      </div>
                      <div className="w-full bg-purple-100 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${Math.min(vendedor.percentualAtingido, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
          <div className="text-center py-8 text-slate-500">
            {filtered.length > 0 
              ? "Nenhum vendedor encontrado para o período selecionado." 
              : "Nenhuma venda encontrada para o período selecionado."}
          </div>
        </div>
      )}
    </div>
  );
}