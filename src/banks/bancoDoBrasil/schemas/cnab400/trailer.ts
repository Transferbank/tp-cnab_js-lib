/**
 * Banco do Brasil (001) — CNAB 400 — Trailer de Arquivo (Remessa)
 *
 * Fonte:
 * - Manual oficial BB remessa (Doc2627CBR641Pos7.pdf, abril/2012) — §3 p.8
 * - brcobranca (remessa/cnab400/banco_brasil.rb)
 * - cnab_yaml (cnab400/001/remessa - não tem trailer específico)
 * - laravel-boleto (Cnab/Remessa/Cnab400/Banco/Bb.php)
 *
 * Layout extremamente simples: apenas tipo de registro e sequencial,
 * todo o resto são brancos (filler).
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
  brancos: {
    pos: [2, 394],
    type: 'alfa',
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
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do registro (último do arquivo)',
    canonical: null,
  },
}
