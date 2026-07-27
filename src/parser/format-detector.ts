/**
 * Detecção de formato e banco de arquivos CNAB
 */

import { CNABFormatCode } from '../types'

const LINE_LENGTH = {
  CNAB_240: 240,
  CNAB_400: 400,
} as const

/**
 * Detecta se o arquivo é CNAB 240 ou 400 pelo tamanho da primeira linha.
 *
 * Não olha o conteúdo, só o comprimento — por isso um arquivo truncado ou com uma
 * linha maldividida (ex: quebra de linha a mais) já falha aqui, antes de qualquer
 * outra validação.
 *
 * @param lines - linhas do arquivo já divididas (ver `fileContent.split(/\r?\n/)` em `index.ts`),
 *   apenas `lines[0]` (o header) é usado
 * @returns `'cnab240'`/`'cnab400'`, ou `null` se `lines` estiver vazio ou o tamanho não bater com nenhum dos dois
 */
export function detectFormat(lines: string[]): CNABFormatCode | null {
  if (!lines?.length) return null

  const len = lines[0].length

  if (len === LINE_LENGTH.CNAB_240) return 'cnab240'
  if (len === LINE_LENGTH.CNAB_400) return 'cnab400'

  return null
}

/**
 * Detecta o código do banco a partir da primeira linha (header) do arquivo.
 *
 * Posições fixas conforme o padrão FEBRABAN (por isso não depende de um `BankSchema`
 * — é o próprio código do banco que decide qual `BankSchema` carregar em seguida):
 * - CNAB 400: código do banco nas posições 77-79 (1-indexed) → `substring(76, 79)` em JS (0-indexed)
 * - CNAB 240: código do banco nas posições 1-3 (1-indexed) → `substring(0, 3)` em JS
 *
 * @param headerLine - primeira linha do arquivo (registro header/header de arquivo)
 * @param format - formato já detectado por {@link detectFormat}, decide qual offset usar
 * @returns código do banco sem espaços (ex: `"237"`), ou `null` se vazio/não identificável
 */
export function detectBank(headerLine: string, format: CNABFormatCode): string | null {
  if (!headerLine) return null

  if (format === 'cnab400') {
    return headerLine.substring(76, 79).trim() || null
  }

  if (format === 'cnab240') {
    return headerLine.substring(0, 3).trim() || null
  }

  return null
}
