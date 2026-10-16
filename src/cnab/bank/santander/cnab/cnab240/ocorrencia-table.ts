import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const SANTANDER_CNAB240_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Entrada confirmada'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '03': 'Entrada rejeitada'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '06': 'Liquidação',
    '17': 'Liquidação após baixa ou liquidação boleto não registrado'
  },
  [CnabOcorrencia.BAIXA]: {
    '09': 'Baixa',
    '25': 'Protestado e baixado (baixa por ter sido protestado)'
  },
  [CnabOcorrencia.ESTORNO]: {
    '94': 'Cancelamento de Baixa Operacional'
  },
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: {
    '93': 'Baixa Operacional'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '04': 'Transferência para carteira Simples',
    '05': 'Transferência para carteira Desconto/Penhor/Vendor/FIDC/Cessão',
    '08': 'Confirmação do Recebimento do Cancelamento do Desconto',
    '12': 'Confirmação recebimento instrução de abatimento',
    '13': 'Confirmação recebimento instrução de cancelamento abatimento',
    '14': 'Confirmação recebimento instrução alteração de vencimento',
    '27': 'Confirmação do pedido de alteração de outros dados',
    '61': 'Confirmação de Alteração do Valor Nominal do Boleto',
    '91': 'Confirmação de Alteração do Valor Mínimo ou Percentual Mínimo',
    '92': 'Confirmação de Alteração do Valor Máximo ou Percentual Máximo'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '26': 'Instrução rejeitada',
    '30': 'Alteração de dados rejeitada',
    '32': 'Código de IOF inválido'
  },
  [CnabOcorrencia.PROTESTO]: {
    '19': 'Confirmação recebimento instrução de protesto',
    '20': 'Confirmação recebimento instrução de sustação/Não Protestar',
    '23': 'Remessa a cartório (aponte em cartório)',
    '24': 'Retirada de cartório e manutenção em carteira'
  },
  [CnabOcorrencia.TARIFA]: {
    '28': 'Débito de tarifas/custas'
  },
  [CnabOcorrencia.DDA]: {
    '51': 'Boleto DDA reconhecido pelo Pagador',
    '52': 'Boleto DDA não reconhecido pelo Pagador',
    '53': 'Boleto DDA recusado pela CIP',
    'A4': 'Pagador DDA'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '11': 'Boletos em carteira (em ser)',
    '29': 'Ocorrências do Pagador'
  }
}
