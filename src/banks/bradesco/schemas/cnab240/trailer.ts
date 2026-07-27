/**
 * Bradesco CNAB 240 - Trailer de Arquivo
 * 
 * Trailer de Arquivo (pos 8 = '9')
 * Última linha do arquivo. Serve para o banco saber que o arquivo terminou
 * corretamente (não foi cortado no meio). Contém totalizadores do arquivo:
 * quantidade de lotes, quantidade total de registros e quantidade de contas
 * para conciliação. Funciona como um "fechamento" — se essa linha faltar,
 * o banco rejeita o arquivo.
 * 
 * Fonte do layout:
 * - Manual oficial Bradesco CNAB 240 (bradesco_cnab240_2024.pdf, versão 04, dez/2024)
 * - pycnab240 (trailer_arquivo.json)
 */

import { RecordSchema } from '../../../../types'

export const BRADESCO_CNAB240_TRAILER: RecordSchema = {
  controle_banco: {
    pos: [1, 3],
    type: 'num',
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
  cnab_exclusivo_1: {
    pos: [9, 17],
    type: 'alfa',
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB (brancos)',
    canonical: null,
  },
  totais_quantidade_lotes: {
    pos: [18, 23],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade total de lotes no arquivo',
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
    description: 'Quantidade total de registros no arquivo (incluindo header e trailer)',
    canonical: 'quantidadeRegistros',
  },
  totais_quantidade_contas_concil: {
    pos: [30, 35],
    type: 'num',
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de contas para conciliação (normalmente zeros)',
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
    description: 'Uso exclusivo FEBRABAN/CNAB (brancos)',
    canonical: null,
  },
}
