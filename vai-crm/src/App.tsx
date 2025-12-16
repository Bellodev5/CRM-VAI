import { useState, useEffect } from "react";
import { useLocalState } from "./utils/storage";
import { Deal, User } from "./types";
import { exportCSV } from "./utils/export";
import { api } from "./services/api";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { DealForm } from "./components/forms/DealForm";
import { ImportSheet } from "./components/import/ImportSheet";
import { TreinamentoCard } from "./components/cards/TreinamentoCard";
import { ExperienciaCard } from "./components/cards/ExperienciaCard";
import { Dashboard } from "./components/reports/Dashboard";
import { Relatorios } from "./components/reports/Relatorios";
import { RelatorioTreinamento } from "./components/reports/RelatorioTreinamento";
import { ConfirmacaoVendas } from "./components/dashboard/ConfirmacaoVendas";
import { Section } from "./components/common/Section";
import { Button } from "./components/common/Button";
import { Icons } from "./components/common/Icons";

function App() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [settings] = useLocalState("vai_crm_settings_v2", {
    brand: {
      title: "VAI CRM",
      subtitle: "Sistema de Gestão de Vendas",
      primary: "#f97316",
      accent: "#0f172a",
    },
  });

  const [user, setUser] = useLocalState<User>("vai_crm_user_v2", {
    name: "Administrador",
    role: "Gerencia",
  });

  const [activeTab, setActiveTab] = useState<string>("vendas");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");

  // 🔥 CARREGAR VENDAS DA API AO INICIAR
  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      console.log('🔵 Carregando vendas da API...');
      setLoading(true);
      const response = await api.get('/deals');
      console.log('✅ Vendas carregadas:', response);
      
      // DEBUG: Verificar dados recebidos
      if (response.data && response.data.length > 0) {
        console.log('📊 Primeiro deal retornado:', response.data[0]);
        console.log('📊 Total do primeiro deal:', response.data[0].total);
        console.log('📊 Subtototal do primeiro deal:', response.data[0].subtotal);
      }
      
      console.log('✅ Total de vendas carregadas:', response.data?.length || 0);
      setDeals(response.data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar vendas:', error);
      alert('Erro ao carregar vendas do servidor');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ADICIONAR VENDA NA API - VERSÃO CORRIGIDA SEM COMPROVANTE GRANDE
  const addDeal = async (newDeal: Deal) => {
    try {
      console.log('🔵 Salvando venda na API:', newDeal);
      
      // DEBUG: Verificar valores recebidos
      console.log('💰 Valor total recebido do DealForm:', newDeal.total);
      console.log('💰 Valor subtotal recebido do DealForm:', newDeal.subtotal);
      
      // ⚠️ REMOVER COMPROVANTE PARA EVITAR REQUEST MUITO GRANDE
      // O comprovante (base64) pode ser muito grande e causar "request entity too large"
      const { comprovante, ...dealSemComprovante } = newDeal;
      
      // Garantir que o objeto tenha os campos corretos antes de enviar
      const dealParaEnviar = {
        ...dealSemComprovante,
        // Garantir que os valores sejam números
        total: Number(newDeal.total) || 0,
        subtotal: Number(newDeal.subtotal) || 0,
        qtdConexoes: Number(newDeal.qtdConexoes) || 0,
        qtdUsuarios: Number(newDeal.qtdUsuarios) || 0,
        qtdUraCanais: Number(newDeal.qtdUraCanais) || 0,
        qtdIaCanais: Number(newDeal.qtdIaCanais) || 0,
        qtdApiOficial: Number(newDeal.qtdApiOficial) || 0,
        leadsValor: Number(newDeal.leadsValor) || 0,
        desconto: Number(newDeal.desconto) || 0,
        // Enviar comprovante apenas se for pequeno (menos de 5000 caracteres)
        comprovante: newDeal.comprovante && newDeal.comprovante.length < 5000 
          ? newDeal.comprovante 
          : ""
      };
      
      console.log('📤 Deal para enviar (sem comprovante grande):', dealParaEnviar);
      console.log('💰 Total a ser enviado para o banco:', dealParaEnviar.total);
      console.log('📏 Tamanho do comprovante:', newDeal.comprovante?.length || 0);
      
      const response = await api.post('/deals', dealParaEnviar);
      console.log('✅ Resposta da API:', response);
      
      if (response.success) {
        // Recarregar lista de vendas
        await loadDeals();
        alert('✅ Venda cadastrada com sucesso!');
      } else {
        alert('❌ Erro: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar venda:', error);
      alert('❌ Erro ao salvar venda no servidor. Verifique o console para detalhes.');
    }
  };

  // 🔥 ATUALIZAR VENDA NA API
  const updateDeal = async (updatedDeal: Deal) => {
    try {
      console.log('🔵 Atualizando venda na API:', updatedDeal);
      
      // ⚠️ REMOVER COMPROVANTE PARA EVITAR REQUEST MUITO GRANDE
      const { comprovante, ...dealSemComprovante } = updatedDeal;
      
      // Garantir valores numéricos
      const dealParaEnviar = {
        ...dealSemComprovante,
        total: Number(updatedDeal.total) || 0,
        subtotal: Number(updatedDeal.subtotal) || 0
      };
      
      await api.put(`/deals/${updatedDeal.id}`, dealParaEnviar);
      console.log('✅ Venda atualizada no banco');
      
      // Atualizar localmente
      setDeals(deals.map((d) => (d.id === updatedDeal.id ? dealParaEnviar : d)));
    } catch (error) {
      console.error('❌ Erro ao atualizar venda:', error);
      alert('❌ Erro ao atualizar venda no servidor');
    }
  };

  const confirmarPagamento = (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (deal) {
      const dealAtualizado = { 
        ...deal, 
        pagamentoConfirmado: true 
      };
      updateDeal(dealAtualizado);
    }
  };

  const exportDeals = () => {
    exportCSV("vendas_vai.csv", deals.map(d => ({
      Data: new Date(d.createdAt).toLocaleDateString(),
      Vendedor: d.owner,
      Empresa: d.empresa,
      CNPJ: d.cnpj,
      Responsavel: d.responsavel,
      WhatsApp: d.whatsapp,
      Email: d.email || "",
      Status: d.status,
      Pagamento: d.pagamentoConfirmado ? "OK" : "Pendente",
      Total: d.total,
    })));
  };

  const canVendas = ["Vendedor", "Gerencia"].includes(user.role);
  const canQualidade = ["Suporte", "Gerencia"].includes(user.role);
  const canTreinamento = ["Treinamento", "Gerencia"].includes(user.role);

  const filtroDeals = deals.filter(d => {
    if (ownerFilter && d.owner !== ownerFilter) return false;
    if (dateFrom) {
      const when = new Date(d.createdAt);
      const from = new Date(dateFrom);
      if (when < from) return false;
    }
    if (dateTo) {
      const when = new Date(d.createdAt);
      const to = new Date(dateTo);
      if (when > to) return false;
    }
    return true;
  });

  const estatisticas = {
    total: deals.length,
    ativos: deals.filter(d => d.status === "ativo").length,
    inativos: deals.filter(d => d.status === "inativo").length,
    atraso: deals.filter(d => d.status === "atraso").length,
  };

  const vendasPendentesQualidade = deals.filter(
    d => !d.pagamentoConfirmado || !d.qualidadeOK || !d.agendaOk
  );

  const treinamentosPendentes = deals.filter(
    d => d.status === "treinamento_pendente" || d.status === "treinamento_agendado"
  );

  const experienciaAtiva = deals.filter(d => d.status === "experiencia");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando vendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        settings={settings}
        user={user}
        setUser={setUser}
        onExport={exportDeals}
        onImport={<ImportSheet onRecords={(rows) => console.log(rows)} />}
        onConfig={() => {}}
      />

      <main className="max-w-7xl mx-auto p-3 md:p-6">
        {/* Navegação */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={() => setActiveTab("vendas")}
            className={activeTab === "vendas" ? "bg-orange-500 text-white" : ""}
          >
            <Icons.Home size={16} className="inline mr-2" />
            Vendas
          </Button>
          <Button
            onClick={() => setActiveTab("qualidade")}
            className={activeTab === "qualidade" ? "bg-orange-500 text-white" : ""}
          >
            <Icons.Check size={16} className="inline mr-2" />
            Qualidade
          </Button>
          <Button
            onClick={() => setActiveTab("treinamento")}
            className={activeTab === "treinamento" ? "bg-orange-500 text-white" : ""}
          >
            <Icons.Calendar size={16} className="inline mr-2" />
            Treinamento
          </Button>
          <Button
            onClick={() => setActiveTab("experiencia")}
            className={activeTab === "experiencia" ? "bg-orange-500 text-white" : ""}
          >
            <Icons.Clock size={16} className="inline mr-2" />
            Experiência
          </Button>
          <Button
            onClick={() => setActiveTab("dashboard")}
            className={activeTab === "dashboard" ? "bg-orange-500 text-white" : ""}
          >
            <Icons.BarChart3 size={16} className="inline mr-2" />
            Dashboard
          </Button>
          <Button
            onClick={() => setActiveTab("relatorios")}
            className={activeTab === "relatorios" ? "bg-orange-500 text-white" : ""}
          >
            <Icons.FileBarChart size={16} className="inline mr-2" />
            Relatórios
          </Button>
        </div>

        {/* Conteúdo das abas */}
        {activeTab === "vendas" && canVendas && (
          <Section 
            title="Cadastrar Nova Venda" 
            right={
              <div className="text-sm text-slate-600">
                Total: {deals.length} vendas • Ativas: {estatisticas.ativos}
              </div>
            }
          >
            <DealForm 
              onSave={addDeal} 
              currentUser={user}
            />
          </Section>
        )}

        {activeTab === "qualidade" && canQualidade && (
          <>
            <Section title="Confirmação de Vendas">
              <ConfirmacaoVendas 
                deals={vendasPendentesQualidade} 
                onConfirmar={confirmarPagamento} 
              />
            </Section>

            {vendasPendentesQualidade.length === 0 && (
              <Section title="Qualidade - Aprovações Pendentes">
                <div className="text-center py-8 text-slate-500">
                  <Icons.Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <p>Todas as vendas estão aprovadas pela qualidade!</p>
                </div>
              </Section>
            )}
          </>
        )}

        {activeTab === "treinamento" && canTreinamento && (
          <>
            <Section title="Relatório de Treinamentos">
              <RelatorioTreinamento deals={treinamentosPendentes} />
            </Section>

            <Section title="Agendamento de Treinamento">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {treinamentosPendentes.map((deal) => (
                  <TreinamentoCard
                    key={deal.id}
                    deal={deal}
                    onUpdate={updateDeal}
                    onAdvance={updateDeal}
                  />
                ))}
              </div>
              {treinamentosPendentes.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Icons.Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p>Nenhum treinamento pendente no momento.</p>
                </div>
              )}
            </Section>
          </>
        )}

        {activeTab === "experiencia" && canTreinamento && (
          <Section title="Período de Experiência (30 dias)">
            <div className="space-y-4">
              {experienciaAtiva.map((deal) => (
                <ExperienciaCard
                  key={deal.id}
                  deal={deal}
                  onUpdate={updateDeal}
                  onAdvance={updateDeal}
                />
              ))}
              {experienciaAtiva.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Icons.Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p>Nenhum cliente em período de experiência no momento.</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {activeTab === "dashboard" && (
          <Section title="Dashboard de Performance">
            <Dashboard 
              deals={filtroDeals} 
              dateFrom={dateFrom} 
              dateTo={dateTo} 
              owner={ownerFilter} 
            />
          </Section>
        )}

        {activeTab === "relatorios" && (
          <Section 
            title="Relatórios" 
            right={
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
                  className="border rounded px-2 py-1"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
                  className="border rounded px-2 py-1"
                />
                <select
                  value={ownerFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOwnerFilter(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">Todos vendedores</option>
                  {Array.from(new Set(deals.map(d => d.owner).filter(Boolean))).map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            }
          >
            <Relatorios deals={filtroDeals} onExport={exportDeals} />
          </Section>
        )}

        {/* Acesso negado */}
        {!canVendas && activeTab === "vendas" && (
          <Section title="Acesso Restrito">
            <div className="text-center py-8 text-red-500">
              <Icons.Settings className="w-12 h-12 mx-auto mb-4" />
              <p className="font-semibold">Seu perfil não tem permissão para cadastrar vendas.</p>
              <p className="text-sm mt-2">Contate um administrador para alterar suas permissões.</p>
            </div>
          </Section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;