/**
 * Schema do Trailer de Lote REMESSA - Santander CNAB 240
 * 
 * Última linha de cada lote de REMESSA.
 * Versão simplificada conforme Manual H7815 v6 (Fevereiro/2023).
 * 
 * IMPORTANTE: Este é o trailer de lote para REMESSA, não RETORNO.
 * O trailer de RETORNO possui estrutura rica com totalizadores detalhados
 * (simples/vinculada/caucionada/descontada + aviso bancário) - essa versão
 * rica foi o que estava implementado antes, mas não se aplica à remessa.
 * 
 * Tipo de registro: 5
 * 
 * Fonte: Manual "MANUAL DO CLIENTE DE COBRANÇA", código H7815, Versão 6, Fevereiro/2023
 */

import { RecordSchema } from '../../../../types'

export const SANTANDER_CNAB240_BATCH_TRAILER: RecordSchema = {
  // ========== CONTROLE (1-8) ==========
  controle_banco: {
    pos: [1, 3],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '033',
    description: 'Código FEBRABAN do Santander',
    canonical: null,
  },
  controle_lote: {
    pos: [4, 7],
    type: 'num',
    size: 4,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número do lote',
    canonical: null,
  },
  controle_registro: {
    pos: [8, 8],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '5',
    description: 'Tipo: 5=Trailer de Lote',
    canonical: null,
  },

  // ========== RESERVADO (9-17) ==========
  cnab_exclusivo_1: {
    pos: [9, 17],
    type: 'num',
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
    canonical: null,
  },

  // ========== TOTALIZADOR (18-23) ==========
  totais_quantidade_registros: {
    pos: [18, 23],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de registros no lote',
    canonical: null,
  },

  // ========== RESERVADO (24-240) ==========
  cnab_exclusivo_2: {
    pos: [24, 240],
    type: 'alfa',
    size: 217,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
    canonical: null,
  },
}
