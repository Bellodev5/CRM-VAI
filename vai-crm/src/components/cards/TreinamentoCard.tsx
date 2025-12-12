import { useState } from "react";
import { Deal } from "../../types";
import { Button } from "../common/Button";
import { Label } from "../common/Label";
import { Input } from "../common/Input";
import { Icons } from "../common/Icons";

type TreinamentoCardProps = {
  deal: Deal;
  onUpdate: (d: Deal) => void;
  onAdvance: (d: Deal) => void;
};

export function TreinamentoCard({
  deal,
  onUpdate,
  onAdvance,
}: TreinamentoCardProps) {
  const [dataAgendada, setDataAgendada] = useState(deal.treinamentoData || "");
  const [horaAgendada, setHoraAgendada] = useState(deal.treinamentoHora || "");
  
  const formatarWhatsApp = (whatsapp: string) => {
    const apenasNumeros = whatsapp.replace(/\D/g, '');
    const semZeroInicial = apenasNumeros.replace(/^0/, '');
    let numeroFormatado = semZeroInicial;
    if (numeroFormatado.length === 10) {
      numeroFormatado = numeroFormatado.slice(0, 2) + '9' + numeroFormatado.slice(2);
    }
    return numeroFormatado;
  };

  const mensagemTreinamento = `Olá ${deal.responsavel} da ${deal.empresa}! 

Sou ${deal.owner || "da equipe VAI"}. 

Gostaria de *agendar o treinamento* do seu sistema:

📅 *Data Sugerida:* ${dataAgendada || deal.treinamentoData || "a definir"}
⏰ *Hora Sugerida:* ${horaAgendada || deal.treinamentoHora || "a definir"}

Poderia confirmar se essa data e hora estão boas para você?

Atenciosamente,
${deal.owner || "Equipe VAI"}`;

  const temWhatsApp = deal.whatsapp && deal.whatsapp.trim() !== "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icons.Building className="text-slate-400" size={18} />
          <h3 className="font-semibold text-slate-900">{deal.empresa}</h3>
        </div>
        <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          deal.status === "treinamento_pendente" 
            ? "bg-purple-100 text-purple-700" 
            : "bg-indigo-100 text-indigo-700"
        }`}>
          {deal.status === "treinamento_pendente" ? "Pendente" : "Agendado"}
        </div>
      </div>
      
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Icons.User size={14} className="text-slate-400" />
          <span><strong>Responsável:</strong> {deal.responsavel}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Icons.Phone size={14} className="text-slate-400" />
          <span><strong>WhatsApp:</strong> {deal.whatsapp || "Não informado"}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Icons.User size={14} className="text-slate-400" />
          <span><strong>Vendedor:</strong> {deal.owner}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Icons.DollarSign size={14} className="text-slate-400" />
          <span><strong>Valor:</strong> R$ {(deal.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="text-xs font-medium text-slate-700 mb-1">Data do Treinamento</Label>
          <div className="relative">
            <Icons.Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              type="date"
              value={dataAgendada}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDataAgendada(e.target.value)}
              className="pl-10 border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium text-slate-700 mb-1">Hora do Treinamento</Label>
          <div className="relative">
            <Icons.Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              type="time"
              value={horaAgendada}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoraAgendada(e.target.value)}
              className="pl-10 border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Button
          disabled={!temWhatsApp}
          onClick={() => {
            if (!temWhatsApp) return;
            const numero = formatarWhatsApp(deal.whatsapp);
            window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(mensagemTreinamento)}`, '_blank');
          }}
          className={`flex items-center justify-center gap-2 ${
            temWhatsApp 
              ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" 
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
        >
          <Icons.Phone size={16} />
          {temWhatsApp ? "Contatar no WhatsApp" : "WhatsApp não informado"}
        </Button>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onUpdate({ 
              ...deal, 
              treinamentoData: dataAgendada, 
              treinamentoHora: horaAgendada,
              status: dataAgendada && horaAgendada ? "treinamento_agendado" : "treinamento_pendente"
            })}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <Icons.Save size={16} />
            Salvar Agendamento
          </Button>
          
          {deal.status === "treinamento_agendado" && (
            <Button
              onClick={() => onAdvance({ 
                ...deal, 
                status: "experiencia" 
              })}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
            >
              <Icons.Check size={16} />
              Concluir
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}