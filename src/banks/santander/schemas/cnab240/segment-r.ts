/**
 * Schema do Segmento R - Santander CNAB 240
 * 
 * Segmento opcional que contém:
 * - Segundo e terceiro descontos
 * - Multa
 * - Mensagens livres para impressão no boleto
 * 
 * Tipo de registro: 3 (detalhe)
 * Segmento: R
 * 
 * Baseado em:
 * - Manual "Layout Padrão 240 – Cobrança, Versão 2.5" (Setembro/2014)
 * - pycnab240, laravel-boleto, brcobranca, cnab_yaml
 */

import { RecordSchema } from '../../../../types'

export const SANTANDER_CNAB240_SEGMENT_R: RecordSchema = {
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
    pattern: 'R',
    description: 'Segmento R = descontos, multa e mensagens',
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
    description: 'Uso exclusivo FEBRABAN/CNAB',
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
    description: 'Código de movimento da remessa (variável: 01=Entrada, 02=Baixa, 04=Abatimento, etc.)',
    canonical: null,
  },

  // ========== SEGUNDO DESCONTO (18-41) ==========
  desconto2_codigo: {
    pos: [18, 18],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '0',
    description: 'Código do 2º desconto: 0=Sem, 1=Valor, 2=%',
    canonical: null,
  },
  desconto2_data: {
    pos: [19, 26],
    type: 'data',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAAAA',
    pattern: null,
    description: 'Data limite para o 2º desconto',
    canonical: null,
  },
  desconto2_valor: {
    pos: [27, 41],
    type: 'num',
    size: 15,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor ou percentual do 2º desconto',
    canonical: null,
  },

  // ========== TERCEIRO DESCONTO (42-65) ==========
  desconto3_codigo: {
    pos: [42, 42],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '0',
    description: 'Código do 3º desconto: 0=Sem, 1=Valor, 2=%',
    canonical: null,
  },
  desconto3_data: {
    pos: [43, 50],
    type: 'data',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAAAA',
    pattern: null,
    description: 'Data limite para o 3º desconto',
    canonical: null,
  },
  desconto3_valor: {
    pos: [51, 65],
    type: 'num',
    size: 15,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor ou percentual do 3º desconto',
    canonical: null,
  },

  // ========== MULTA (66-89) ==========
  multa_codigo: {
    pos: [66, 66],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '0',
    description: 'Código de multa: 0=Sem, 1=Valor, 2=%',
    canonical: {
      field: 'multa.tipo',
      interpret: (value: unknown) => {
        const code = Number(value)
        if (code === 0) return 'dispensado'
        if (code === 1) return 'valor'
        if (code === 2) return 'percentual'
        return undefined
      },
    },
  },
  multa_data: {
    pos: [67, 74],
    type: 'data',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAAAA',
    pattern: null,
    description: 'Data a partir da qual incide multa',
    canonical: 'multa.vigenciaAPartirDe',
  },
  multa_valor: {
    pos: [75, 89],
    type: 'num',
    size: 15,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor ou percentual da multa',
    canonical: 'multa.valor',
  },

  // ========== RESERVADO (90-99) ==========
  cnab_exclusivo_2: {
    pos: [90, 99],
    type: 'alfa',
    size: 10,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },

  // ========== MENSAGENS LIVRES (100-179) ==========
  mensagem_1: {
    pos: [100, 139],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Mensagem 1 para impressão no boleto',
    canonical: null,
  },
  mensagem_2: {
    pos: [140, 179],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Mensagem 2 para impressão no boleto',
    canonical: null,
  },

  // ========== RESERVADO (180-240) ==========
  cnab_exclusivo_3: {
    pos: [180, 240],
    type: 'alfa',
    size: 61,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
}
