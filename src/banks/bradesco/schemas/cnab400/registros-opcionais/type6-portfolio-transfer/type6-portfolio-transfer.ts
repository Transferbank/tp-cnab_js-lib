/**
 * Bradesco (237) — CNAB 400 — Registro Tipo 6 (Múltiplas Transferências / Débito Automático)
 *
 * Registro opcional de remessa usado para duas finalidades:
 * 1. Múltiplas Transferências: transferir um título de uma carteira para outra
 * 2. Cadastro e Autorização para Débito Automático em instituições autorizadas BACEN
 *
 * Nota importante sobre o campo `conta`: não possui dígito verificador (diferente dos
 * tipos 2/3/7), conforme explicitado no manual.
 *
 * Relação com títulos: 1 registro tipo 6 por título (1:1), quando aplicável.
 *
 * Fonte primária:
 * - Manual oficial Bradesco: bradesco_2022_layout_400P.pdf (versão Abril/2022,
 *   revisado Março/2023), "Layout do Arquivo-Remessa - Registro de Transação-Tipo 6"
 *   (p.12/44)
 * - Manual anterior (2017): 4008-524-0121-layout-cobranca-versao-portugues.pdf
 *   (revisado 27/07/2017), p.14/57 — não revelava os campos 29-64, tratava como filler
 *
 * Ver: src/schemas/banks/bradesco/cnab400/registros-opcionais/tipo6/tipo6-transferencia-carteira.md
 */

import { RecordSchema } from '../../../../../../types'

export const TYPE6_PORTFOLIO_TRANSFER: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '6',
    description:
      'Identificação do registro (múltiplas transferências / cadastro débito automático)',
    canonical: null,
  },
  carteira: {
    pos: [2, 4],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Nº da carteira de destino',
    canonical: null,
  },
  agencia: {
    pos: [5, 9],
    type: 'num',
    size: 5,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código da agência do beneficiário',
    canonical: null,
  },
  conta: {
    pos: [10, 16],
    type: 'num',
    size: 7,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description:
      'Número da conta corrente — sem dígito verificador (diferente dos tipos 2/3/7)',
    canonical: null,
  },
  nosso_numero: {
    pos: [17, 27],
    type: 'num',
    size: 11,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Identificação do título no banco — deve coincidir com o registro tipo 1 correspondente',
    canonical: null,
  },
  dac_nosso_numero: {
    pos: [28, 28],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Dígito do nosso número',
    canonical: null,
  },
  tipo_operacao: {
    pos: [29, 29],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: "Tipo de operação: '1'=Crédito, '2'=Arrendamento Mercantil, '3'=Outros",
    canonical: null,
  },
  utilizacao_cheque_especial: {
    pos: [30, 30],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: "Utilização do cheque especial: 'S'=Sim, 'N'=Não",
    canonical: null,
  },
  consulta_saldo_apos_vencimento: {
    pos: [31, 31],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: "Consulta saldo após o vencimento: 'S'=Sim, 'N'=Não",
    canonical: null,
  },
  codigo_identificacao_contrato: {
    pos: [32, 56],
    type: 'alfa',
    size: 25,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Número código de identificação/contrato',
    canonical: null,
  },
  prazo_validade_contrato: {
    pos: [57, 64],
    type: 'data',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAAAA',
    pattern: null,
    description:
      "Prazo de validade do contrato (formato DD/MM/AAAA) ou '99999999'=indeterminado",
    canonical: null,
  },
  brancos: {
    pos: [65, 394],
    type: 'alfa',
    size: 330,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Complemento de registro (filler)',
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
