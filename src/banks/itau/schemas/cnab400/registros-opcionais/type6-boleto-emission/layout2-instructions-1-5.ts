/**
 * Itaú (341) — CNAB 400 — Registro Tipo 6, Layout 2 (Instruções linhas 1-5)
 *
 * Registro para emissão física de boleto pelo cedente (fluxo paralelo ao tipo 1).
 * Este layout contém as linhas 1 a 5 de texto livre da área "Instruções" do boleto.
 *
 * IMPORTANTE:
 * - Família paralela e independente do fluxo tipo 1/2/4/5
 * - Campo codigo_layout = '2' identifica este layout
 * - Cada linha tem 69 caracteres de texto livre (NOTA 26)
 * - Complementado pelo layout 3 (linhas 6-9)
 *
 * ATENÇÃO: Sem evidência real no fixture (não presente no ITAU_cnab_400.REM).
 * Schema baseado exclusivamente no manual oficial Itaú, p.45-46.
 *
 * Fonte: Manual oficial Itaú, layout_cobranca_400bytes_cnab_itau.pdf, §6, p.45-46
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const TYPE6_LAYOUT2_INSTRUCTIONS_1_5: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
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
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '2',
    description: 'Identificação do layout 2 (instruções linhas 1-5)',
    canonical: null,
  },
  linha_1: {
    pos: [3, 71],
    type: FieldType.ALFA,
    size: 69,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conteúdo da 1ª linha de impressão da área "Instruções" (NOTA 26)',
    canonical: null,
  },
  linha_2: {
    pos: [72, 140],
    type: FieldType.ALFA,
    size: 69,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conteúdo da 2ª linha de impressão da área "Instruções" (NOTA 26)',
    canonical: null,
  },
  linha_3: {
    pos: [141, 209],
    type: FieldType.ALFA,
    size: 69,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conteúdo da 3ª linha de impressão da área "Instruções" (NOTA 26)',
    canonical: null,
  },
  linha_4: {
    pos: [210, 278],
    type: FieldType.ALFA,
    size: 69,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conteúdo da 4ª linha de impressão da área "Instruções" (NOTA 26)',
    canonical: null,
  },
  linha_5: {
    pos: [279, 347],
    type: FieldType.ALFA,
    size: 69,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conteúdo da 5ª linha de impressão da área "Instruções" (NOTA 26)',
    canonical: null,
  },
  brancos: {
    pos: [348, 394],
    type: FieldType.ALFA,
    size: 47,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Complemento de registro (brancos)',
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
    description: 'Sequencial do registro no arquivo',
    canonical: null,
  },
}
