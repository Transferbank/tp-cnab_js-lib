/**
 * Sicredi (748) — CNAB 400 — Trailer de Arquivo (Remessa)
 *
 * Fonte:
 * - Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.8, p.36
 * - laravel-boleto (Cnab/Remessa/Cnab400/Banco/Sicredi.php)
 *
 * Ambas as fontes concordam byte a byte.
 *
 * Diferente do trailer do BB (só tipo_registro + brancos + sequencial), o Sicredi repete
 * código do banco e código do cliente/cedente no trailer (mesmos campos do header).
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
    description: 'Identificação do registro trailer',
    canonical: null,
  },
  tipo_identificacao_arquivo: {
    pos: [2, 2],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '1',
    description: 'Identificação do arquivo remessa',
    canonical: null,
  },
  codigo_banco: {
    pos: [3, 5],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '748',
    description: 'Código FEBRABAN do Sicredi',
    canonical: null,
  },
  codigo_cliente: {
    pos: [6, 10],
    type: 'num',
    size: 5,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código do beneficiário/cedente (repete o campo do header)',
    canonical: null,
  },
  brancos: {
    pos: [11, 394],
    type: 'alfa',
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
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do registro (total de registros do arquivo)',
    canonical: null,
  },
}
