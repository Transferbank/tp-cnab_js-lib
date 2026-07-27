/**
 * Itaú (341) — CNAB 400 — Registro Tipo 2 (Complemento de Multa)
 *
 * Registro opcional que pode ser enviado logo após cada detalhe (tipo 1)
 * para registrar ou alterar valores/percentuais de multa do título.
 *
 * IMPORTANTE:
 * - Opcional: só necessário quando houver multa a registrar
 * - Deve vir imediatamente após o tipo 1 correspondente
 * - Não retorna no arquivo de retorno (erros reportados no tipo 1)
 * - Máximo 1 registro tipo 2 por boleto
 * - data_multa usa formato DDMMAAAA (8 dígitos) - diferente do resto do layout
 *
 * Confirmado no fixture real: 319 títulos, cada um seguido de um tipo 2.
 *
 * Fonte: Manual oficial Itaú, layout_cobranca_400bytes_cnab_itau.pdf, p.9
 */

import { RecordSchema } from '../../../../../../types'

export const TYPE2_FINE: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '2',
    description: 'Identificação do registro tipo 2 (complemento de multa)',
    canonical: null,
  },
  cod_multa: {
    pos: [2, 2],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Código da multa (ver NOTA 35 do manual)',
    canonical: null,
  },
  data_multa: {
      pos: [3, 10],
      type: 'data',
      size: 8,
      decimals: 0,
      required: false,
      dateFormat: 'DDMMAAAA',
      pattern: null,
      description: 'Data da multa (formato DDMMAAAA com 8 dígitos - atenção: diferente do padrão DDMMAA do resto do layout)',
    canonical: null,
  },
  multa: {
    pos: [11, 23],
    type: 'num',
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor ou percentual de multa (2 decimais implícitas - conferir regras da NOTA 35)',
    canonical: null,
  },
  brancos: {
    pos: [24, 394],
    type: 'alfa',
    size: 371,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Brancos (complemento de registro - 371 caracteres)',
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
