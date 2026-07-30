/**
 * Santander (033) � CNAB 400 � Trailer de Arquivo (Remessa)
 * Fontes do layout:
 * - brcobranca (Ruby)
 * - cnab_yaml (YAML)
 * - laravel-boleto (PHP)
 *
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
    description: 'Identifica��o do trailer',
    canonical: null,
  },
  qtd_documentos: {
    pos: [2, 7],
    type: FieldType.NUM,
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade total de boletos no arquivo',
    canonical: 'quantidadeRegistros',
  },
  valor_total: {
    pos: [8, 20],
    type: FieldType.NUM,
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Soma dos valores de todos os t�tulos (2 decimais impl�citas)',
    canonical: 'valorTotal',
  },
  zeros: {
    pos: [21, 394],
    type: FieldType.NUM,
    size: 374,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '0',
    description: 'Zeros (374 caracteres)',
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
    description: '�ltimo sequencial do arquivo',
    canonical: null,
  },
}
