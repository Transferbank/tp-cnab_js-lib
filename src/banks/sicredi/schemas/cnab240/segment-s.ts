/**
 * Sicredi CNAB 240 - Segmento S (Mensagens para impressão)
 * 
 * Registro opcional para mensagens de impressão no boleto.
 * Possui duas variantes identificadas pelo campo pos 18 (tipo_impressao):
 * - Variante 1 (pos 18 = '1' ou '2'): Frente/Verso do boleto (layout comum)
 * - Variante 2 (pos 18 = '3'): Corpo de instruções da ficha de compensação
 * 
 * Segmento S (pos 8 = '3', pos 14 = 'S')
 * 
 * NOTA: Manual menciona "Tipo de impressão" com domínio {1=Frente, 2=Verso, 3=Ficha}
 * mas apenas duas estruturas de campos distintas (1 e 2 compartilham, 3 é próprio).
 * 
 * Baseado em:
 * - Manual oficial Sicredi CNAB 240, versão 29 (seção 8 - Arquivo de Remessa)
 * - Layout CNAB 240 versão 081
 */

import { RecordSchema } from '../../../../types'

// ========== SCHEMA BASE (campos comuns posições 1-17) ==========
export const SICREDI_CNAB240_SEGMENT_S: RecordSchema = {
  controle_banco: {
    pos: [1, 3],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '748',
    description: 'Código FEBRABAN do Sicredi',
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
    pattern: 'S',
    description: 'Segmento S = mensagens para impressão',
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
    description: 'Uso exclusivo Sicredi',
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
    description: 'Código de movimento Remessa (variável)',
    canonical: null,
  },
  tipo_impressao: {
    pos: [18, 18],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de Impressão: 1=Frente do boleto, 2=Verso do boleto, 3=Corpo de instruções da ficha',
    canonical: null,
  },
}

// ========== VARIANTE 1 - FRENTE/VERSO (pos 18 = '1' ou '2') ==========
export const SICREDI_CNAB240_SEGMENT_S_FRONT_BACK: RecordSchema = {
  ...SICREDI_CNAB240_SEGMENT_S,
  numero_linha: {
    pos: [19, 20],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Número da linha a ser impressa (01 a 20)',
    canonical: null,
  },
  mensagem: {
    pos: [21, 100],
    type: 'alfa',
    size: 80,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Informativo/Mensagem (texto livre)',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [101, 160],
    type: 'alfa',
    size: 60,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CNAB (reservado)',
    canonical: null,
  },
  tipo_fonte: {
    pos: [161, 162],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de Fonte (sem preenchimento)',
    canonical: null,
  },
  cnab_exclusivo_3: {
    pos: [163, 240],
    type: 'alfa',
    size: 78,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CNAB (reservado)',
    canonical: null,
  },
}

// ========== VARIANTE 2 - CORPO DE INSTRUÇÕES (pos 18 = '3') ==========
export const SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS: RecordSchema = {
  ...SICREDI_CNAB240_SEGMENT_S,
  numero_linha: {
    pos: [19, 20],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Número da linha a ser impressa (01 a 20)',
    canonical: null,
  },
  mensagem_1: {
    pos: [21, 58],
    type: 'alfa',
    size: 38,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Informativo/Mensagem 1 (texto livre)',
    canonical: null,
  },
  mensagem_2: {
    pos: [59, 98],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Informativo/Mensagem 2 (texto livre)',
    canonical: null,
  },
  mensagem_3: {
    pos: [99, 138],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Informativo/Mensagem 3 (texto livre)',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [139, 178],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Informativo/Mensagem (sem preenchimento)',
    canonical: null,
  },
  cnab_exclusivo_3: {
    pos: [179, 218],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Informativo/Mensagem (sem preenchimento)',
    canonical: null,
  },
  cnab_exclusivo_4: {
    pos: [219, 240],
    type: 'alfa',
    size: 22,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CNAB (não documentado no manual, assumido como reservado até completar 240 bytes)',
    canonical: null,
  },
}
