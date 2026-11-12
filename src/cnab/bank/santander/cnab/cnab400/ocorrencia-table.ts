import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const SANTANDER_CNAB400_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Entrada boleto Confirmada'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '03': 'Entrada e instrução de boleto Rejeitada'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '06': 'Liquidação do Boleto Efetivada',
    '07': 'Liquidação por Conta',
    '08': 'Liquidação por Saldo',
    '17': 'Liquidado em Cartório'
  },
  [CnabOcorrencia.BAIXA]: {
    '09': 'Baixa Automática',
    '10': 'Boleto Baixado Conforme Instrução',
    '16': 'Boleto Baixado/Liquidado'
  },
  [CnabOcorrencia.ESTORNO]: {
    '94': 'Cancelamento do Pagamento Recebido'
  },
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: {
    '93': 'Pagamento do Boleto Recebido'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '04': 'Transferência para carteira Simples',
    '05': 'Transferência para Carteira Penhor/Desconto/Cessão',
    '12': 'Abatimento Concedido',
    '13': 'Abatimento Cancelado',
    '14': 'Alteração de Vencimento',
    '61': 'Confirmação de Alteração do Valor Nominal do Boleto',
    '62': 'Confirmação de Alteração do Valor ou Percentual mínimo',
    '63': 'Confirmação de Alteração do Valor ou Percentual máximo'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '01': 'Boleto não existe',
    '39': 'Espécie de Boleto não permite a instrução'
  },
  [CnabOcorrencia.PROTESTO]: {
    '15': 'Confirmação de Protesto',
    '21': 'Boleto Enviado a Cartório',
    '22': 'Boleto Retirado do Cartório',
    '25': 'Boleto Protestado',
    '26': 'Sustar Protesto',
    '27': 'Cancelar Boleto Protestado',
    '38': 'Não Protestar (antes de iniciar o ciclo de protesto)'
  },
  [CnabOcorrencia.TARIFA]: {
    '24': 'Custas de Cartório'
  },
  [CnabOcorrencia.DDA]: {
    '35': 'Boleto DDA Reconhecido pelo Pagador',
    '36': 'Boleto DDA Não Reconhecido pelo Pagador',
    '37': 'Boleto DDA Recusado pela PCR'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '11': 'Boletos em carteira (em ser)'
  }
}
