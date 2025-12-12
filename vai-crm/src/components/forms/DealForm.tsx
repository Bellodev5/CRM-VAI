import { useMemo, useState } from "react";
import { Deal, User, PRODUTOS, VENDEDORES_FIXOS } from "../../types";
import { PAYMENT_METHODS } from "../../types";
import { BLANK_DEAL, calcTotal, money } from "../../utils/calculations";
import { Label } from "../common/Label";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { Icons } from "../common/Icons";

type DealFormProps = {
  onSave: (d: Deal) => void;
  currentUser: User;
};

export function DealForm({ onSave, currentUser }: DealFormProps) {
  const [d, setD] = useState<Deal>(() => {
    const blankDeal = BLANK_DEAL(currentUser.name, currentUser.id);
    // Agora já começa com status pendente de treinamento
    return { ...blankDeal, status: "treinamento_pendente" };
  });

  const [tipoVenda, setTipoVenda] = useState<"nova" | "recorrencia">("nova");
  const [comprovantePreview, setComprovantePreview] = useState<string>("");

  const { subtotal, total } = useMemo(() => calcTotal(d), [d]);

  const set = (patch: Partial<Deal>) => setD((prev) => ({ ...prev, ...patch }));

  // Usar vendedores fixos em vez dos do banco
  const vendedores = VENDEDORES_FIXOS;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setComprovantePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ 
          ...d, 
          subtotal, 
          total, 
          status: "treinamento_pendente",
          tipoVenda,
          comprovante: comprovantePreview, // Salva como base64
          treinamentoStatus: "pendente" // NOVO
        });
        setD(BLANK_DEAL(currentUser.name, currentUser.id));
        setTipoVenda("nova");
        setComprovantePreview("");
      }}
      className="grid md:grid-cols-2 gap-3 md:gap-4"
    >
      {/* Dados do Sistema */}
      <div className="col-span-2 font-semibold text-slate-700 text-base md:text-lg border-b pb-2">
        Dados do Sistema
      </div>

      <div>
        <Label>Produto *</Label>
        <Select
          required
          value={d.produto}
          onChange={(e: any) => set({ produto: e.target.value })}
          className="text-sm md:text-base"
        >
          <option value="">Selecione o produto...</option>
          {PRODUTOS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Vendedor Responsável *</Label>
        <Select
          required
          value={d.owner_id}
          onChange={(e: any) => {
            const userId = Number(e.target.value);
            const vendedor = vendedores.find(v => v.id === userId);
            set({ 
              owner_id: userId, 
              owner: vendedor?.name || "" 
            });
          }}
          className="text-sm md:text-base"
        >
          <option value="">Selecione o vendedor...</option>
          {vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Empresa *</Label>
        <Input
          required
          value={d.empresa}
          onChange={(e: any) => set({ empresa: e.target.value })}
          placeholder="Nome da empresa"
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>Responsável *</Label>
        <Input
          required
          value={d.responsavel}
          onChange={(e: any) => set({ responsavel: e.target.value })}
          placeholder="Nome do responsável"
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>WhatsApp *</Label>
        <Input
          required
          value={d.whatsapp}
          onChange={(e: any) => set({ whatsapp: e.target.value })}
          placeholder="(00) 00000-0000"
                  className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>CNPJ (opcional)</Label>
        <Input
          value={d.cnpj}
          onChange={(e: any) => set({ cnpj: e.target.value })}
          placeholder="00.000.000/0000-00"
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>Email (opcional)</Label>
        <Input
          type="email"
          value={d.email}
          onChange={(e: any) => set({ email: e.target.value })}
          placeholder="email@empresa.com"
          className="text-sm md:text-base"
        />
      </div>

      {/* Produtos & Preços */}
      <div className="col-span-2 font-semibold text-slate-700 text-base md:text-lg border-b pb-2 mt-3 md:mt-4">
        Produtos & Preços
      </div>

      <div className="col-span-2 bg-slate-100 p-3 rounded-xl">
        <div className="text-sm text-slate-600">
          <strong>Produto Base:</strong> {d.produto || "Nenhum selecionado"} 
        </div>
      </div>

      <div>
        <Label>Cada conexão WhatsApp (R$ 25)</Label>
        <Input
          type="number"
          min={0}
          value={d.qtdConexoes}
          onChange={(e: any) => set({ qtdConexoes: Number(e.target.value) || 0 })}
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>Cada usuário (R$ 25)</Label>
        <Input
          type="number"
          min={0}
          value={d.qtdUsuarios}
          onChange={(e: any) => set({ qtdUsuarios: Number(e.target.value) || 0 })}
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>Plataforma (fixo R$ 100)</Label>
        <Select
          value={d.plataformaHabilitada ? "sim" : "nao"}
          onChange={(e: any) => set({ plataformaHabilitada: e.target.value === "sim" })}
          className="text-sm md:text-base"
        >
          <option value="sim">Incluir</option>
          <option value="nao">Não incluir</option>
        </Select>
      </div>

      <div>
        <Label>URA – nº de canais (R$ 250/canal)</Label>
        <Input
          type="number"
          min={0}
          value={d.qtdUraCanais}
          onChange={(e: any) => set({ qtdUraCanais: Number(e.target.value) || 0 })}
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>IA – nº de canais (R$ 90/canal)</Label>
        <Input
          type="number"
          min={0}
          value={d.qtdIaCanais}
          onChange={(e: any) => set({ qtdIaCanais: Number(e.target.value) || 0 })}
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>API Oficial – quantidade (R$ 50/un)</Label>
        <Input
          type="number"
          min={0}
          value={d.qtdApiOficial}
          onChange={(e: any) => set({ qtdApiOficial: Number(e.target.value) || 0 })}
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>Leads – valor personalizado (R$)</Label>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={d.leadsValor}
          onChange={(e: any) => set({ leadsValor: Number(e.target.value) || 0 })}
          placeholder="Informe o valor dos leads"
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>Desconto (R$)</Label>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={d.desconto}
          onChange={(e: any) => set({ desconto: Number(e.target.value) || 0 })}
          placeholder="Valor do desconto"
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>Valor Manual (opcional, substitui cálculo)</Label>
        <Input
          type="number"
          step="0.01"
          value={d.valorManual}
          onChange={(e: any) => set({ valorManual: e.target.value })}
          placeholder="Deixe vazio para cálculo automático"
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>Forma de Pagamento *</Label>
        <Select
          required
          value={d.formaPagamento}
          onChange={(e: any) => set({ formaPagamento: e.target.value })}
          className="text-sm md:text-base"
        >
          <option value="">Selecione...</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </div>

      {/* Tipo de Venda */}
      <div className="col-span-2 font-semibold text-slate-700 text-base md:text-lg border-b pb-2 mt-3 md:mt-4">
        Tipo de Venda
      </div>

      <div className="col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <Label>Tipo de Venda *</Label>
            <Select
              required
              value={tipoVenda}
              onChange={(e: any) => setTipoVenda(e.target.value)}
              className="text-sm md:text-base"
            >
              <option value="nova">Nova Venda</option>
              <option value="recorrencia">Recorrência</option>
            </Select>
          </div>
          
          <div>
            <Label>Status do Pagamento</Label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="pagamentoConfirmado"
                checked={d.pagamentoConfirmado}
                onChange={(e) => set({ pagamentoConfirmado: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <label htmlFor="pagamentoConfirmado" className="text-sm text-slate-700">
                Pagamento já confirmado?
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Comprovante de Pagamento */}
      <div className="col-span-2 font-semibold text-slate-700 text-base md:text-lg border-b pb-2 mt-3 md:mt-4">
        Comprovante de Pagamento
      </div>

      <div className="col-span-2">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 md:p-6 text-center hover:border-orange-400 transition-colors">
          <input
            type="file"
            id="comprovante"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="comprovante" className="cursor-pointer block">
            {comprovantePreview ? (
              <div className="space-y-3">
                <div className="mx-auto w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border border-slate-300">
                  {comprovantePreview.includes("data:image") ? (
                    <img 
                      src={comprovantePreview} 
                      alt="Comprovante preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <Icons.FileText className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-emerald-600">
                  ✓ Comprovante selecionado
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    setComprovantePreview("");
                  }}
                  className="text-sm bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Icons.Upload className="w-10 h-10 md:w-12 md:h-12 text-slate-400 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Clique para anexar comprovante
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG ou PDF (obrigatório)
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Máximo: 5MB
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>
        
        {comprovantePreview && (
          <div className="mt-2 text-xs text-slate-500">
            <span className="font-medium">Atenção:</span> O comprovante será salvo junto com a venda.
          </div>
        )}
      </div>

      {/* Treinamento */}
      <div className="col-span-2 font-semibold text-slate-700 text-base md:text-lg border-b pb-2 mt-3 md:mt-4">
        Treinamento
      </div>

      <div>
        <Label>Melhor Data (sugestão)</Label>
        <Input
          type="date"
          value={d.treinamentoData}
          onChange={(e: any) => set({ treinamentoData: e.target.value })}
          className="text-sm md:text-base"
        />
      </div>

      <div>
        <Label>Melhor Hora (sugestão)</Label>
        <Input
          type="time"
          value={d.treinamentoHora}
          onChange={(e: any) => set({ treinamentoHora: e.target.value })}
          className="text-sm md:text-base"
        />
      </div>

      {/* Resumo Financeiro */}
      <div className="col-span-2 bg-orange-50 border border-orange-200 rounded-xl p-3 md:p-4 mt-3 md:mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <div className="text-sm text-slate-600">Subtotal:</div>
            <div className="text-lg md:text-xl font-semibold text-slate-800">{money(subtotal)}</div>
          </div>
          {d.desconto > 0 && (
            <div>
              <div className="text-sm text-red-600">Desconto:</div>
              <div className="text-lg md:text-xl font-semibold text-red-600">- {money(d.desconto)}</div>
            </div>
          )}
        </div>
        <div className="border-t mt-2 md:mt-3 pt-2 md:pt-3">
          <div className="text-sm text-slate-600">Total Final:</div>
          <div className="text-xl md:text-2xl font-bold text-orange-600">{money(total)}</div>
        </div>
        
        {/* Informações adicionais */}
        <div className="mt-2 pt-2 border-t border-orange-100">
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div>
              <span className="font-medium">Tipo:</span> {tipoVenda === "nova" ? "Nova Venda" : "Recorrência"}
            </div>
            <div>
              <span className="font-medium">Produto:</span> {d.produto || "Não selecionado"}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Vendedor:</span> {vendedores.find(v => v.id === d.owner_id)?.name || "Não selecionado"}
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="col-span-2 flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 md:mt-4 pt-3 border-t">
        <div className="text-xs text-slate-500 order-2 sm:order-1">
          <span className="font-medium">⚠️ Atenção:</span> Após salvar, a venda irá para o fluxo de qualidade.
        </div>
        
        <div className="order-1 sm:order-2">
          <Button 
            type="submit" 
            className="bg-orange-500 hover:bg-orange-600 text-white border-none px-5 md:px-6 py-2.5 md:py-3 text-base md:text-lg font-medium w-full sm:w-auto"
          >
            <Icons.Save className="inline mr-2" size={18} />
            💾 Salvar venda
          </Button>
        </div>
      </div>
    </form>
  );
}