import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const SICREDI_CNAB400_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Entrada confirmada'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '03': 'Entrada rejeitada',
    '24': 'Entrada rejeitada por CEP irregular'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '06': 'Liquidação normal',
    '15': 'Liquidação em cartório',
    '17': 'Liquidação após baixa'
  },
  [CnabOcorrencia.BAIXA]: {
    '09': 'Baixado automaticamente via arquivo',
    '10': 'Baixado conforme instruções da cooperativa'
  },
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: {
    '07': 'Intenção de pagamento'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '12': 'Abatimento concedido',
    '13': 'Abatimento cancelado',
    '14': 'Vencimento alterado',
    '33': 'Confirmação de pedido de alteração de outros dados'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '27': 'Baixa rejeitada',
    '30': 'Alteração rejeitada',
    '32': 'Instrução rejeitada'
  },
  [CnabOcorrencia.PROTESTO]: {
    '19': 'Confirmação de recebimento de instrução de protesto',
    '20': 'Confirmação de recebimento de instrução de sustação de protesto',
    '23': 'Entrada de título em cartório',
    '34': 'Retirado de cartório e manutenção em carteira'
  },
  [CnabOcorrencia.TARIFA]: {
    '28': 'Tarifa'
  },
  [CnabOcorrencia.NEGATIVACAO]: {
    '78': 'Confirmação de recebimento de pedido de negativação',
    '79': 'Confirmação de recebimento de pedido de exclusão de negativação',
    '80': 'Confirmação de entrada de negativação',
    '81': 'Entrada de negativação rejeitada',
    '82': 'Confirmação de exclusão de negativação',
    '83': 'Exclusão de negativação rejeitada',
    '84': 'Exclusão de negativação por outros motivos'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '29': 'Rejeição do pagador',
    '35': 'Aceite do pagador',
    '85': 'Ocorrência informacional por outros motivos'
  }
}
