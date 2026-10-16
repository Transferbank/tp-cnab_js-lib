import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const BANCO_DO_BRASIL_CNAB240_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Entrada confirmada'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '03': 'Entrada Rejeitada'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '06': 'Liquidação',
    '15': 'Franco de Pagamento',
    '17': 'Liquidação Após Baixa ou Liquidação Título Não Registrado'
  },
  [CnabOcorrencia.BAIXA]: {
    '05': 'Transferência de Carteira/Baixa',
    '09': 'Baixa'
  },
  [CnabOcorrencia.ESTORNO]: {
    '44': 'Título pago com cheque devolvido'
  },
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: {
    '50': 'Título pago com cheque pendente de Compensação',
    '93': 'Baixa Operacional'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '04': 'Transferência de Carteira/Entrada',
    '12': 'Confirmação Recebimento Instrução de Abatimento',
    '13': 'Confirmação Recebimento Instrução de Cancelamento Abatimento',
    '14': 'Confirmação Recebimento Instrução Alteração de Vencimento',
    '16': 'Confirmação do Pedido de Alteração de Juros',
    '27': 'Confirmação do Pedido de Alteração de Outros Dados',
    '58': 'Confirmação do Pedido de Retificação do Valor de Desconto',
    '59': 'Confirmação do Pedido de Alteração da Data do Desconto',
    '60': 'Confirmação do Pedido de Dispensa de Juros',
    '61': 'Confirmação de Alteração de Valor Nominal do Boleto'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '26': 'Instrução Rejeitada',
    '30': 'Alteração de Dados Rejeitada'
  },
  [CnabOcorrencia.PROTESTO]: {
    '19': 'Confirmação Recebimento Instrução de Protesto',
    '20': 'Confirmação Recebimento Instrução de Sustação/Cancelamento de Protesto',
    '23': 'Remessa a Cartório (Aponte em Cartório)',
    '24': 'Retirada de Cartório e Manutenção em Carteira'
  },
  [CnabOcorrencia.TARIFA]: {
    '28': 'Débito de Tarifas/Custas'
  },
  [CnabOcorrencia.NEGATIVACAO]: {
    '85': 'Inclusão de Negativação',
    '86': 'Exclusão de Negativação'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '11': 'Títulos em Carteira (em ser)',
    '29': 'Ocorrências do Sacado'
  }
}
