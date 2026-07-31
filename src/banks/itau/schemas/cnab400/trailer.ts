/**
 * Itaú (341) é CNAB 400 é Trailer de Arquivo (Remessa)
 * Fonte do layout: laravel-boleto + brcobranca
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const TRAILER: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '9',
    description: 'Identificação do trailer',
    canonical: null,
  },
  brancos: {
    pos: [2, 394],
    type: FieldType.ALFA,
    size: 393,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Brancos (complemento de registro)',
    canonical: null,
  },
  numero_sequencial: {
    pos: [395, 400],
    type: FieldType.NUM,
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'último sequencial',
    canonical: null,
  },
}
