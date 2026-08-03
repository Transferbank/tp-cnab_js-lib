/**
 * Bradesco (237) — CNAB 400 — Registro Tipo 2 (Mensagem / Descontos Adicionais)
 *
 * Registro opcional de remessa que serve duas finalidades independentes:
 * 1. Até 4 mensagens livres de 80 caracteres cada, impressas no boleto
 * 2. 2 descontos adicionais (2º e 3º desconto), além do desconto do detalhe tipo 1
 *
 * Nota 1: Para o sistema considerar uma linha por mensagem, é preciso preencher
 * no mínimo 41 caracteres dentro de cada intervalo de 80 posições.
 *
 * Nota 2: Este layout foi implementado para permitir mais dois novos descontos.
 * O desconto do registro tipo 1 continua funcionando normalmente.
 *
 * Relação com títulos: 1 registro tipo 2 por título (1:1), imediatamente após
 * o detalhe tipo 1 correspondente.
 *
 * Fonte:
 * - Manual oficial Bradesco: 4008-524-0121-layout-cobranca-versao-portugues.pdf
 *   (revisado 27/07/2017), "Lay-out do Arquivo-Remessa - Registro de Transação-Tipo 2"
 *   (p.11-12/57)
 * - Evidência real: tests/fixtures/cnab400/bradesco/remessa-multipla.txt
 *   (37 registros tipo 2, um para cada detalhe tipo 1)
 *
 * Ver: src/schemas/banks/bradesco/cnab400/registros-opcionais/tipo2/tipo2-mensagem-descontos-adicionais.md
 */

import { RecordSchema, DateFormat, FieldType } from '@/types/all-types'

export const TYPE2_MESSAGES_DISCOUNTS: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '2',
    description: 'Identificação do registro (mensagem/descontos adicionais)',
    canonical: null,
  },
  mensagem_1: {
    pos: [2, 81],
    type: FieldType.ALFA,
    size: 80,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      '1ª mensagem livre impressa no boleto — para contar como linha, preencher no mínimo 41 caracteres',
    canonical: null,
  },
  mensagem_2: {
    pos: [82, 161],
    type: FieldType.ALFA,
    size: 80,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      '2ª mensagem livre impressa no boleto — para contar como linha, preencher no mínimo 41 caracteres',
    canonical: null,
  },
  mensagem_3: {
    pos: [162, 241],
    type: FieldType.ALFA,
    size: 80,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      '3ª mensagem livre impressa no boleto — para contar como linha, preencher no mínimo 41 caracteres',
    canonical: null,
  },
  mensagem_4: {
    pos: [242, 321],
    type: FieldType.ALFA,
    size: 80,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      '4ª mensagem livre impressa no boleto — para contar como linha, preencher no mínimo 41 caracteres',
    canonical: null,
  },
  data_limite_desconto_2: {
    pos: [322, 327],
    type: FieldType.DATA,
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: DateFormat.DDMMAA,
    pattern: null,
    description: 'Data limite para concessão do 2º desconto',
    canonical: null,
  },
  valor_desconto_2: {
    pos: [328, 340],
    type: FieldType.NUM,
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor do 2º desconto',
    canonical: null,
  },
  data_limite_desconto_3: {
    pos: [341, 346],
    type: FieldType.DATA,
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: DateFormat.DDMMAA,
    pattern: null,
    description: 'Data limite para concessão do 3º desconto',
    canonical: null,
  },
  valor_desconto_3: {
    pos: [347, 359],
    type: FieldType.NUM,
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor do 3º desconto',
    canonical: null,
  },
  reserva: {
    pos: [360, 366],
    type: FieldType.ALFA,
    size: 7,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reserva/filler — sem uso definido pelo manual',
    canonical: null,
  },
  carteira: {
    pos: [367, 369],
    type: FieldType.NUM,
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Nº da carteira do beneficiário — deve coincidir com o registro tipo 1 correspondente',
    canonical: null,
  },
  agencia: {
    pos: [370, 374],
    type: FieldType.NUM,
    size: 5,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código da agência do beneficiário — deve coincidir com o registro tipo 1 correspondente',
    canonical: null,
  },
  conta: {
    pos: [375, 381],
    type: FieldType.NUM,
    size: 7,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description:
      'Número da conta corrente do beneficiário — deve coincidir com o registro tipo 1 correspondente',
    canonical: null,
  },
  dac_conta: {
    pos: [382, 382],
    type: FieldType.ALFA,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Dígito da conta corrente (DAC C/C) — deve coincidir com o registro tipo 1 correspondente',
    canonical: null,
  },
  nosso_numero: {
    pos: [383, 393],
    type: FieldType.NUM,
    size: 11,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Identificação do título no banco — deve coincidir com o registro tipo 1 correspondente',
    canonical: null,
  },
  dac_nosso_numero: {
    pos: [394, 394],
    type: FieldType.ALFA,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Dígito do nosso número — deve coincidir com o registro tipo 1 correspondente',
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
