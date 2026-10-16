import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const SICOOB_CNAB400_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Confirmação Entrada Título'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '05': 'Liquidação Sem Registro',
    '06': 'Liquidação Normal',
    '15': 'Liquidação em Cartório'
  },
  [CnabOcorrencia.BAIXA]: {
    '09': 'Baixa de Título',
    '10': 'Baixa Solicitada (Baixa - Pedido Beneficiário)'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '04': 'Transferência de carteira/Entrada',
    '14': 'Alteração de Vencimento',
    '27': 'Confirmação Alteração Dados',
    '48': 'Confirmação de instrução de transferência de carteira/modalidade de cobrança'
  },
  [CnabOcorrencia.PROTESTO]: {
    '23': 'Encaminhado a Protesto'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '11': 'Títulos em Ser'
  }
}
