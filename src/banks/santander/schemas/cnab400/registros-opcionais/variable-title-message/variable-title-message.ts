/**
 * Santander (033) — CNAB 400 — Registros Tipo 2/4/5/6/7 (Mensagem Variável por Título)
 *
 * Cinco códigos de registro diferentes (2, 4, 5, 6 e 7) que compartilham exatamente
 * o mesmo layout, mas com diferença semântica conforme manual 2025:
 * - '2' = mensagem no Recibo do Pagador — até 3 mensagens por linha, até 24 vezes;
 *   disponibilizada na emissão de 2ª via nos canais Santander (até 7 linhas no Recibo)
 * - '4', '5', '6', '7' = mensagens na Ficha de Compensação — cada código enviado
 *   somente 1 vez; NÃO disponibilizadas na emissão de 2ª via nos canais Santander
 *
 * Fonte:
 * - Manual oficial Santander (v2.36, jul/2025) — seção "Registro Movimento - Remessa -
 *   mensagem variável p/ boleto (opcional)" (p.11)
 *
 * PARTICULARIDADES E INCERTEZAS:
 * - O registro tem 3 blocos de mensagem variável, cada um precedido por um marcador
 *   de subsequência de 2 dígitos: bloco 1 (subsequência '01', mensagem 50-99),
 *   bloco 2 (subsequência '02', mensagem 102-151), bloco 3 (mensagem 154-203)
 * - INCONSISTÊNCIA DO MANUAL: o marcador de subsequência do bloco 3 (posição 152-153)
 *   aparece no manual com conteúdo '02' (repetido do bloco 2), quando o esperado por
 *   analogia seria '03'. Pode ser erro de digitação do manual (mais provável) ou
 *   intencional. subsequencia_3 NÃO tem padrão fixo até confirmar contra arquivo real.
 * - codigo_agencia (18-21), conta_movimento (22-29) e conta_cobranca (30-37) formam,
 *   juntos, os mesmos 20 bytes que em outros registros do Santander aparecem como um
 *   único campo codigo_transmissao — aqui o manual 2025 mostra a subdivisão
 *   explicitamente
 * - Aviso oficial (FEBRABAN): não é recomendado utilizar as expressões "taxa bancária"
 *   ou "tarifa bancária" no texto da mensagem de cobrança
 * - reservado_3 tem 179 bytes (não 283 como na versão anterior deste documento baseada
 *   no manual de 2009, que errou a estrutura ao não reconhecer os blocos 2 e 3)
 */

import { RecordSchema } from '../../../../../../types'

export const VARIABLE_TITLE_MESSAGE: RecordSchema = {
  codigo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description:
      "Identificação do registro: 2=Recibo do pagador; 4/5/6/7=Ficha de compensação (sem padrão fixo — variável conforme uso)",
    canonical: null,
  },
  reservado_1: {
    pos: [2, 17],
    type: 'alfa',
    size: 16,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
    canonical: null,
  },
  codigo_agencia: {
    pos: [18, 21],
    type: 'num',
    size: 4,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Código da agência do beneficiário',
    canonical: null,
  },
  conta_movimento: {
    pos: [22, 29],
    type: 'num',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conta movimento do beneficiário',
    canonical: null,
  },
  conta_cobranca: {
    pos: [30, 37],
    type: 'num',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conta cobrança do beneficiário',
    canonical: null,
  },
  reservado_2: {
    pos: [38, 47],
    type: 'alfa',
    size: 10,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
    canonical: null,
  },
  subsequencia_1: {
    pos: [48, 49],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '01',
    description: 'Subsequência do 1º bloco de mensagem',
    canonical: null,
  },
  mensagem_1: {
    pos: [50, 99],
    type: 'alfa',
    size: 50,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: '1º bloco de mensagem variável por boleto',
    canonical: null,
  },
  subsequencia_2: {
    pos: [100, 101],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '02',
    description: 'Subsequência do 2º bloco de mensagem',
    canonical: null,
  },
  mensagem_2: {
    pos: [102, 151],
    type: 'alfa',
    size: 50,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: '2º bloco de mensagem variável por boleto',
    canonical: null,
  },
  subsequencia_3: {
    pos: [152, 153],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      "Subsequência do 3º bloco — manual mostra '02' (repetido do bloco 2), provável erro de digitação; não fixar padrão até confirmar",
    canonical: null,
  },
  mensagem_3: {
    pos: [154, 203],
    type: 'alfa',
    size: 50,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: '3º bloco de mensagem variável por boleto',
    canonical: null,
  },
  reservado_3: {
    pos: [204, 382],
    type: 'alfa',
    size: 179,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco)',
    canonical: null,
  },
  identificador_complemento: {
    pos: [383, 383],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Identificador do complemento (nota 2 do manual)',
    canonical: null,
  },
  complemento: {
    pos: [384, 385],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Complemento (nota 2 do manual)',
    canonical: null,
  },
  reservado_4: {
    pos: [386, 394],
    type: 'alfa',
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco), brancos',
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
