/**
 * Schema do Header de Arquivo - Bradesco CNAB 400
 * 
 * Primeira linha do arquivo CNAB 400. Contém identificação do banco,
 * dados do cedente e informações sobre o arquivo.
 * 
 * Tipo de registro: 0
 * 
 * Baseado em:
 * - Manual "Layout de Cobrança CNAB 400 — versão em português" (27/07/2017)
 * - brcobranca, cnab_yaml, laravel-boleto
 */

import { RecordSchema } from '../../../../types'

export const BRADESCO_CNAB400_HEADER_REMESSA: RecordSchema = {
  // ========== IDENTIFICAÇÃO (1-9) ==========
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '0',
    description: 'Identificação do registro: 0=Header',
    canonical: null,
  },
  tipo_operacao: {
    pos: [2, 2],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '1',
    description: 'Tipo de operação: 1=Remessa',
    canonical: null,
  },
  literal_remessa: {
    pos: [3, 9],
    type: 'alfa',
    size: 7,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'REMESSA',
    description: 'Literal REMESSA',
    canonical: null,
  },

  // ========== CÓDIGO DE SERVIÇO (10-11) ==========
  codigo_servico: {
    pos: [10, 11],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '01',
    description: 'Código de serviço: 01=Cobrança',
    canonical: null,
  },

  // ========== LITERAL SERVIÇO (12-26) ==========
  literal_servico: {
    pos: [12, 26],
    type: 'alfa',
    size: 15,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'COBRANCA',
    description: 'Literal COBRANCA (com espaços à direita)',
    canonical: null,
  },

  // ========== CÓDIGO DO CEDENTE (27-46) ==========
  codigo_cedente: {
    pos: [27, 46],
    type: 'alfa',
    size: 20,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código da empresa no banco (20 posições)',
    canonical: null,
  },

  // ========== NOME DA EMPRESA (47-76) ==========
  nome_empresa: {
    pos: [47, 76],
    type: 'alfa',
    size: 30,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Razão social do cedente',
    canonical: 'cedente.nome',
  },

  // ========== CÓDIGO DO BANCO (77-79) ==========
  codigo_banco: {
    pos: [77, 79],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '237',
    description: 'Código FEBRABAN do Bradesco',
    canonical: null,
  },

  // ========== NOME DO BANCO (80-94) ==========
  nome_banco: {
    pos: [80, 94],
    type: 'alfa',
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: 'BRADESCO',
    description: 'Nome do banco',
    canonical: null,
  },

  // ========== DATA DE GERAÇÃO (95-100) ==========
  data_geracao: {
    pos: [95, 100],
    type: 'data',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: 'DDMMAA',
    pattern: null,
    description: 'Data de geração do arquivo',
    canonical: 'dataGeracao',
  },

  // ========== BRANCOS (101-108) ==========
  brancos_1: {
    pos: [101, 108],
    type: 'alfa',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Espaços em branco',
    canonical: null,
  },

  // ========== IDENTIFICAÇÃO DO SISTEMA (109-110) ==========
  identificacao_sistema: {
    pos: [109, 110],
    type: 'alfa',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'MX',
    description: 'Identificação do sistema: MX (fixo)',
    canonical: null,
  },

  // ========== NÚMERO SEQUENCIAL DE REMESSA (111-117) ==========
  sequencial_remessa: {
    pos: [111, 117],
    type: 'num',
    size: 7,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial da remessa',
    canonical: null,
  },

  // ========== BRANCOS (118-394) ==========
  brancos_2: {
    pos: [118, 394],
    type: 'alfa',
    size: 277,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Espaços em branco',
    canonical: null,
  },

  // ========== NÚMERO SEQUENCIAL DO REGISTRO (395-400) ==========
  numero_sequencial: {
    pos: [395, 400],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '000001',
    description: 'Número sequencial do registro (sempre 000001 no header)',
    canonical: null,
  },
}

export const BRADESCO_CNAB400_HEADER_RETORNO: RecordSchema = {
  // ========== IDENTIFICAÇÃO (1-9) ==========
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '0',
    description: 'Identificação do registro: 0=Header',
    canonical: null,
  },
  tipo_operacao: {
    pos: [2, 2],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '2',
    description: 'Tipo de operação: 2=Retorno',
    canonical: null,
  },
  literal_retorno: {
    pos: [3, 9],
    type: 'alfa',
    size: 7,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'RETORNO',
    description: 'Literal RETORNO',
    canonical: null,
  },

  // ========== CÓDIGO DE SERVIÇO (10-11) ==========
  codigo_servico: {
    pos: [10, 11],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '01',
    description: 'Código de serviço: 01=Cobrança',
    canonical: null,
  },

  // ========== LITERAL SERVIÇO (12-26) ==========
  literal_servico: {
    pos: [12, 26],
    type: 'alfa',
    size: 15,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'COBRANCA',
    description: 'Literal COBRANCA (com espaços à direita)',
    canonical: null,
  },

  // ========== CÓDIGO DO CEDENTE (27-46) ==========
  codigo_cedente: {
    pos: [27, 46],
    type: 'alfa',
    size: 20,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código da empresa no banco (20 posições)',
    canonical: null,
  },

  // ========== NOME DA EMPRESA (47-76) ==========
  nome_empresa: {
    pos: [47, 76],
    type: 'alfa',
    size: 30,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Razão social do cedente',
    canonical: 'cedente.nome',
  },

  // ========== CÓDIGO DO BANCO (77-79) ==========
  codigo_banco: {
    pos: [77, 79],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '237',
    description: 'Código FEBRABAN do Bradesco',
    canonical: null,
  },

  // ========== NOME DO BANCO (80-94) ==========
  nome_banco: {
    pos: [80, 94],
    type: 'alfa',
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: 'BRADESCO',
    description: 'Nome do banco',
    canonical: null,
  },

  // ========== DATA DE GERAÇÃO (95-100) ==========
  data_geracao: {
    pos: [95, 100],
    type: 'data',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: 'DDMMAA',
    pattern: null,
    description: 'Data de geração do arquivo de retorno',
    canonical: 'dataGeracao',
  },

  // ========== DENSIDADE DE GRAVAÇÃO (101-108) ==========
  densidade_gravacao: {
    pos: [101, 108],
    type: 'num',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '01600000',
    description: 'Densidade de gravação (campo legado)',
    canonical: null,
  },

  // ========== NÚMERO DE AVISO BANCÁRIO (109-113) ==========
  numero_aviso_bancario: {
    pos: [109, 113],
    type: 'num',
    size: 5,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Número do aviso bancário (5 dígitos no retorno)',
    canonical: null,
  },

  // ========== BRANCOS (114-379) ==========
  brancos: {
    pos: [114, 379],
    type: 'alfa',
    size: 266,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Espaços em branco',
    canonical: null,
  },

  // ========== DATA DO CRÉDITO (380-385) ==========
  data_credito: {
    pos: [380, 385],
    type: 'data',
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAA',
    pattern: null,
    description: 'Data de crédito dos valores',
    canonical: null,
  },

  // ========== BRANCOS (386-394) ==========
  brancos_2: {
    pos: [386, 394],
    type: 'alfa',
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Espaços em branco',
    canonical: null,
  },

  // ========== NÚMERO SEQUENCIAL DO REGISTRO (395-400) ==========
  numero_sequencial: {
    pos: [395, 400],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '000001',
    description: 'Número sequencial do registro (sempre 000001 no header)',
    canonical: null,
  },
}
