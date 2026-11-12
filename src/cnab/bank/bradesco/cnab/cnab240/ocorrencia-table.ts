import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const BRADESCO_CNAB240_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Entrada Confirmada'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '03': 'Entrada Rejeitada'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '06': 'Liquidação',
    '15': 'Franco de Pagamento (não tratado pelo banco)',
    '17': 'Liquidação Após Baixa ou Liquidação Título Não Registrado',
    '45': 'Título Pago com Cheque Compensado',
    '66': 'Título Baixado por Pagamento via Pix'
  },
  [CnabOcorrencia.BAIXA]: {
    '05': 'Transferência de Carteira/Baixa (não tratado pelo banco)',
    '09': 'Baixa',
    '25': 'Protestado e Baixado (Baixa por Ter Sido Protestado)',
    '54': 'Confirmação da Instrução de Baixa de Título Negativado sem Protesto'
  },
  [CnabOcorrencia.ESTORNO]: {
    '44': 'Título Pago com Cheque Devolvido'
  },
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: {
    '50': 'Título Pago com Cheque Pendente de Liquidação'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '04': 'Transferência de Carteira/Entrada (não tratado pelo banco)',
    '07': 'Confirmação do Recebimento da Instrução de Desconto (não tratado pelo banco)',
    '08': 'Confirmação do Recebimento do Cancelamento do Desconto (não tratado pelo banco)',
    '10': 'Conf. Exc. Cadastro Pagador Débito',
    '12': 'Confirmação Recebimento Instrução de Abatimento',
    '13': 'Confirmação Recebimento Instrução de Cancelamento Abatimento',
    '14': 'Confirmação Recebimento Instrução Alteração de Vencimento',
    '18': 'Confirmado Cadastro Pagador',
    '27': 'Confirmação do Pedido de Alteração de Outros Dados',
    '31': 'Confirmado Alteração do Pagador',
    '33': 'Confirmação da Alteração dos Dados do Rateio de Crédito',
    '34': 'Confirmação do Cancelamento dos Dados do Rateio de Crédito',
    '35': 'Confirmação do Cancelamento do Agendamento do Débito Automático',
    '36': 'Confirmação de Envio de E-mail/SMS',
    '38': 'Confirmação de Alteração do Prazo Limite de Recebimento (não tratado pelo banco)',
    '39': 'Confirmação de Dispensa de Prazo Limite de Recebimento (não tratado pelo banco)',
    '40': 'Confirmação da Alteração do Número do Título Dado pelo Beneficiário',
    '41': 'Confirmação da Alteração do Número Controle do Participante',
    '42': 'Confirmação da Alteração dos Dados do Pagador',
    '43': 'Confirmação da Alteração dos Dados do Beneficiário Final',
    '48': 'Confirmação de Instrução de Transferência de Carteira/Modalidade de Cobrança (não tratado pelo banco)',
    '49': 'Alteração de Contrato de Cobrança (não tratado pelo banco)'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '16': 'Rej. Ped. Exc. Cadastro Pagador Débito',
    '21': 'Rejeitado Cadastro Pagador',
    '26': 'Instrução Rejeitada',
    '30': 'Alteração de Dados Rejeitada',
    '32': 'Rejeição Alteração do Cadastro Pagador',
    '37': 'Envio de E-mail/SMS Rejeitado'
  },
  [CnabOcorrencia.PROTESTO]: {
    '19': 'Confirmação Recebimento Instrução de Protesto',
    '20': 'Confirmação Recebimento Instrução de Sustação de Protesto',
    '23': 'Remessa a Cartório (Aponte em Cartório)',
    '24': 'Retirada de Cartório e Manutenção em Carteira',
    '46': 'Instrução para Cancelar Protesto Confirmada (não tratado pelo banco)',
    '47': 'Instrução para Protesto para Fins Falimentares Confirmada'
  },
  [CnabOcorrencia.TARIFA]: {
    '28': 'Débito de Tarifas/Custas'
  },
  [CnabOcorrencia.DDA]: {
    '51': 'Título DDA reconhecido pelo pagador (não tratado pelo banco)',
    '52': 'Título DDA não reconhecido pelo pagador (não tratado pelo banco)',
    '53': 'Título DDA recusado pela CIP (não tratado pelo banco)'
  },
  [CnabOcorrencia.NEGATIVACAO]: {
    '73': 'Confirmação Recebimento Pedido de Negativação'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '11': 'Títulos em Carteira (Em Ser) (não tratado pelo banco)',
    '29': 'Ocorrências do Pagador'
  }
}
