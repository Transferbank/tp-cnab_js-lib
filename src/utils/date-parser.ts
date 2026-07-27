/**
 * Utilitários para parseamento de datas em formatos CNAB
 */

import { DateFormat } from '../types'

/**
 * Parseia data no formato DDMMAA (6 dígitos, usado no CNAB 400).
 *
 * Assume sempre século 21: os 2 dígitos de ano `AA` viram `2000 + AA` (ex: "99" → 2099,
 * nunca 1999). Isso é intencional para boletos de cobrança (não fazem sentido no século 20),
 * mas significa que esta função não deve ser reaproveitada para datas históricas.
 *
 * @param str - exatamente 6 dígitos numéricos, sem separadores (`DDMMAA`)
 * @returns `Date` correspondente, ou `null` se `str` não tiver o formato esperado ou representar
 *   uma data inexistente (ex: "310200" = 31/02 — detectado comparando dia/mês/ano de volta,
 *   já que `Date` do JS "rola" datas inválidas para o mês seguinte em vez de rejeitá-las)
 */
export function parseDateDDMMAA(str: string): Date | null {
  if (!str || str.length !== 6 || !/^\d{6}$/.test(str)) return null

  const day = parseInt(str.substring(0, 2), 10)
  const month = parseInt(str.substring(2, 4), 10)
  const year = 2000 + parseInt(str.substring(4, 6), 10)

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

/**
 * Parseia data no formato DDMMAAAA (8 dígitos, ano com 4 dígitos — usado no CNAB 240).
 *
 * @param str - exatamente 8 dígitos numéricos, sem separadores (`DDMMAAAA`)
 * @returns `Date` correspondente, ou `null` se `str` não tiver o formato esperado ou
 *   representar uma data inexistente (mesma checagem de "round-trip" usada em {@link parseDateDDMMAA})
 */
export function parseDateDDMMAAAA(str: string): Date | null {
  if (!str || str.length !== 8 || !/^\d{8}$/.test(str)) return null

  const day = parseInt(str.substring(0, 2), 10)
  const month = parseInt(str.substring(2, 4), 10)
  const year = parseInt(str.substring(4, 8), 10)

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

/**
 * Parseia data no formato AAAAMMDD (8 dígitos, ano na frente — usado pelo Sicredi no CNAB 400
 * em vez do DDMMAAAA convencional).
 *
 * @param str - exatamente 8 dígitos numéricos, sem separadores (`AAAAMMDD`)
 * @returns `Date` correspondente, ou `null` se `str` não tiver o formato esperado ou
 *   representar uma data inexistente (mesma checagem de "round-trip" usada em {@link parseDateDDMMAAAA})
 */
export function parseDateAAAAMMDD(str: string): Date | null {
  if (!str || str.length !== 8 || !/^\d{8}$/.test(str)) return null

  const year = parseInt(str.substring(0, 4), 10)
  const month = parseInt(str.substring(4, 6), 10)
  const day = parseInt(str.substring(6, 8), 10)

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

/**
 * Parseia uma data usando o formato declarado no schema do campo (`FieldDefinition.formatoData`).
 * Ponto único de entrada para os validadores — evita que cada um decida "qual parser chamar".
 *
 * @param str - valor bruto/trimado do campo de data (ver `ParsedField.raw`)
 * @param dateFormat - `'DDMMAA'`, `'DDMMAAAA'`, `'AAAAMMDD'`, ou `null` (campo não é de data / formato desconhecido)
 * @returns `Date` parseada, ou `null` se `dateFormat` for `null`/não reconhecido ou a data for inválida
 */
export function parseDate(str: string, dateFormat: DateFormat): Date | null {
  if (dateFormat === 'DDMMAA') return parseDateDDMMAA(str)
  if (dateFormat === 'DDMMAAAA') return parseDateDDMMAAAA(str)
  if (dateFormat === 'AAAAMMDD') return parseDateAAAAMMDD(str)
  return null
}

/**
 * Verifica se a data é anterior a hoje (usado para sinalizar boleto com vencimento vencido).
 * Compara apenas a data (ignora hora): `date` no dia de hoje retorna `false` (não é "passado").
 *
 * @param date - data já parseada (ex: retorno de {@link parseDate})
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Formata uma data para exibição no padrão brasileiro `DD/MM/AAAA`.
 * Usado nas mensagens de erro e no `CNABRecord.dueDate` do preview — note que o resultado
 * é sempre uma `string`, não deve ser reconvertido para `Date` (não há função inversa aqui).
 */
export function formatDateBR(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
