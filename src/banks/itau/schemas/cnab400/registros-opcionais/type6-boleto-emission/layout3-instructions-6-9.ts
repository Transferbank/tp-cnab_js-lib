/**
 * Itaú (341) — CNAB 400 — Registro Tipo 6, Layout 3 (Instruções linhas 6-9)
 *
 * Registro para emissão física de boleto pelo cedente (fluxo paralelo ao tipo 1).
 * Este layout contém as linhas 6 a 9 de texto livre da área "Instruções" do boleto.
 *
 * IMPORTANTE:
 * - Família paralela e independente do fluxo tipo 1/2/4/5
 * - Campo codigo_layout = '3' identifica este layout
 * - Cada linha tem 69 caracteres de texto livre (NOTA 26)
 * - Continuação do layout 2 (linhas 1-5)
 *
 * ATENÇÃO: Sem evidência real no fixture (não presente no ITAU_cnab_400.REM).
 * Schema baseado exclusivamente no manual oficial Itaú, p.46.
 *
 * Fonte: Manual oficial Itaú, layout_cobranca_400bytes_cnab_itau.pdf, §6, p.46
 */

import { RecordSchema } from '../../../../../../types'

export const TYPE6_LAYOUT3_INSTRUCTIONS_6_9: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '6',
    description: 'Identificação do registro tipo 6 (emissão de boleto)',
    canonical: null,
  },
  codigo_layout: {
    pos: [2, 2],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '3',
    description: 'Identificação do layout 3 (instruções linhas 6-9)',
    canonical: null,
  },
  linha_6: {
    pos: [3, 71],
    type: 'alfa',
    size: 69,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conteúdo da 6ª linha de impressão da área "Instruções" (NOTA 26)',
    canonical: null,
  },
  linha_7: {
    pos: [72, 140],
    type: 'alfa',
    size: 69,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conteúdo da 7ª linha de impressão da área "Instruções" (NOTA 26)',
    canonical: null,
  },
  linha_8: {
    pos: [141, 209],
    type: 'alfa',
    size: 69,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conteúdo da 8ª linha de impressão da área "Instruções" (NOTA 26)',
    canonical: null,
  },
  linha_9: {
    pos: [210, 278],
    type: 'alfa',
    size: 69,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conteúdo da 9ª linha de impressão da área "Instruções" (NOTA 26)',
    canonical: null,
  },
  brancos: {
    pos: [279, 394],
    type: 'alfa',
    size: 116,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Complemento de registro (brancos)',
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
    description: 'Sequencial do registro no arquivo',
    canonical: null,
  },
}
