/**
 * Sicredi (748) — CNAB 400 — Registro Tipo 8 (Híbrido / QR Code)
 *
 * Único registro opcional classificado pelo manual como "obrigatório quando emissão de
 * boleto híbrido" — condicional ao campo tipo_boleto do detalhe (posição 6 = 'H'), não
 * livre como os outros quatro registros opcionais (tipo 2, 5, 6, 7). Carrega o TXID do
 * QR Code, mas o campo deve ser enviado em branco — o Sicredi gera e vincula automaticamente.
 *
 * Fonte:
 * - Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.7, p.36
 *
 * Sem confirmação de terceiros — nenhuma lib do projeto implementa este registro.
 *
 * Ver: src/schemas/banks/sicredi/cnab400/registros-opcionais/tipo8/tipo8-hibrido.md
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const TYPE8_HYBRID: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '8',
    description: 'Identificação do registro híbrido',
    canonical: null,
  },
  nosso_numero_sicredi_sem_edicao: {
    pos: [2, 16],
    type: FieldType.ALFA,
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Nosso número, sem edição',
    canonical: null,
  },
  brancos_1: {
    pos: [17, 17],
    type: FieldType.ALFA,
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Brancos (complemento de registro)',
    canonical: null,
  },
  hibrido: {
    pos: [18, 18],
    type: FieldType.ALFA,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'H',
    description: 'Identificação de boleto híbrido',
    canonical: null,
  },
  brancos_2: {
    pos: [19, 30],
    type: FieldType.ALFA,
    size: 12,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Brancos (complemento de registro)',
    canonical: null,
  },
  numero_documento: {
    pos: [31, 40],
    type: FieldType.ALFA,
    size: 10,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Seu número — deve bater com posições 111-120 do detalhe',
    canonical: null,
  },
  txid: {
    pos: [41, 75],
    type: FieldType.ALFA,
    size: 35,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Código de identificação do QR Code — enviar em branco, o Sicredi gera e vincula',
    canonical: null,
  },
  brancos_3: {
    pos: [76, 394],
    type: FieldType.ALFA,
    size: 319,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Brancos (complemento de registro)',
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
    description: 'Número sequencial do registro no arquivo',
    canonical: null,
  },
}
