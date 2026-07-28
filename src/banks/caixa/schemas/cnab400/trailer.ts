/**
 * Caixa Econ�mica Federal (104) � CNAB 400 � Trailer de Arquivo (Remessa)
 * Usa sistema SIGCB, nosso n�mero de 17 posi��es (2 d�gitos modalidade + 15 d�gitos livres).
 *
 * Trailer simples, sem totalizadores � mesmo padr�o do Sicredi e do BB.
 * Fontes:
 * - Manual oficial Caixa CNAB 400 (caixa_layout_CNAB_400_2024.pdf, 2024)
 * - laravel-boleto (PHP) - fonte original, concordante
 *
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const TRAILER: RecordSchema = {
  codigo_registro: {
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
    description: '�ltimo sequencial do arquivo',
    canonical: null,
  },
}
