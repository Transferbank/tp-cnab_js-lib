/* *
 * ltima linha de cada lote de REMESSA.
 * Verso simplificada conforme Manual H7815 v6 (Fevereiro/2023).
 * IMPORTANTE: Este  o trailer de lote para REMESSA, no RETORNO.
 * O trailer de RETORNO possui estrutura rica com totalizadores detalhados
 * (simples/vinculada/caucionada/descontada + aviso bancrio) - essa verso
 * rica foi o que estava implementado antes, mas no se aplica  remessa. *
 * Fonte: Manual "MANUAL DO CLIENTE DE COBRANA", cdigo H7815, Verso 6, Fevereiro/2023
 */

import { RecordSchema, FieldType } from '@/types/all-types'

export const SANTANDER_CNAB240_BATCH_TRAILER: RecordSchema = {
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
    pattern: null,
    description: 'Nmero do lote',
    canonical: null,
  },
  controle_registro: {
    pos: [8, 8],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '5',
    description: 'Tipo: 5=Trailer de Lote',
    canonical: null,
  },
  cnab_exclusivo_1: {
    pos: [9, 17],
    type: FieldType.NUM,
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
    canonical: null,
  },
  totais_quantidade_registros: {
    pos: [18, 23],
    type: FieldType.NUM,
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de registros no lote',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [24, 240],
    type: FieldType.ALFA,
    size: 217,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
    canonical: null,
  },
}
