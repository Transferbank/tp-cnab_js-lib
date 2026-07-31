/* *
 * ltima linha do arquivo CNAB. Contm totalizadores gerais:
 * quantidade de lotes e quantidade total de registros.
 * Lote: 9999
 * 
 * Baseado em:
 * - Manual "Layout Padro 240  Cobrana, Verso 2.5" (Setembro/2014)
 * - pycnab240, laravel-boleto, brcobranca, cnab_yaml
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const SANTANDER_CNAB240_FILE_TRAILER: RecordSchema = {
  controle_banco: {
    pos: [1, 3],
    type: FieldType.NUM,
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '033',
    description: 'Cdigo FEBRABAN do Santander',
    canonical: null,
  },
  controle_lote: {
    pos: [4, 7],
    type: FieldType.NUM,
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
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '9',
    description: 'Tipo: 9=Trailer de Arquivo',
    canonical: null,
  },
  cnab_exclusivo_1: {
    pos: [9, 17],
    type: FieldType.ALFA,
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
  totais_quantidade_lotes: {
    pos: [18, 23],
    type: FieldType.NUM,
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
    type: FieldType.NUM,
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade total de registros no arquivo',
    canonical: 'quantidadeRegistros',
  },
  cnab_exclusivo_2: {
    pos: [30, 240],
    type: FieldType.ALFA,
    size: 211,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
}
