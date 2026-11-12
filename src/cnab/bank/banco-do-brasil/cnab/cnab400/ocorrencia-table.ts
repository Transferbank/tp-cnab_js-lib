import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const BANCO_DO_BRASIL_CNAB400_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Confirmação de Entrada de Boleto'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '05': 'Liquidado sem registro (carteira 17-tipo 4)',
    '06': 'Liquidação Normal',
    '07': 'Liquidação por Conta/Parcial',
    '08': 'Liquidação por Saldo',
    '15': 'Liquidação em Cartório',
    '20': 'Débito em Conta'
  },
  [CnabOcorrencia.BAIXA]: {
    '09': 'Baixa de Título',
    '10': 'Baixa Solicitada'
  },
  [CnabOcorrencia.ESTORNO]: {
    '44': 'Boleto pago com cheque devolvido'
  },
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: {
    '46': 'Boleto pago com cheque, aguardando compensação',
    '93': 'Baixa Operacional'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '12': 'Abatimento Concedido',
    '13': 'Abatimento Cancelado',
    '14': 'Alteração de Vencimento do boleto',
    '16': 'Confirmação de alteração de juros de mora',
    '21': 'Alteração do Nome do Sacado',
    '22': 'Alteração do Endereço do Sacado',
    '25': 'Dispensar Juros de mora',
    '26': 'Alteração do número do boleto dado pelo Cedente (Seu número)',
    '31': 'Conceder desconto',
    '32': 'Não conceder desconto',
    '33': 'Retificar desconto',
    '34': 'Alterar data para desconto',
    '35': 'Cobrar Multa',
    '36': 'Dispensar Multa',
    '37': 'Dispensar Indexador',
    '38': 'Dispensar prazo limite para recebimento',
    '39': 'Alterar prazo limite para recebimento',
    '41': 'Alteração do número do controle do participante',
    '42': 'Alteração do número do documento do sacado (CNPJ/CPF)',
    '47': 'Alteração de valor nominal do boleto',
    '72': 'Alteração de tipo de cobrança',
    '73': 'Confirmação de Instrução de Parâmetro de Pagamento Parcial'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '03': 'Comando recusado (motivo nas posições 087/088)'
  },
  [CnabOcorrencia.PROTESTO]: {
    '19': 'Confirmação de recebimento de instruções para protesto',
    '23': 'Indicação de encaminhamento a cartório',
    '24': 'Sustar Protesto'
  },
  [CnabOcorrencia.TARIFA]: {
    '96': 'Despesas de Protesto',
    '97': 'Despesas de Sustação de Protesto',
    '98': 'Débito de Custas Antecipadas'
  },
  [CnabOcorrencia.NEGATIVACAO]: {
    '85': 'Inclusão de Negativação',
    '86': 'Exclusão de Negativação'
  },
  [CnabOcorrencia.PIX]: {
    '61': 'Registrado QR Code Pix'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '11': 'Boletos em Ser',
    '28': 'Manutenção de título vencido'
  }
}
