/**
 * Bradesco CNAB 240 - Segmento S
 * Segmento S (pos 8 = '3', pos 14 = 'S')
 * Mensagens para impressão no boleto. Este segmento é opcional e aparece apenas
 * em arquivos de remessa (não existe em retorno).
 * O Segmento S possui duas variantes mutuamente exclusivas, dependendo do campo
 * `tipo_impressao` (posição 18):
 * - Variante A (tipo 1 ou 2): mensagem livre de até 140 caracteres
 * - Variante B (tipo 3): cinco blocos de informação de 40 caracteres cada
 * As duas variantes ocupam a mesma faixa de bytes (18-240) mas com layouts diferentes.
 * Use a função `parseSegmentS` para parsear corretamente conforme a variante.
 * Fonte do layout: Manual oficial Bradesco FEBRABAN 240 Posições V6.0
 */

import { RecordSchema, FieldType } from '@tp-types/index'

/**
 * Schema base do Segmento S (posições 1-18)
 * Campos comuns a todas as variantes
 */
export const BRADESCO_CNAB240_SEGMENT_S_BASE: RecordSchema = {
  controle_banco: {
    pos: [1, 3],
    type: FieldType.NUM,
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '237',
    description: 'Código FEBRABAN do Bradesco',
    canonical: null,
  },
  controle_lote: {
    pos: [4, 7],
    type: FieldType.NUM,
    size: 4,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Lote de serviço',
    canonical: null,
  },
  controle_registro: {
    pos: [8, 8],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '3',
    description: 'Tipo: 3=Detalhe',
    canonical: null,
  },
  servico_numero_registro: {
    pos: [9, 13],
    type: FieldType.NUM,
    size: 5,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do registro no lote',
    canonical: null,
  },
  servico_segmento: {
    pos: [14, 14],
    type: FieldType.ALFA,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'S',
    description: 'Segmento S = mensagem para impressão no boleto',
    canonical: null,
  },
  cnab_exclusivo_1: {
    pos: [15, 15],
    type: FieldType.ALFA,
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '',
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
  servico_codigo_movimento: {
    pos: [16, 17],
    type: FieldType.NUM,
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código de movimento da remessa',
    canonical: null,
  },
  tipo_impressao: {
    pos: [18, 18],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Identificação da impressão: 1 ou 2=mensagem livre, 3=blocos de informação fixos',
    canonical: null,
  },
}

/**
 * Variante A - Tipo de impressão 1 ou 2
 * Mensagem livre de até 140 caracteres com controle de linha e fonte
 */
export const BRADESCO_CNAB240_SEGMENT_S_MESSAGE: RecordSchema = {
  ...BRADESCO_CNAB240_SEGMENT_S_BASE,
  numero_linha: {
    pos: [19, 20],
    type: FieldType.NUM,
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número da linha a ser impressa no boleto',
    canonical: null,
  },
  mensagem: {
    pos: [21, 160],
    type: FieldType.ALFA,
    size: 140,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Mensagem a ser impressa no boleto',
    canonical: null,
  },
  tipo_fonte: {
    pos: [161, 162],
    type: FieldType.NUM,
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Tipo do caractere a ser impresso',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [163, 240],
    type: FieldType.ALFA,
    size: 78,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '',
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
}

/**
 * Variante B - Tipo de impressão 3
 * Cinco blocos de informação fixos de 40 caracteres cada
 */
export const BRADESCO_CNAB240_SEGMENT_S_INFO: RecordSchema = {
  ...BRADESCO_CNAB240_SEGMENT_S_BASE,
  informacao_5: {
    pos: [19, 58],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Mensagem 5',
    canonical: null,
  },
  informacao_6: {
    pos: [59, 98],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Mensagem 6',
    canonical: null,
  },
  informacao_7: {
    pos: [99, 138],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Mensagem 7',
    canonical: null,
  },
  informacao_8: {
    pos: [139, 178],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Mensagem 8',
    canonical: null,
  },
  informacao_9: {
    pos: [179, 218],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Mensagem 9',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [219, 240],
    type: FieldType.ALFA,
    size: 22,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '',
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
}

