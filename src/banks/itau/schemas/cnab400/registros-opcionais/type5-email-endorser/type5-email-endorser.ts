/**
 * Itaú (341) — CNAB 400 — Registro Tipo 5 (E-mail / Sacador-Avalista)
 *
 * Registro opcional para informar o e-mail do pagador para entrega do boleto
 * por e-mail e/ou complementar os dados do sacador/avalista.
 *
 * IMPORTANTE:
 * - Opcional: apenas quando houver entrega por e-mail ou dados do sacador/avalista
 * - Deve vir na sequência do registro tipo 1 correspondente
 * - Não retorna no arquivo de retorno
 * - Quando dados de sacador/avalista aparecem no tipo 1 e tipo 5, prevalece o tipo 5
 * - Em ambiente de testes, o envio por e-mail não funciona (entrega física)
 *
 * ATENÇÃO: Sem evidência real no fixture (não presente no ITAU_cnab_400.REM).
 * Schema baseado exclusivamente no manual oficial Itaú, p.12.
 *
 * Fonte: Manual oficial Itaú, layout_cobranca_400bytes_cnab_itau.pdf, p.12
 */

import { RecordSchema, FieldType } from '@/types/all-types'

export const TYPE5_EMAIL_ENDORSER: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '5',
    description: 'Identificação do registro tipo 5 (e-mail / sacador-avalista)',
    canonical: null,
  },
  email_pagador: {
    pos: [2, 121],
    type: FieldType.ALFA,
    size: 120,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Endereço de e-mail do pagador para entrega do boleto',
    canonical: null,
  },
  sacador_codigo_inscricao: {
    pos: [122, 123],
    type: FieldType.NUM,
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de inscrição do sacador/avalista: 01=CPF, 02=CNPJ',
    canonical: null,
  },
  sacador_numero_inscricao: {
    pos: [124, 137],
    type: FieldType.NUM,
    size: 14,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CPF ou CNPJ do sacador/avalista',
    canonical: null,
  },
  sacador_logradouro: {
    pos: [138, 177],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Rua, número e complemento do sacador/avalista',
    canonical: null,
  },
  sacador_bairro: {
    pos: [178, 189],
    type: FieldType.ALFA,
    size: 12,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Bairro do sacador/avalista',
    canonical: null,
  },
  sacador_cep: {
    pos: [190, 197],
    type: FieldType.NUM,
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CEP do sacador/avalista',
    canonical: null,
  },
  sacador_cidade: {
    pos: [198, 212],
    type: FieldType.ALFA,
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Cidade do sacador/avalista',
    canonical: null,
  },
  sacador_estado: {
    pos: [213, 214],
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
    pos: [215, 394],
    type: FieldType.ALFA,
    size: 180,
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
