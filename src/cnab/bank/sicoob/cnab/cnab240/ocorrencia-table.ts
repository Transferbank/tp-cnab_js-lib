import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const SICOOB_CNAB240_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Entrada Confirmada'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '03': 'Entrada Rejeitada'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '06': 'Liquidação',
    '15': 'Franco de Pagamento',
    '17': 'Liquidação Após Baixa ou Liquidação Título Não Registrado',
    '45': 'Título pago com cheque compensado'
  },
  [CnabOcorrencia.BAIXA]: {
    '05': 'Transferência de Carteira/Baixa',
    '09': 'Baixa',
    '25': 'Protestado e Baixado (Baixa por Ter Sido Protestado)',
    '54': 'Confirmação da Instrução de Baixa/Cancelamento de Título Negativado sem Protesto'
  },
  [CnabOcorrencia.ESTORNO]: {
    '44': 'Título pago com cheque devolvido'
  },
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: {
    '50': 'Título pago com cheque pendente de liquidação'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '04': 'Transferência de Carteira/Entrada',
    '07': 'Confirmação do Recebimento da Instrução de Desconto',
    '08': 'Confirmação do Recebimento do Cancelamento do Desconto',
    '12': 'Confirmação Recebimento Instrução de Abatimento',
    '13': 'Confirmação Recebimento Instrução de Cancelamento Abatimento',
    '14': 'Confirmação Recebimento Instrução Alteração de Vencimento',
    '27': 'Confirmação do Pedido de Alteração de Outros Dados',
    '33': 'Confirmação da Alteração dos Dados do Rateio de Crédito',
    '34': 'Confirmação do Cancelamento dos Dados do Rateio de Crédito',
    '35': 'Confirmação do Desagendamento do Débito Automático',
    '36': 'Confirmação de envio de e-mail/SMS',
    '38': 'Confirmação de alteração do Prazo Limite de Recebimento',
    '39': 'Confirmação de Dispensa de Prazo Limite de Recebimento',
    '40': 'Confirmação da alteração do número do título dado pelo Beneficiário',
    '41': 'Confirmação da alteração do número controle do Participante',
    '42': 'Confirmação da alteração dos dados do Pagador',
    '43': 'Confirmação da alteração dos dados do Pagador/Avalista',
    '48': 'Confirmação de instrução de transferência de carteira/modalidade de cobrança',
    '49': 'Alteração de contrato de cobrança',
    '55': 'Confirmação de Pedido de Dispensa de Multa',
    '56': 'Confirmação do Pedido de Cobrança de Multa',
    '57': 'Confirmação do Pedido de Alteração de Cobrança de Juros',
    '58': 'Confirmação do Pedido de Alteração do Valor/Data de Desconto',
    '59': 'Confirmação do Pedido de Alteração do Beneficiário do Título',
    '60': 'Confirmação do Pedido de Dispensa de Juros de Mora'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '26': 'Instrução Rejeitada',
    '30': 'Alteração de Dados Rejeitada',
    '37': 'Envio de e-mail/SMS rejeitado'
  },
  [CnabOcorrencia.PROTESTO]: {
    '19': 'Confirmação Recebimento Instrução de Protesto',
    '20': 'Confirmação Recebimento Instrução de Sustação/Cancelamento de Protesto',
    '23': 'Remessa a Cartório (Aponte em Cartório)',
    '24': 'Retirada de Cartório e Manutenção em Carteira',
    '46': 'Instrução para cancelar protesto confirmada',
    '47': 'Instrução para protesto para fins falimentares confirmada',
    '85': 'Confirmação de Desistência de Protesto',
    '86': 'Confirmação de cancelamento do Protesto'
  },
  [CnabOcorrencia.TARIFA]: {
    '28': 'Débito de Tarifas/Custas'
  },
  [CnabOcorrencia.DDA]: {
    '51': 'Título DDA reconhecido pelo Pagador',
    '52': 'Título DDA não reconhecido pelo Pagador',
    '53': 'Título DDA recusado pela CIP'
  },
  [CnabOcorrencia.NEGATIVACAO]: {
    '80': 'Confirmação da instrução de negativação'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '11': 'Títulos em Carteira (Em Ser)',
    '29': 'Ocorrências do Pagador'
  }
}
