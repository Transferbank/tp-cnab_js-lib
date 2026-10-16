import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const CAIXA_CNAB400_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '01': 'Entrada Confirmada'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '99': 'Rejeição do Título (código de rejeição nas posições 80 a 82)'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '21': 'Liquidação',
    '22': 'Liquidação em Cartório',
    '35': 'Liquidação On-line'
  },
  [CnabOcorrencia.BAIXA]: {
    '02': 'Baixa Manual Confirmada',
    '23': 'Baixa por Devolução',
    '25': 'Baixa por Protesto',
    '38': 'Transferência para a cobrança descontada'
  },
  [CnabOcorrencia.ESTORNO]: {
    '33': 'Estorno de Baixa / Liquidação',
    '36': 'Estorno de Liquidação On-line'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '03': 'Abatimento Concedido',
    '04': 'Abatimento Cancelado',
    '05': 'Vencimento Alterado',
    '06': 'Uso da Empresa Alterado',
    '08': 'Prazo de Devolução Alterado',
    '09': 'Alteração Confirmada',
    '10': 'Alteração com reemissão de boleto confirmada',
    '14': 'Alteração de carteira confirmada',
    '30': 'Alteração de Título',
    '37': 'Transferência para a cobrança simples'
  },
  [CnabOcorrencia.PROTESTO]: {
    '07': 'Prazo de Protesto Alterado',
    '11': 'Alteração da opção de Protesto para Devolução Confirmada',
    '12': 'Alteração da opção de Devolução para Protesto Confirmada',
    '26': 'Título enviado para Cartório',
    '27': 'Sustação de Protesto',
    '28': 'Estorno de Protesto',
    '29': 'Estorno de Sustação de Protesto'
  },
  [CnabOcorrencia.TARIFA]: {
    '31': 'Tarifa sobre Título Vencido',
    '32': 'Outras Tarifas de Alteração',
    '34': 'Tarifas Diversas'
  },
  [CnabOcorrencia.DDA]: {
    '51': 'Reconhecido pelo pagador DDA',
    '52': 'Não reconhecido pelo pagador DDA',
    '53': 'Recusado no DDA',
    'A4': 'Pagador DDA'
  },
  [CnabOcorrencia.PIX]: {
    'P1': 'Registrado com QR Code PIX',
    'P2': 'Registrado sem QR Code PIX',
    'P3': 'Registrado com QR Code PIX e Código de Barras',
    'PC': 'PIX alterado'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '20': 'Em Ser'
  }
}
