/**
 * Caixa Econômica Federal (104) é CNAB 400 é Trailer de Arquivo (Remessa)
 * Usa sistema SIGCB, nosso número de 17 posições (2 dígitos modalidade + 15 dígitos livres).
 *
 * Trailer simples, sem totalizadores é mesmo padrão do Sicredi e do BB.
 * Fontes:
 * - Manual oficial Caixa CNAB 400 (caixa_layout_CNAB_400_2024.pdf, 2024)
 * - laravel-boleto (PHP) - fonte original, concordante
 *
 */

import { RecordSchema, FieldType } from '@/types/all-types'

export const TRAILER: RecordSchema = {
  codigo_registro: {
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
  uso_exclusivo: {
    pos: [2, 394],
    type: FieldType.ALFA,
    size: 393,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Brancos/uso exclusivo banco',
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
    description: 'último sequencial do arquivo',
    canonical: null,
  },
}
