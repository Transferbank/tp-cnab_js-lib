/* *
 * �ltima linha do arquivo CNAB 400. Indica o fechamento do arquivo.
 * 
 * Baseado em:
 * - Manual "Layout de Cobran�a CNAB 400 � vers�o em portugu�s" (27/07/2017)
 * - brcobranca, cnab_yaml, laravel-boleto
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const BRADESCO_CNAB400_TRAILER: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '9',
    description: 'Identifica��o do registro: 9=Trailer',
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
    description: 'Espa�os em branco ou reservado',
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
    description: 'N�mero sequencial do �ltimo registro',
    canonical: null,
  },
}
