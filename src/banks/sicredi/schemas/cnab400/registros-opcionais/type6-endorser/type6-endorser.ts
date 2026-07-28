/**
 * Sicredi (748) — CNAB 400 — Registro Tipo 6 (Beneficiário Final)
 *
 * Registro obrigatório apenas quando houver um Beneficiário Final para o título cadastrado
 * (opcional condicional). Diferente do bloco resumido de Beneficiário Final que já existe
 * dentro do detalhe (posições 340-394, só documento+nome), este registro tem campos de
 * endereço próprios (logradouro, cidade, CEP, UF).
 *
 * Nomenclatura "Beneficiário Final" segue as Circulares BACEN 3598, 3656 e 3956 — substitui
 * "Sacador"/"Avalista" usado por libs de terceiros mais antigas.
 *
 * Fonte:
 * - Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.5, p.33
 *
 * Sem confirmação de terceiros — nenhuma lib do projeto implementa este registro dedicado.
 *
 * Ver: src/schemas/banks/sicredi/cnab400/registros-opcionais/tipo6/tipo6-beneficiario-final.md
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const TYPE6_ENDORSER: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '6',
    description: 'Identificação do registro beneficiário final',
    canonical: null,
  },
  nosso_numero: {
    pos: [2, 16],
    type: FieldType.ALFA,
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Nosso número — pode ficar em branco se impressão pelo Sicredi',
    canonical: null,
  },
  numero_documento: {
    pos: [17, 26],
    type: FieldType.ALFA,
    size: 10,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Seu número — deve bater com posições 111-120 do detalhe',
    canonical: null,
  },
  codigo_pagador_cliente: {
    pos: [27, 31],
    type: FieldType.ALFA,
    size: 5,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Código do pagador junto ao cliente — zeros se não houver',
    canonical: null,
  },
  numero_inscricao_beneficiario_final: {
    pos: [32, 45],
    type: FieldType.NUM,
    size: 14,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'CPF/CNPJ do Beneficiário Final — deve ser diferente do beneficiário e do pagador',
    canonical: null,
  },
  nome_beneficiario_final: {
    pos: [46, 86],
    type: FieldType.ALFA,
    size: 41,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Nome do Beneficiário Final',
    canonical: null,
  },
  endereco: {
    pos: [87, 131],
    type: FieldType.ALFA,
    size: 45,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Endereço do Beneficiário Final',
    canonical: null,
  },
  cidade: {
    pos: [132, 151],
    type: FieldType.ALFA,
    size: 20,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Cidade do Beneficiário Final',
    canonical: null,
  },
  cep: {
    pos: [152, 159],
    type: FieldType.NUM,
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CEP do Beneficiário Final — obrigatório ser um CEP válido',
    canonical: null,
  },
  uf: {
    pos: [160, 161],
    type: FieldType.ALFA,
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'UF do Beneficiário Final',
    canonical: null,
  },
  brancos: {
    pos: [162, 394],
    type: FieldType.ALFA,
    size: 233,
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
