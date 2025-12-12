import { useState } from "react";
import { Deal } from "../../types";
import { Button } from "../common/Button";
import { Textarea } from "../common/Textarea";
import { Label } from "../common/Label";

type ExperienciaCardProps = {
  deal: Deal;
  onUpdate: (d: Deal) => void;
  onAdvance: (d: Deal) => void;
};

export function ExperienciaCard({
  deal,
  onUpdate,
  onAdvance,
}: ExperienciaCardProps) {
  const [observacao, setObservacao] = useState(
    deal.observacoes.length > 0 
      ? deal.observacoes[deal.observacoes.length - 1].nota 
      : ""
  );

  return (
    <div className="rounded-xl border p-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{deal.empresa}</div>
        <div className="text-sm text-slate-500">Período de Experiência (30 dias)</div>
      </div>
      
      <div className="mt-2 text-sm text-slate-600">
        <div><strong>Responsável:</strong> {deal.responsavel}</div>
        <div><strong>WhatsApp:</strong> {deal.whatsapp}</div>
        <div><strong>Treinamento realizado em:</strong> {deal.treinamentoData} às {deal.treinamentoHora}</div>
      </div>
      
      <div className="mt-3">
        <Label>Observações da Experiência</Label>
        <Textarea
          placeholder="Registre observações importantes durante o período de experiência (30 dias)..."
          value={observacao}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservacao(e.target.value)}
          rows={4}
          className="w-full"
        />
        <div className="text-xs text-slate-500 mt-1">
          Registre acompanhamentos, feedbacks, ajustes necessários durante os 30 dias.
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3">
        <Button onClick={() => onUpdate({ 
          ...deal, 
          observacoes: [{ data: new Date().toISOString().split('T')[0], nota: observacao }]
        })}>
          Salvar Observação
        </Button>
        
        <Button
          className="bg-emerald-600 text-white border-none"
          onClick={() => onAdvance({ 
            ...deal, 
            observacoes: [{ data: new Date().toISOString().split('T')[0], nota: observacao }],
            status: "ativo" 
          })}
        >
          ✅ Finalizar Experiência → Ativo
        </Button>
      </div>
    </div>
  );
}