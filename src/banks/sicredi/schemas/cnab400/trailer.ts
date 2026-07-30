/**
 * Sicredi (748) � CNAB 400 � Trailer de Arquivo (Remessa)
 * Fonte:
 * - Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) � �8.8, p.36
 * - laravel-boleto (Cnab/Remessa/Cnab400/Banco/Sicredi.php)
 *
 * Diferente do trailer do BB (s� tipo_registro + brancos + sequencial), o Sicredi repete
 * c�digo do banco e c�digo do cliente/cedente no trailer (mesmos campos do header).
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
    description: 'Identifica��o do registro trailer',
    canonical: null,
  },
  tipo_identificacao_arquivo: {
    pos: [2, 2],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '1',
    description: 'Identifica��o do arquivo remessa',
    canonical: null,
  },
  codigo_banco: {
    pos: [3, 5],
    type: FieldType.NUM,
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '748',
    description: 'C�digo FEBRABAN do Sicredi',
    canonical: null,
  },
  codigo_cliente: {
    pos: [6, 10],
    type: FieldType.NUM,
    size: 5,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'C�digo do benefici�rio/cedente (repete o campo do header)',
    canonical: null,
  },
  brancos: {
    pos: [11, 394],
    type: FieldType.ALFA,
    size: 384,
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
    description: 'N�mero sequencial do registro (total de registros do arquivo)',
    canonical: null,
  },
}
