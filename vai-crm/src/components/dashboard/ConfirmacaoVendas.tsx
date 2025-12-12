import { Deal } from "../../types";
import { Icons } from "../common/Icons";
import { Button } from "../common/Button";
import { money } from "../../utils/calculations";

type ConfirmacaoVendasProps = {
  deals: Deal[];
  onConfirmar: (dealId: string) => void;
};

export function ConfirmacaoVendas({ deals, onConfirmar }: ConfirmacaoVendasProps) {
  const vendasPendentes = deals.filter(d => 
    !d.pagamentoConfirmado && 
    d.status !== "inativo"
  );

  const formatarWhatsApp = (whatsapp: string) => {
    const apenasNumeros = whatsapp.replace(/\D/g, '');
    const semZeroInicial = apenasNumeros.replace(/^0/, '');
    let numeroFormatado = semZeroInicial;
    if (numeroFormatado.length === 10) {
      numeroFormatado = numeroFormatado.slice(0, 2) + '9' + numeroFormatado.slice(2);
    }
    return numeroFormatado;
  };

  const enviarWhatsAppConfirmacao = (deal: Deal) => {
    const numero = formatarWhatsApp(deal.whatsapp);
    const mensagem = `Olá ${deal.responsavel} da ${deal.empresa}! 

Confirmamos o recebimento do seu pagamento de ${money(deal.total || 0)}.

✅ *Status:* Pagamento confirmado
✅ *Produto:* ${deal.produto}
✅ *Data do pedido:* ${new Date(deal.createdAt).toLocaleDateString('pt-BR')}

Obrigado por escolher a VAI!`;

    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  if (vendasPendentes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
        <Icons.Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Todas as vendas confirmadas</h3>
        <p className="text-slate-600">Nenhuma venda aguardando confirmação de pagamento.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icons.DollarSign className="text-orange-500" size={20} />
          <h3 className="text-lg font-semibold text-slate-900">
            Confirmação de Vendas ({vendasPendentes.length})
          </h3>
        </div>
        <div className="text-sm text-slate-500">
          Aguardando confirmação
        </div>
      </div>

      <div className="space-y-4">
        {vendasPendentes.map((deal) => (
          <div key={deal.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {deal.empresa.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{deal.empresa}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>{deal.responsavel}</span>
                      <span>•</span>
                      <span>{deal.whatsapp}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Produto:</span>
                    <span className="font-medium ml-1">{deal.produto}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Valor:</span>
                    <span className="font-medium ml-1">{money(deal.total || 0)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Data:</span>
                    <span className="font-medium ml-1">
                      {new Date(deal.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Vendedor:</span>
                    <span className="font-medium ml-1">{deal.owner}</span>
                  </div>
                </div>
                
                {deal.comprovante && (
                  <div className="mt-3">
                    <div className="text-xs text-slate-500 mb-1">Comprovante:</div>
                    <div className="flex items-center gap-2">
                      <Icons.FileText className="text-blue-500" size={16} />
                      <span className="text-sm text-blue-600">Comprovante anexado</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => enviarWhatsAppConfirmacao(deal)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <Icons.Phone size={16} />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={() => onConfirmar(deal.id)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  <Icons.Check size={16} />
                  Confirmar Pagamento
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}