/**
 * Schema do Trailer de Arquivo - Santander CNAB 240
 * 
 * Última linha do arquivo CNAB. Contém totalizadores gerais:
 * quantidade de lotes e quantidade total de registros.
 * 
 * Tipo de registro: 9
 * Lote: 9999
 * 
 * Baseado em:
 * - Manual "Layout Padrão 240 – Cobrança, Versão 2.5" (Setembro/2014)
 * - pycnab240, laravel-boleto, brcobranca, cnab_yaml
 */

import { RecordSchema } from '../../../../types'

export const SANTANDER_CNAB240_FILE_TRAILER: RecordSchema = {
  // ========== CONTROLE (1-8) ==========
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
    pattern: '9999',
    description: 'Lote 9999 = trailer de arquivo',
    canonical: null,
  },
  controle_registro: {
    pos: [8, 8],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '9',
    description: 'Tipo: 9=Trailer de Arquivo',
    canonical: null,
  },

  // ========== RESERVADO (9-17) ==========
  cnab_exclusivo_1: {
    pos: [9, 17],
    type: 'alfa',
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },

  // ========== TOTALIZADORES (18-29) ==========
  totais_quantidade_lotes: {
    pos: [18, 23],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de lotes no arquivo',
    canonical: 'quantidadeLotes',
  },
  totais_quantidade_registros: {
    pos: [24, 29],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade total de registros no arquivo',
    canonical: 'quantidadeRegistros',
  },

  // ========== RESERVADO (30-240) ==========
  cnab_exclusivo_2: {
    pos: [30, 240],
    type: 'alfa',
    size: 211,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
}
