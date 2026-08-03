/**
 * Itaú (341) — CNAB 400 — Registro Tipo 6, Layout 4 (Sacador/Avalista)
 *
 * Registro para emissão física de boleto pelo cedente (fluxo paralelo ao tipo 1).
 * Este layout contém a extensão de dados do sacador/avalista.
 *
 * IMPORTANTE:
 * - Família paralela e independente do fluxo tipo 1/2/4/5
 * - Campo codigo_layout = '4' identifica este layout
 * - Complementa os dados do sacador/avalista do layout 1
 *
 * ATENÇÃO: Sem evidência real no fixture (não presente no ITAU_cnab_400.REM).
 * Schema baseado exclusivamente no manual oficial Itaú, p.46-47.
 *
 * Fonte: Manual oficial Itaú, layout_cobranca_400bytes_cnab_itau.pdf, §6, p.46-47
 */

import { RecordSchema, FieldType } from '@/types/all-types'

export const TYPE6_LAYOUT4_ENDORSER: RecordSchema = {
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
    pattern: '4',
    description: 'Identificação do layout 4 (extensão sacador/avalista)',
    canonical: null,
  },
  codigo_inscricao: {
    pos: [3, 4],
    type: FieldType.NUM,
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de inscrição do sacador/avalista: 01=CPF, 02=CNPJ',
    canonical: null,
  },
  numero_inscricao: {
    pos: [5, 18],
    type: FieldType.NUM,
    size: 14,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CPF ou CNPJ do sacador/avalista',
    canonical: null,
  },
  logradouro: {
    pos: [19, 58],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Rua, número e complemento do sacador/avalista',
    canonical: null,
  },
  bairro: {
    pos: [59, 70],
    type: FieldType.ALFA,
    size: 12,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Bairro do sacador/avalista',
    canonical: null,
  },
  cep: {
    pos: [71, 78],
    type: FieldType.NUM,
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CEP do sacador/avalista',
    canonical: null,
  },
  cidade: {
    pos: [79, 93],
    type: FieldType.ALFA,
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Cidade do sacador/avalista',
    canonical: null,
  },
  estado: {
    pos: [94, 95],
    type: FieldType.ALFA,
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'UF do sacador/avalista',
    canonical: null,
  },
  brancos: {
    pos: [96, 394],
    type: FieldType.ALFA,
    size: 299,
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
