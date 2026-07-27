/**
 * Schema do Segmento P - Sicredi CNAB 240
 * 
 * Contém os dados financeiros do título (boleto): valor, vencimento,
 * nosso número, juros, descontos, etc.
 * 
 * Tipo de registro: 3 (detalhe)
 * Segmento: P
 * 
 * IMPORTANTE: O campo valor_titulo (pos 086-100) tem decimais condicionais:
 * - 2 decimais quando moeda corrente (moeda_codigo = '09')
 * - 5 decimais quando moeda variável (qualquer outro código)
 * O schema declara `decimais: 2` fixo (correto só para moeda corrente) - use
 * `resolveTitleAmountSegmentP` de `segment-p-helper.ts` para obter o valor
 * com a precisão correta em ambos os casos.
 *
 * Baseado em:
 * - Manual oficial Sicredi CNAB 240, versão 29 (seção 8 - Arquivo de Remessa)
 * - Layout CNAB 240 versão 081
 */

import { RecordSchema } from '../../../../types'

export const SICREDI_CNAB240_SEGMENT_P: RecordSchema = {
  // ========== CONTROLE (1-17) ==========
  controle_banco: {
    pos: [1, 3],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '748',
    description: 'Código FEBRABAN do Sicredi',
    canonical: null,
  },
  controle_lote: {
    pos: [4, 7],
    type: 'num',
    size: 4,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número do lote',
    canonical: null,
  },
  controle_registro: {
    pos: [8, 8],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '3',
    description: 'Tipo registro: 3=Detalhe',
    canonical: null,
  },
  servico_numero_registro: {
    pos: [9, 13],
    type: 'num',
    size: 5,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do registro no lote (começa em 00001)',
    canonical: null,
  },
  servico_segmento: {
    pos: [14, 14],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'P',
    description: 'Segmento P = dados do título',
    canonical: null,
  },
  cnab_exclusivo_1: {
    pos: [15, 15],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo CNAB/FEBRABAN',
    canonical: null,
  },
  servico_codigo_movimento: {
    pos: [16, 17],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código de movimento (variável: 01,02,04,05,06,07,08,09,10,11,12,13,16,17,31,45,75,76)',
    canonical: null,
  },
  
  // ========== DADOS DO CEDENTE (18-37) ==========
  cedente_agencia: {
    pos: [18, 22],
    type: 'num',
    size: 5,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Agência do beneficiário/cedente',
    canonical: null,
  },
  cedente_agencia_dv: {
    pos: [23, 23],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'DV da agência (sem preenchimento)',
    canonical: null,
  },
  cedente_conta: {
    pos: [24, 35],
    type: 'num',
    size: 12,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Conta corrente do beneficiário/cedente',
    canonical: null,
  },
  cedente_conta_dv: {
    pos: [36, 36],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'DV da conta corrente',
    canonical: null,
  },
  cedente_dv_agencia_conta: {
    pos: [37, 37],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'DV da agência/Cooperativa (sem preenchimento)',
    canonical: null,
  },

  // ========== NOSSO NÚMERO (38-057) ==========
  nosso_numero: {
    pos: [38, 46],
    type: 'num',
    size: 9,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Nosso Número (9 dígitos reais: formato "AA B XXXXX D" = ano+byte geração+sequencial+DV)',
    canonical: 'nossoNumero',
  },
  nosso_numero_complemento: {
    pos: [47, 57],
    type: 'alfa',
    size: 11,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Complemento do Nosso Número (sem preenchimento - posições 47-57 não usadas)',
    canonical: null,
  },

  // ========== CARTEIRA E CADASTRAMENTO (58-62) ==========
  carteira: {
    pos: [58, 58],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '1',
    description: 'Carteira: 1=Cobrança Simples',
    canonical: null,
  },
  cadastramento: {
    pos: [59, 59],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '1',
    description: 'Cadastramento: 1=Cobrança com registro',
    canonical: null,
  },
  tipo_documento: {
    pos: [60, 60],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de documento: 1=Tradicional, 2=Escritural (Sicredi não diferencia)',
    canonical: null,
  },
  emissao_boleto: {
    pos: [61, 61],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Emissão Boleto: 1=Sicredi emite, 2=Beneficiário emite',
    canonical: null,
  },
  distribuicao_boleto: {
    pos: [62, 62],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Distribuição/Postagem: 1=Sicredi distribui, 2=Beneficiário distribui',
    canonical: null,
  },

  // ========== SEU NÚMERO (63-77) ==========
  seu_numero: {
    pos: [63, 77],
    type: 'alfa',
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Seu Número (só as 10 primeiras posições 063-072 são validadas pelo Sicredi)',
    canonical: 'numeroDocumento',
  },

  // ========== VENCIMENTO E VALOR (78-100) ==========
  vencimento_titulo: {
    pos: [78, 85],
    type: 'data',
    size: 8,
    decimals: 0,
    required: true,
    dateFormat: 'DDMMAAAA',
    pattern: null,
    description: 'Data de vencimento do título (deve ser emissão+7 dias se emissão Sicredi)',
    canonical: 'vencimento',
  },
  valor_titulo: {
    pos: [86, 100],
    type: 'num',
    size: 15,
    decimals: 2,
    required: true,
    dateFormat: null,
    pattern: null,
    description:
      'Valor nominal do título (decimais condicionais: 2 se moeda corrente, 5 se moeda variável - use resolveTitleAmountSegmentP)',
    canonical: 'valor',
  },

  // ========== AGÊNCIA COBRADORA (101-106) ==========
  agencia_cobradora: {
    pos: [101, 105],
    type: 'num',
    size: 5,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Cooperativa/Agência Cobradora (não usado, 00000)',
    canonical: null,
  },
  agencia_cobradora_dv: {
    pos: [106, 106],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'DV da agência cobradora (sem preenchimento)',
    canonical: null,
  },

  // ========== ESPÉCIE E ACEITE (107-109) ==========
  especie_titulo: {
    pos: [107, 108],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Espécie de Título: 03,05,06,07,12,13,16,17,19,32,99',
    canonical: null,
  },
  aceite: {
    pos: [109, 109],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Aceite: A=com aceite, N=sem aceite',
    canonical: null,
  },

  // ========== DATA DE EMISSÃO (110-117) ==========
  data_emissao_titulo: {
    pos: [110, 117],
    type: 'data',
    size: 8,
    decimals: 0,
    required: true,
    dateFormat: 'DDMMAAAA',
    pattern: null,
    description: 'Data de emissão do título',
    canonical: 'dataEmissao',
  },

  // ========== JUROS DE MORA (118-141) ==========
  juros_mora_codigo: {
    pos: [118, 118],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código de Juros: 1=Valor monetário, 2=Taxa mensal, 3=Isento',
    canonical: {
      field: 'juros.tipo',
      interpret: (value: unknown) => {
        const code = Number(value)
        if (code === 1) return 'valor'
        if (code === 2) return 'percentual'
        if (code === 3) return 'dispensado'
        return undefined
      },
    },
  },
  juros_mora_data: {
    pos: [119, 126],
    type: 'data',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAAAA',
    pattern: null,
    description: 'Data Juros (DDMMAAAA ou zeros)',
    canonical: 'juros.vigenciaAPartirDe',
  },
  juros_mora_valor: {
    pos: [127, 141],
    type: 'num',
    size: 15,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Juros (valor monetário ou percentual conforme código 118)',
    canonical: 'juros.valor',
  },

  // ========== DESCONTO 1 (142-165) ==========
  desconto_codigo: {
    pos: [142, 142],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código desconto 1: 0=Sem, 1=Valor fixo, 2=Percentual, 3=Antecipação, 7=Cancelamento',
    canonical: null,
  },
  desconto_data: {
    pos: [143, 150],
    type: 'data',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAAAA',
    pattern: null,
    description: 'Data desconto 1 (DDMMAAAA ou zeros)',
    canonical: null,
  },
  desconto_valor: {
    pos: [151, 165],
    type: 'num',
    size: 15,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor desconto 1',
    canonical: 'desconto.valor',
  },

  // ========== IOF (166-180) ==========
  iof_valor: {
    pos: [166, 180],
    type: 'num',
    size: 15,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor IOF (não utilizado pelo Sicredi, sempre 000000000000000)',
    canonical: null,
  },

  // ========== ABATIMENTO (181-195) ==========
  abatimento_valor: {
    pos: [181, 195],
    type: 'num',
    size: 15,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor abatimento',
    canonical: 'abatimento.valor',
  },

  // ========== USO EMPRESA (196-220) ==========
  uso_empresa: {
    pos: [196, 220],
    type: 'alfa',
    size: 25,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso Empresa Beneficiário (identificação do título na empresa)',
    canonical: null,
  },

  // ========== PROTESTO/NEGATIVAÇÃO (221-223) ==========
  protesto_codigo: {
    pos: [221, 221],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código para Protesto/Negativação: 1=Protestar, 3=Não protestar/negativar, 8=Negativar, 9=Cancelar',
    canonical: null,
  },
  protesto_prazo: {
    pos: [222, 223],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Prazo para Protesto/Negativação (mínimo 03 dias)',
    canonical: null,
  },

  // ========== BAIXA/DEVOLUÇÃO (224-227) ==========
  baixa_codigo: {
    pos: [224, 224],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '1',
    description: 'Código para Baixa/Devolução (sempre 1)',
    canonical: null,
  },
  baixa_prazo: {
    pos: [225, 227],
    type: 'num',
    size: 3,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Número de dias para baixa/devolução (não utilizado, 000)',
    canonical: null,
  },

  // ========== MOEDA (228-229) ==========
  moeda_codigo: {
    pos: [228, 229],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '09',
    description: 'Código da Moeda: 09=Real',
    canonical: null,
  },

  // ========== CONTRATO E EXCLUSIVO (230-240) ==========
  contrato_numero: {
    pos: [230, 239],
    type: 'num',
    size: 10,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Número do contrato (não utilizado, 0000000000)',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [240, 240],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo Sicredi',
    canonical: null,
  },
}
