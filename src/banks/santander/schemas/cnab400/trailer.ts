/**
 * Santander (033) — CNAB 400 — Trailer de Arquivo (Remessa)
 *
 * Fontes do layout:
 * - brcobranca (Ruby)
 * - cnab_yaml (YAML)
 * - laravel-boleto (PHP)
 *
 * Todas as três fontes concordam byte a byte.
 * Confirmado contra arquivo real de 130 linhas.
 *
 */

import { RecordSchema } from '../../../../types'

export const TRAILER: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '9',
    description: 'Identificação do trailer',
    canonical: null,
  },
  qtd_documentos: {
    pos: [2, 7],
    type: 'num',
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
    type: 'num',
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Soma dos valores de todos os títulos (2 decimais implícitas)',
    canonical: 'valorTotal',
  },
  zeros: {
    pos: [21, 394],
    type: 'num',
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
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Último sequencial do arquivo',
    canonical: null,
  },
}
