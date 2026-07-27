/**
 * Schema do Segmento Y-04 - Sicredi CNAB 240
 * 
 * Registro obrigatório quando boleto híbrido (QR Code/PIX).
 * 
 * IMPORTANTE: Este segmento não é opcional condicional simples.
 * É obrigatório sempre que o boleto usa QR Code/PIX híbrido.
 * 
 * Tipo de registro: 3 (detalhe)
 * Segmento: Y
 * Código do registro: 04
 * 
 * NOTA: Campo 070-071 tem inconsistência no manual (TAM="01" mas intervalo
 * tem 2 posições). Implementado com 2 posições conforme os vizinhos 069 e 072.
 * 
 * Baseado em:
 * - Manual oficial Sicredi CNAB 240, versão 29 (seção 8 - Arquivo de Remessa)
 * - Layout CNAB 240 versão 081
 */

import { RecordSchema } from '../../../../types'

export const SICREDI_CNAB240_SEGMENT_Y04: RecordSchema = {
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
    description: 'Número sequencial do registro no lote',
    canonical: null,
  },
  servico_segmento: {
    pos: [14, 14],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'Y',
    description: 'Segmento Y = dados adicionais',
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
    description: 'Código de movimento (domínio pode ser restrito a "01" para este segmento - conferir manual)',
    canonical: null,
  },

  // ========== CÓDIGO DO REGISTRO (18-19) ==========
  codigo_registro: {
    pos: [18, 19],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '04',
    description: 'Código do registro: 04=PIX/QR Code',
    canonical: null,
  },

  // ========== CAMPOS RESERVADOS (20-80) ==========
  cnab_exclusivo_2: {
    pos: [20, 69],
    type: 'alfa',
    size: 50,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Sem preenchimento',
    canonical: null,
  },
  cnab_exclusivo_3: {
    pos: [70, 71],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Sem preenchimento (nota: manual declara TAM="01" mas intervalo tem 2 posições)',
    canonical: null,
  },
  cnab_exclusivo_4: {
    pos: [72, 80],
    type: 'alfa',
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Sem preenchimento',
    canonical: null,
  },

  // ========== DADOS PIX (81-193) ==========
  pix_tipo_chave: {
    pos: [81, 81],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de chave PIX (sem preenchimento - Sicredi não valida)',
    canonical: null,
  },
  pix_chave: {
    pos: [82, 158],
    type: 'alfa',
    size: 77,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Chave PIX aleatória gerada pelo Sicredi',
    canonical: null,
  },
  pix_txid: {
    pos: [159, 193],
    type: 'alfa',
    size: 35,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'TXID (sem preenchimento - Sicredi gera e vincula ao título)',
    canonical: null,
  },

  // ========== RESERVADO (194-240) ==========
  cnab_exclusivo_5: {
    pos: [194, 240],
    type: 'alfa',
    size: 47,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CNAB (sem preenchimento)',
    canonical: null,
  },
}
