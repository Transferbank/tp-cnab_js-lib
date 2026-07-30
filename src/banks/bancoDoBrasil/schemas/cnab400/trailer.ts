/**
 * Banco do Brasil (001) � CNAB 400 � Trailer de Arquivo (Remessa)
 * Fonte:
 * - Manual oficial BB remessa (Doc2627CBR641Pos7.pdf, abril/2012) � �3 p.8
 * - brcobranca (remessa/cnab400/banco_brasil.rb)
 * - cnab_yaml (cnab400/001/remessa - n�o tem trailer espec�fico)
 * - laravel-boleto (Cnab/Remessa/Cnab400/Banco/Bb.php)
 * Layout extremamente simples: apenas tipo de registro e sequencial,
 * todo o resto s�o brancos (filler).
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
    description: 'Identifica��o do registro trailer',
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
    description: 'Brancos (filler)',
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
    description: 'N�mero sequencial do registro (�ltimo do arquivo)',
    canonical: null,
  },
}
