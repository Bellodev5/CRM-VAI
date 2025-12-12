import { Deal } from "../../types";
import { money } from "../../utils/calculations";
import { Button } from "../common/Button";

type QualidadeCardProps = {
  deal: Deal;
  onUpdate: (d: Deal) => void;
  onAdvance: (d: Deal) => void;
};

export function QualidadeCard({ deal, onUpdate, onAdvance }: QualidadeCardProps) {
  const pronto = deal.qualidadeOK && deal.pagamentoConfirmado && deal.agendaOk;
  
  const formatarWhatsApp = (whatsapp: string) => {
    const apenasNumeros = whatsapp.replace(/\D/g, '');
    const semZeroInicial = apenasNumeros.replace(/^0/, '');
    let numeroFormatado = semZeroInicial;
    if (numeroFormatado.length === 10) {
      numeroFormatado = numeroFormatado.slice(0, 2) + '9' + numeroFormatado.slice(2);
    }
    return numeroFormatado;
  };

  const mensagemWhatsApp = `Olá ${deal.responsavel} da ${deal.empresa}! Tudo bem? 

Sou do setor de qualidade da VAI e estou entrando em contato para confirmar os dados da sua implantação:

✅ *Empresa:* ${deal.empresa}
✅ *Responsável:* ${deal.responsavel}
✅ *Produto:* ${deal.produto}
✅ *Valor Total:* ${money(deal.total || 0)}
✅ *Data de Treinamento Sugerida:* ${deal.treinamentoData || "a definir"}
✅ *Hora Sugerida:* ${deal.treinamentoHora || "a definir"}

Poderia confirmar se está tudo correto?

Atenciosamente,
Equipe VAI`;

  return (
    <div className="rounded-xl border p-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{deal.empresa}</div>
        <div className="text-sm text-slate-500">{money(deal.total || 0)}</div>
      </div>
      
      <div className="mt-2 text-sm text-slate-600">
        <div><strong>Responsável:</strong> {deal.responsavel}</div>
        <div><strong>WhatsApp:</strong> {deal.whatsapp}</div>
        <div><strong>Treinamento Sugerido:</strong> {deal.treinamentoData} às {deal.treinamentoHora}</div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={deal.qualidadeOK}
            onChange={(e) => onUpdate({ ...deal, qualidadeOK: e.target.checked })}
          />{" "}
          Dados verificados
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={deal.pagamentoConfirmado}
            onChange={(e) =>
              onUpdate({ ...deal, pagamentoConfirmado: e.target.checked })
            }
          />{" "}
          Pagamento confirmado
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={deal.agendaOk}
            onChange={(e) => onUpdate({ ...deal, agendaOk: e.target.checked })}
          />{" "}
          Agenda disponível
        </label>
      </div>
      
      <div className="flex items-center gap-2 mt-3">
        <Button onClick={() => onUpdate(deal)}>Salvar</Button>
        
        <Button
          onClick={() => {
            const numero = formatarWhatsApp(deal.whatsapp);
            window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(mensagemWhatsApp)}`, '_blank');
          }}
          className="bg-blue-600 text-white border-none"
        >
          📱 Verificar no WhatsApp
        </Button>
        
        <Button
          disabled={!pronto}
          onClick={() => onAdvance({ ...deal, status: "treinamento_pendente" })}
          className={
            !pronto ? "opacity-50" : "bg-emerald-600 text-white border-none"
          }
        >
          ✅ Aprovar Qualidade
        </Button>
      </div>
    </div>
  );
}