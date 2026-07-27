/**
 * Sicredi (748) — CNAB 400 — Registro Tipo 7 (Descontos 2 e 3)
 *
 * Registro opcional que permite cadastrar um 2º e 3º nível de desconto (data limite + valor
 * ou percentual, cada) para o mesmo título, além do desconto 1 do detalhe (posições 180-192).
 * Só deve ser gerado quando o desconto 1 já foi informado; é mutuamente excludente com o
 * desconto por dia de antecipação do detalhe (posições 83-92).
 *
 * Fonte:
 * - Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.6, p.34
 *
 * Sem confirmação de terceiros — nenhuma lib do projeto implementa este registro.
 *
 * Ver: src/schemas/banks/sicredi/cnab400/registros-opcionais/tipo7/tipo7-descontos.md
 */

import { RecordSchema } from '../../../../../../types'

export const TYPE7_DISCOUNTS: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '7',
    description: 'Identificação do registro descontos 2 e 3',
    canonical: null,
  },
  nosso_numero: {
    pos: [2, 16],
    type: 'alfa',
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
    type: 'alfa',
    size: 10,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Seu número — deve bater com posições 111-120 do detalhe',
    canonical: null,
  },
  numero_inscricao_pagador: {
    pos: [27, 40],
    type: 'num',
    size: 14,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'CPF/CNPJ do pagador — dado real mesmo em homologação',
    canonical: null,
  },
  numero_inscricao_beneficiario_final: {
    pos: [41, 54],
    type: 'num',
    size: 14,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CPF/CNPJ do Beneficiário Final — vazio se não existir',
    canonical: null,
  },
  data_limite_desconto_2: {
    pos: [55, 60],
    type: 'data',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: 'DDMMAA',
    pattern: null,
    description: 'Data limite para o 2º desconto',
    canonical: null,
  },
  valor_desconto_2: {
    pos: [61, 73],
    type: 'num',
    size: 13,
    decimals: 2,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Valor ou percentual do 2º desconto',
    canonical: null,
  },
  data_limite_desconto_3: {
    pos: [74, 79],
    type: 'data',
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAA',
    pattern: null,
    description: 'Data limite para o 3º desconto',
    canonical: null,
  },
  valor_desconto_3: {
    pos: [80, 92],
    type: 'num',
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor ou percentual do 3º desconto',
    canonical: null,
  },
  brancos: {
    pos: [93, 394],
    type: 'alfa',
    size: 302,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Brancos (complemento de registro)',
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
    description: 'Número sequencial do registro no arquivo',
    canonical: null,
  },
}
