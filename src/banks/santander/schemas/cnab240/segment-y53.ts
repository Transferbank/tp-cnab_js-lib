/**
 * Santander CNAB 240 - Segmento Y-53 (Tipo de Pagamento)
 * 
 * Registro opcional para configurar pagamento parcial/com faixa de valores (mín/máx ou percentual).
 * Introduzido em Abril/2022.
 * 
 * Segmento Y-53 (pos 8 = '3', pos 14 = 'Y', pos 18-19 = '53')
 * 
 * NOTA: Os campos 024/040 (Tipo de valor Informado) tornam os campos 025-039 e 041-055 
 * condicionais - podem ser valores monetários (N013,2) ou percentuais (N010,5).
 * 
 * Fonte do layout: Manual "MANUAL DO CLIENTE DE COBRANÇA", código H7815, Versão 6, Fevereiro/2023
 */

import { RecordSchema } from '../../../../types'

export const SANTANDER_CNAB240_SEGMENT_Y53: RecordSchema = {
  // ========== CONTROLE (1-17) ==========
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
    pattern: '3',
    description: 'Tipo: 3=Detalhe',
    canonical: null,
  },
  servico_numero_registro: {
    pos: [9, 13],
    type: 'num',
    size: 5,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do registro no lote',
    canonical: null,
  },
  servico_segmento: {
    pos: [14, 14],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'Y',
    description: 'Segmento Y = registro opcional',
    canonical: null,
  },
  cnab_exclusivo_1: {
    pos: [15, 15],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
    canonical: null,
  },
  servico_codigo_movimento: {
    pos: [16, 17],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código de movimento Remessa',
    canonical: null,
  },

  // ========== IDENTIFICAÇÃO DO REGISTRO OPCIONAL (18-19) ==========
  registro_opcional_id: {
    pos: [18, 19],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '53',
    description: 'Identificação do Registro Opcional: 53=Tipo de Pagamento',
    canonical: null,
  },

  // ========== TIPO DE PAGAMENTO (20-23) ==========
  tipo_pagamento_id: {
    pos: [20, 21],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Identificação de tipo de Pagamento',
    canonical: null,
  },
  pagamentos_quantidade: {
    pos: [22, 23],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de Pagamentos Possíveis',
    canonical: null,
  },

  // ========== VALOR MÁXIMO (24-39) - CAMPO CONDICIONAL ==========
  valor_maximo_tipo: {
    pos: [24, 24],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de valor Informado: indica se campo seguinte é valor ou percentual',
    canonical: null,
  },
  valor_maximo: {
    pos: [25, 39],
    type: 'num',
    size: 15,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor Máximo OU % Percentual (condicional ao tipo em pos 24) - N(13)V99 se valor, N(10)V99999 se percentual',
    canonical: null,
  },

  // ========== VALOR MÍNIMO (40-55) - CAMPO CONDICIONAL ==========
  valor_minimo_tipo: {
    pos: [40, 40],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de valor Informado: indica se campo seguinte é valor ou percentual',
    canonical: null,
  },
  valor_minimo: {
    pos: [41, 55],
    type: 'num',
    size: 15,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor Mínimo OU % Percentual (condicional ao tipo em pos 40) - N(13)V99 se valor, N(10)V99999 se percentual',
    canonical: null,
  },

  // ========== RESERVADO (56-240) ==========
  cnab_exclusivo_2: {
    pos: [56, 240],
    type: 'num',
    size: 185,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
    canonical: null,
  },
}
