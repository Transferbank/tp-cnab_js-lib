import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const CAIXA_CNAB240_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Entrada Confirmada'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '03': 'Entrada Rejeitada',
    '40': 'Entrada de Título via Banco de Pagador Rejeitada'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '06': 'Liquidação',
    '46': 'Liquidação On-line'
  },
  [CnabOcorrencia.BAIXA]: {
    '05': 'Transferência de Carteira/Baixa',
    '09': 'Baixa',
    '25': 'Protestado e Baixado (Baixa por Ter Sido Protestado)'
  },
  [CnabOcorrencia.ESTORNO]: {
    '44': 'Estorno de Baixa / Liquidação',
    '47': 'Estorno de Liquidação On-line'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '01': 'Solicitação de Impressão de Títulos Confirmada',
    '04': 'Transferência de Carteira/Entrada',
    '07': 'Confirmação do Recebimento da Instrução de Desconto',
    '08': 'Confirmação do Recebimento do Cancelamento do Desconto',
    '12': 'Confirmação Recebimento Instrução de Abatimento',
    '13': 'Confirmação Recebimento Instrução de Cancelamento Abatimento',
    '14': 'Confirmação Recebimento Instrução Alteração de Vencimento',
    '27': 'Confirmação do Pedido de Alteração de Outros Dados',
    '35': 'Confirmação de Inclusão Banco de Pagador',
    '36': 'Confirmação de Alteração Banco de Pagador',
    '37': 'Confirmação de Exclusão Banco de Pagador',
    '38': 'Emissão de Boletos de Banco de Pagador',
    '45': 'Alteração de Dados',
    '61': 'Confirmação de alteração do valor nominal do título',
    '62': 'Confirmação de alteração do valor/percentual mínimo/máximo',
    '63': 'Confirmação da alteração da carteira'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '26': 'Instrução Rejeitada',
    '30': 'Alteração de Dados Rejeitada',
    '39': 'Manutenção de Pagador Rejeitada',
    '41': 'Manutenção de Banco de Pagador Rejeitada'
  },
  [CnabOcorrencia.PROTESTO]: {
    '19': 'Confirmação Recebimento Instrução de Protesto',
    '20': 'Confirmação Recebimento Instrução de Sustação/Cancelamento de Protesto',
    '23': 'Remessa a Cartório',
    '24': 'Retirada de Cartório'
  },
  [CnabOcorrencia.TARIFA]: {
    '28': 'Débito de Tarifas/Custas'
  },
  [CnabOcorrencia.DDA]: {
    '51': 'Título DDA reconhecido pelo pagador',
    '52': 'Título DDA não reconhecido pelo pagador',
    '53': 'Título DDA recusado pela CIP'
  }
}
