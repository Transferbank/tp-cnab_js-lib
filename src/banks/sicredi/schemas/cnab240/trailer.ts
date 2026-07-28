/* *
 * Registro de encerramento do arquivo (tipo 9, lote 9999).
 * Lote: 9999
 * 
 * IMPORTANTE: O Sicredi s� permite 1 lote por arquivo.
 * Baseado em:
 * - Manual oficial Sicredi CNAB 240, vers�o 29 (se��o 8 - Arquivo de Remessa)
 * - Layout CNAB 240 vers�o 081
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const SICREDI_CNAB240_FILE_TRAILER: RecordSchema = {
  controle_banco: {
    pos: [1, 3],
    type: FieldType.NUM,
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '748',
    description: 'C�digo FEBRABAN do Sicredi',
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
    description: 'Lote 9999 indica trailer de arquivo',
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
    description: 'Tipo registro: 9=Trailer de Arquivo',
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
    description: 'Uso exclusivo CNAB/FEBRABAN',
    canonical: null,
  },
  quantidade_lotes: {
    pos: [18, 23],
    type: FieldType.NUM,
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de Lotes (sempre 000001 - Sicredi s� permite 1 lote por arquivo)',
    canonical: 'quantidadeLotes',
  },
  quantidade_registros: {
    pos: [24, 29],
    type: FieldType.NUM,
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de Registros (total de linhas do arquivo)',
    canonical: 'quantidadeRegistros',
  },
  quantidade_contas: {
    pos: [30, 35],
    type: FieldType.NUM,
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de Contas para Concilia��o (sempre 000000)',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [36, 240],
    type: FieldType.ALFA,
    size: 205,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo CNAB/FEBRABAN',
    canonical: null,
  },
}
