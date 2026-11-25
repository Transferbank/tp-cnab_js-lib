import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const BRADESCO_CNAB400_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Entrada Confirmada'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '03': 'Entrada Rejeitada',
    '24': 'Entrada Rejeitada por CEP Irregular'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '06': 'Liquidação Normal',
    '15': 'Liquidação em Cartório',
    '17': 'Liquidação após Baixa ou Título não Registrado',
    '66': 'Título Baixado por Pagamento via Pix'
  },
  [CnabOcorrencia.BAIXA]: {
    '09': 'Baixado Automaticamente via Arquivo',
    '10': 'Baixado conforme instruções da Agência'
  },
  [CnabOcorrencia.ESTORNO]: {
    '22': 'Título com Pagamento Cancelado',
    '40': 'Estorno de Pagamento'
  },
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: {
    '16': 'Título Pago em Cheque - Vinculado'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '07': 'Conf. Exc. Cadastro Pagador Débito',
    '12': 'Abatimento Concedido',
    '13': 'Abatimento Cancelado',
    '14': 'Vencimento Alterado',
    '21': 'Acerto do Controle do Participante',
    '31': 'Confirmado Inclusão Cadastro Pagador',
    '33': 'Confirmação Pedido Alteração Outros Dados',
    '35': 'Cancelamento do Agendamento do Débito Automático',
    '38': 'Confirmado Alteração Pagador',
    '68': 'Acerto dos Dados do Rateio de Crédito',
    '69': 'Cancelamento de Rateio'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '08': 'Rej. Ped. Exc. Cadastro de Pagador Débito',
    '27': 'Baixa Rejeitada',
    '30': 'Alteração de Outros Dados Rejeitados',
    '32': 'Instrução Rejeitada',
    '37': 'Rejeitado Inclusão Cadastro Pagador',
    '39': 'Rejeitado Alteração Cadastro Pagador'
  },
  [CnabOcorrencia.PROTESTO]: {
    '19': 'Confirmação Recebimento Instrução de Protesto',
    '20': 'Confirmação Recebimento Instrução Sustação de Protesto',
    '23': 'Entrada do Título em Cartório',
    '25': 'Confirmação Recebimento Instrução de Protesto Falimentar',
    '34': 'Retirado de Cartório e Manutenção Carteira',
    '55': 'Sustado Judicial'
  },
  [CnabOcorrencia.TARIFA]: {
    '28': 'Débito de Tarifas/Custas'
  },
  [CnabOcorrencia.NEGATIVACAO]: {
    '73': 'Confirmação Recebimento Pedido de Negativação',
    '74': 'Confirmação Pedido de Exclusão de Negativação (com ou sem baixa)'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '11': 'Em Ser - Arquivo de Títulos Pendentes',
    '18': 'Acerto de Depositária',
    '29': 'Ocorrências do Pagador'
  }
}
