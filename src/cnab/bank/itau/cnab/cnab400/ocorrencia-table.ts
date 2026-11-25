import { CnabOcorrencia, CnabOcorrenciaTable } from '@cnab/type/cnab-ocorrencia'

export const ITAU_CNAB400_OCORRENCIA_TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: {
    '02': 'Entrada Confirmada',
    '64': 'Entrada Confirmada com Rateio de Crédito',
    '71': 'Entrada Registrada, Aguardando Avaliação',
    '73': 'Confirmação de Entrada na Cobrança Simples - Entrada não Aceita na Cobrança Contratual'
  },
  [CnabOcorrencia.ENTRADA_REJEITADA]: {
    '03': 'Entrada Rejeitada',
    '60': 'Entrada Rejeitada Carnê'
  },
  [CnabOcorrencia.LIQUIDACAO]: {
    '06': 'Liquidação Normal',
    '07': 'Liquidação Parcial - Cobrança Inteligente (B2B)',
    '08': 'Liquidação em Cartório',
    '59': 'Baixa por Crédito em C/C através do SISPAG',
    '72': 'Baixa por Crédito em C/C através do SISPAG sem Título Correspondente',
    '76': 'Cheque Compensado'
  },
  [CnabOcorrencia.BAIXA]: {
    '05': 'Alteração de Dados - Baixa',
    '09': 'Baixa Simples',
    '10': 'Baixa por Ter Sido Liquidado',
    '32': 'Baixa por Ter Sido Protestado',
    '47': 'Baixa com Transferência para Desconto'
  },
  [CnabOcorrencia.ESTORNO]: {
    '69': 'Cheque Devolvido'
  },
  [CnabOcorrencia.PAGAMENTO_PENDENTE]: {
    '65': 'Pagamento com Cheque - Aguardando Compensação'
  },
  [CnabOcorrencia.INSTRUCAO_CONFIRMADA]: {
    '04': 'Alteração de Dados - Nova Entrada ou Alteração/Exclusão de Dados Acatada',
    '12': 'Abatimento Concedido',
    '13': 'Abatimento Cancelado',
    '14': 'Vencimento Alterado',
    '57': 'Instrução Cancelada'
  },
  [CnabOcorrencia.INSTRUCAO_REJEITADA]: {
    '15': 'Baixas Rejeitadas',
    '16': 'Instruções Rejeitadas',
    '17': 'Alteração/Exclusão de Dados Rejeitados',
    '18': 'Cobrança Contratual - Instruções/Alterações Rejeitadas/Pendentes'
  },
  [CnabOcorrencia.PROTESTO]: {
    '19': 'Confirma Recebimento de Instrução de Protesto',
    '20': 'Confirma Recebimento de Instrução de Sustação de Protesto/Tarifa',
    '21': 'Confirma Recebimento de Instrução de Não Protestar',
    '23': 'Título Enviado a Cartório/Tarifa',
    '24': 'Instrução de Protesto Rejeitada/Sustada/Pendente',
    '63': 'Título Sustado Judicialmente'
  },
  [CnabOcorrencia.TARIFA]: {
    '26': 'Tarifa de Aviso de Cobrança',
    '27': 'Tarifa de Extrato Posição (B40X)',
    '28': 'Tarifa de Relação das Liquidações',
    '29': 'Tarifa de Manutenção de Títulos Vencidos',
    '30': 'Débito Mensal de Tarifas (para Entradas e Baixas)',
    '33': 'Custas de Protesto',
    '34': 'Custas de Sustação',
    '35': 'Custas de Cartório Distribuidor',
    '36': 'Custas de Edital',
    '37': 'Tarifa de Emissão de Boleto/Tarifa de Envio de Duplicata',
    '38': 'Tarifa de Instrução',
    '39': 'Tarifa de Ocorrências',
    '40': 'Tarifa Mensal de Emissão de Boleto/Tarifa Mensal de Envio de Duplicata',
    '41': 'Débito Mensal de Tarifas - Extrato de Posição (B4EP/B4OX)',
    '42': 'Débito Mensal de Tarifas - Outras Instruções',
    '43': 'Débito Mensal de Tarifas - Manutenção de Títulos Vencidos',
    '44': 'Débito Mensal de Tarifas - Outras Ocorrências',
    '45': 'Débito Mensal de Tarifas - Protesto',
    '46': 'Débito Mensal de Tarifas - Sustação de Protesto',
    '48': 'Custas de Sustação Judicial',
    '51': 'Tarifa Mensal Referente a Entradas Bancos Correspondentes na Carteira',
    '52': 'Tarifa Mensal Baixas na Carteira',
    '53': 'Tarifa Mensal Baixas em Bancos Correspondentes na Carteira',
    '54': 'Tarifa Mensal de Liquidações na Carteira',
    '55': 'Tarifa Mensal de Liquidações em Bancos Correspondentes na Carteira',
    '56': 'Custas de Irregularidade',
    '61': 'Tarifa Emissão Aviso de Movimentação de Títulos (2154)',
    '62': 'Débito Mensal de Tarifa - Aviso de Movimentação de Títulos (2154)',
    '85': 'Tarifa por Boleto (até 03 envios) Cobrança Ativa Eletrônica',
    '86': 'Tarifa E-mail Cobrança Ativa Eletrônica',
    '87': 'Tarifa SMS Cobrança Ativa Eletrônica',
    '88': 'Tarifa Mensal por Boleto (até 03 envios) Cobrança Ativa Eletrônica',
    '89': 'Tarifa Mensal E-mail Cobrança Ativa Eletrônica',
    '90': 'Tarifa Mensal SMS Cobrança Ativa Eletrônica',
    '91': 'Tarifa Mensal de Exclusão de Entrada de Negativação Expressa',
    '92': 'Tarifa Mensal de Cancelamento de Negativação Expressa',
    '93': 'Tarifa Mensal de Exclusão de Negativação Expressa por Liquidação'
  },
  [CnabOcorrencia.NEGATIVACAO]: {
    '74': 'Instrução de Negativação Expressa Rejeitada',
    '75': 'Confirmação de Recebimento de Instrução de Entrada em Negativação Expressa',
    '77': 'Confirmação de Recebimento de Instrução de Exclusão de Entrada em Negativação Expressa',
    '78': 'Confirmação de Recebimento de Instrução de Cancelamento de Negativação Expressa',
    '79': 'Negativação Expressa Informacional',
    '80': 'Confirmação de Entrada em Negativação Expressa - Tarifa',
    '82': 'Confirmação do Cancelamento de Negativação Expressa - Tarifa',
    '83': 'Confirmação de Exclusão de Entrada em Negativação Expressa por Liquidação - Tarifa'
  },
  [CnabOcorrencia.INFORMATIVO]: {
    '11': 'Em Ser (só no retorno mensal)',
    '25': 'Alegações do Pagador'
  }
}
