import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const SICREDI_CNAB240_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Entrada confirmada'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '03': 'Entrada rejeitada'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '06': 'Liquidação',
    '17': 'Liquidação após baixa ou liquidação título não registrado'
  },
  [CnabOcorrencia.BAIXA]: {
    '09': 'Baixa'
  },
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: {
    '91': 'Intenção de pagamento'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '07': 'Confirmação do recebimento da instrução de desconto',
    '08': 'Confirmação do recebimento do cancelamento do desconto',
    '12': 'Confirmação do recebimento instrução de abatimento',
    '13': 'Confirmação do recebimento instrução de cancelamento abatimento',
    '14': 'Confirmação do recebimento instrução alteração de vencimento',
    '27': 'Confirmação do pedido de alteração de outros dados'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '26': 'Instrução rejeitada',
    '30': 'Alteração de dados rejeitada',
    '36': 'Baixa rejeitada'
  },
  [CnabOcorrencia.PROTESTO]: {
    '19': 'Confirmação do recebimento instrução de protesto',
    '20': 'Confirmação do recebimento instrução de sustação/cancelamento de protesto',
    '23': 'Remessa a cartório (aponte em cartório)',
    '24': 'Retirada de cartório e manutenção em carteira'
  },
  [CnabOcorrencia.TARIFA]: {
    '28': 'Débito de tarifas custas'
  },
  [CnabOcorrencia.DDA]: {
    '51': 'Título DDA reconhecido pelo pagador',
    '52': 'Título DDA não reconhecido pelo pagador'
  },
  [CnabOcorrencia.NEGATIVACAO]: {
    '78': 'Confirmação de recebimento de pedido de negativação',
    '79': 'Confirmação de recebimento de pedido de exclusão de negativação',
    '80': 'Confirmação de entrada de negativação',
    '81': 'Entrada de negativação rejeitada',
    '82': 'Confirmação de exclusão de negativação',
    '83': 'Exclusão de Negativação rejeitada',
    '84': 'Exclusão de negativação por outros motivos'
  },
  [CnabOcorrencia.PIX]: {
    'P1': 'Confirmado com QR Code',
    'P2': 'Confirmado sem QR Code',
    'P3': 'Chave Inválida'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '85': 'Ocorrência informacional por outros motivos'
  }
}
