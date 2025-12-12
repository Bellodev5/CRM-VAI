import { useState, useMemo } from "react";
import { Deal } from "../../types";
import { Icons } from "../common/Icons";
import { Input } from "../common/Input";
import { Label } from "../common/Label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

type PerformanceChartsProps = {
  deals: Deal[];
  metaMensal: number;
  onMetaChange: (meta: number) => void;
};

type VendedorPerformance = {
  vendedor: string;
  vendas: number;
  recorrencia: number;
  meta: number;
  percentualAtingido: number;
};

// Removido o tipo não utilizado localmente

export function PerformanceCharts({ deals, metaMensal, onMetaChange }: PerformanceChartsProps) {
  const [metaInput, setMetaInput] = useState(metaMensal.toString());
  
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);
  
  const vendedores = Array.from(new Set(deals.map(d => d.owner).filter(Boolean)));
  
  const performanceVendedores = useMemo(() => {
    const performance: VendedorPerformance[] = [];
    
    vendedores.forEach(vendedor => {
      const vendasVendedor = deals.filter(d => d.owner === vendedor);
      const vendasNormais = vendasVendedor.filter(d => d.status !== "ativo");
      const vendasRecorrencia = vendasVendedor.filter(d => d.status === "ativo");
      
      const totalVendas = vendasNormais.reduce((sum, d) => sum + (d.total || 0), 0);
      const totalRecorrencia = vendasRecorrencia.reduce((sum, d) => sum + (d.total || 0), 0);
      const metaVendedor = metaMensal / (vendedores.length || 1);
      const percentual = metaVendedor > 0 ? ((totalVendas + totalRecorrencia) / metaVendedor) * 100 : 0;
      
      performance.push({
        vendedor: vendedor || "Sem Vendedor",
        vendas: totalVendas,
        recorrencia: totalRecorrencia,
        meta: metaVendedor,
        percentualAtingido: Math.min(percentual, 100)
      });
    });
    
    return performance.sort((a, b) => b.vendas - a.vendas);
  }, [deals, vendedores, metaMensal]);
  
  const vendasPorDia = useMemo(() => {
    const dias = eachDayOfInterval({ start: inicioMes, end: fimMes });
    const vendasPorData = new Map<string, number>();
    
    deals.forEach(deal => {
      const dataVenda = parseISO(deal.createdAt);
      const dataStr = format(dataVenda, 'yyyy-MM-dd');
      const valorAtual = vendasPorData.get(dataStr) || 0;
      vendasPorData.set(dataStr, valorAtual + (deal.total || 0));
    });
    
    const metaDiaria = metaMensal / dias.length;
    
    return dias.map(dia => {
      const dataStr = format(dia, 'yyyy-MM-dd');
      const totalVendas = vendasPorData.get(dataStr) || 0;
      
      return {
        data: format(dia, 'dd/MM'),
        total: totalVendas,
        meta: metaDiaria,
        diaDaSemana: format(dia, 'EEEE', { locale: ptBR })
      };
    });
  }, [deals, inicioMes, fimMes, metaMensal]);
  
  const totalVendidoMes = useMemo(() => 
    deals.reduce((sum, d) => sum + (d.total || 0), 0)
  , [deals]);
  
  const percentualMeta = metaMensal > 0 ? (totalVendidoMes / metaMensal) * 100 : 0;
  
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
      onMetaChange(novaMeta);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Meta Mensal</p>
              <div className="mt-1">
                <div className="text-2xl font-bold text-blue-800">
                  R$ {metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-blue-600">
                  <div className="flex items-center gap-2 mt-1">
                    <Label className="text-blue-700">Definir meta:</Label>
                    <div className="relative">
                      <Icons.DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-500" size={14} />
                      <Input
                        type="number"
                        value={metaInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMetaChange(e.target.value)}
                        className="pl-7 w-32 text-sm h-8 border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Icons.DollarSign className="text-blue-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Total Vendido</p>
              <div className="text-2xl font-bold text-emerald-800 mt-1">
                R$ {totalVendidoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                Este mês ({format(hoje, 'MMMM', { locale: ptBR })})
              </p>
            </div>
            <Icons.DollarSign className="text-emerald-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Progresso da Meta</p>
              <div className="text-2xl font-bold text-orange-800 mt-1">
                {percentualMeta.toFixed(1)}%
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percentualMeta, 100)}%` }}
                />
              </div>
              <p className="text-xs text-orange-600 mt-1">
                {totalVendidoMes >= metaMensal ? "Meta atingida! 🎉" : "Em andamento"}
              </p>
            </div>
            <Icons.BarChart3 className="text-orange-400" size={24} />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icons.Calendar className="text-orange-500" size={20} />
            <h3 className="text-lg font-semibold text-slate-900">Vendas vs Meta Diária</h3>
          </div>
          <div className="text-sm text-slate-500">
            {format(inicioMes, 'dd/MM')} a {format(fimMes, 'dd/MM')}
          </div>
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={vendasPorDia}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="data" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="Vendas Realizadas"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
              />
              <Line
                type="monotone"
                dataKey="meta"
                name="Meta Diária"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icons.User className="text-orange-500" size={20} />
            <h3 className="text-lg font-semibold text-slate-900">Performance por Vendedor</h3>
          </div>
          <div className="text-sm text-slate-500">
            Total: {vendedores.length} vendedores
          </div>
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceVendedores}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="vendedor" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {performanceVendedores.map((vendedor, index) => (
            <div 
              key={vendedor.vendedor} 
              className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {vendedor.vendedor.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-900 truncate">
                    {vendedor.vendedor}
                  </span>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  vendedor.percentualAtingido >= 100 
                    ? "bg-green-100 text-green-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {vendedor.percentualAtingido.toFixed(0)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Novas Vendas:</span>
                  <span className="font-medium text-blue-600">
                    R$ {vendedor.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Recorrência:</span>
                  <span className="font-medium text-emerald-600">
                    R$ {vendedor.recorrencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Meta Individual:</span>
                  <span className="font-medium text-purple-600">
                    R$ {vendedor.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(vendedor.percentualAtingido, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}