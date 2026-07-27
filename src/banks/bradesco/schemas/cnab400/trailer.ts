/**
 * Schema do Trailer de Arquivo - Bradesco CNAB 400
 * 
 * Última linha do arquivo CNAB 400. Indica o fechamento do arquivo.
 * 
 * Tipo de registro: 9
 * 
 * Baseado em:
 * - Manual "Layout de Cobrança CNAB 400 — versão em português" (27/07/2017)
 * - brcobranca, cnab_yaml, laravel-boleto
 */

import { RecordSchema } from '../../../../types'

export const BRADESCO_CNAB400_TRAILER: RecordSchema = {
  // ========== IDENTIFICAÇÃO DO REGISTRO (1-1) ==========
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '9',
    description: 'Identificação do registro: 9=Trailer',
    canonical: null,
  },

  // ========== BRANCOS (2-394) ==========
  brancos: {
    pos: [2, 394],
    type: 'alfa',
    size: 393,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Espaços em branco ou reservado',
    canonical: null,
  },

  // ========== NÚMERO SEQUENCIAL (395-400) ==========
  numero_sequencial: {
    pos: [395, 400],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do último registro',
    canonical: null,
  },
}
