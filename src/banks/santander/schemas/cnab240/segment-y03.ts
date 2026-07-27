/**
 * Santander CNAB 240 - Segmento Y-03 (PIX)
 * 
 * Registro opcional para dados de PIX vinculados ao boleto (chave PIX, QR Code).
 * Introduzido em Novembro/2021.
 * 
 * Segmento Y-03 (pos 8 = '3', pos 14 = 'Y', pos 18-19 = '03')
 * 
 * Fonte do layout: Manual "MANUAL DO CLIENTE DE COBRANÇA", código H7815, Versão 6, Fevereiro/2023
 */

import { RecordSchema } from '../../../../types'

export const SANTANDER_CNAB240_SEGMENT_Y03: RecordSchema = {
  // ========== CONTROLE (1-17) ==========
  controle_banco: {
    pos: [1, 3],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '033',
    description: 'Código FEBRABAN do Santander',
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
    description: 'Tipo: 3=Detalhe',
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
    description: 'Segmento Y = registro opcional',
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
    description: 'Reservado (uso Banco)',
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
    description: 'Código de movimento Remessa',
    canonical: null,
  },

  // ========== IDENTIFICAÇÃO DO REGISTRO OPCIONAL (18-19) ==========
  registro_opcional_id: {
    pos: [18, 19],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '03',
    description: 'Identificação do Registro Opcional: 03=PIX',
    canonical: null,
  },

  // ========== RESERVADO (20-80) ==========
  cnab_exclusivo_2: {
    pos: [20, 80],
    type: 'alfa',
    size: 61,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
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
    description: 'Tipo de Chave PIX (ver tabela de códigos no manual)',
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
    description: 'Chave PIX',
    canonical: null,
  },
  pix_qrcode_txid: {
    pos: [159, 193],
    type: 'alfa',
    size: 35,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Código de identificação do QR Code (TXID)',
    canonical: null,
  },

  // ========== RESERVADO (194-240) ==========
  cnab_exclusivo_3: {
    pos: [194, 240],
    type: 'alfa',
    size: 47,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
    canonical: null,
  },
}
