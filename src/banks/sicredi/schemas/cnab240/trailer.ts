/**
 * Schema do Trailer de Arquivo - Sicredi CNAB 240
 * 
 * Registro de encerramento do arquivo (tipo 9, lote 9999).
 * 
 * Tipo de registro: 9 (trailer de arquivo)
 * Lote: 9999
 * 
 * IMPORTANTE: O Sicredi só permite 1 lote por arquivo.
 * 
 * Baseado em:
 * - Manual oficial Sicredi CNAB 240, versão 29 (seção 8 - Arquivo de Remessa)
 * - Layout CNAB 240 versão 081
 */

import { RecordSchema } from '../../../../types'

export const SICREDI_CNAB240_FILE_TRAILER: RecordSchema = {
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
    pattern: '9999',
    description: 'Lote 9999 indica trailer de arquivo',
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
    description: 'Tipo registro: 9=Trailer de Arquivo',
    canonical: null,
  },
  cnab_exclusivo_1: {
    pos: [9, 17],
    type: 'alfa',
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
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de Lotes (sempre 000001 - Sicredi só permite 1 lote por arquivo)',
    canonical: 'quantidadeLotes',
  },
  quantidade_registros: {
    pos: [24, 29],
    type: 'num',
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
    type: 'num',
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de Contas para Conciliação (sempre 000000)',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [36, 240],
    type: 'alfa',
    size: 205,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo CNAB/FEBRABAN',
    canonical: null,
  },
}
