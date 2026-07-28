/**
 * Posições fixas FEBRABAN para extração de campos críticos em fallback.
 * Quando o schema do banco não define um campo, usa-se essas posições padrão
 * da especificação FEBRABAN. Todas as posições são 0-indexed.
 */

export const CNAB400_HEADER_POSITIONS = {
  CODIGO_BANCO: { start: 76, end: 79 } as const,
} as const

export const CNAB240_HEADER_POSITIONS = {
  CODIGO_BANCO: { start: 0, end: 3 } as const,
} as const

export const CNAB400_DETAIL_POSITIONS = {
  VENCIMENTO: { start: 120, end: 126 } as const,
  VALOR_TITULO: { start: 126, end: 139 } as const,
  SACADO_DOCUMENTO: { start: 220, end: 234 } as const,
  SACADO_NOME: { start: 234, end: 274 } as const,
  SACADO_ENDERECO: { start: 274, end: 314 } as const,
} as const

export const CNAB400_OPTIONAL_IDENTIFIERS = {
  SUFFIX_1: { start: 1, end: 2 } as const,
  SUFFIX_2: { start: 1, end: 3 } as const,
} as const

export const CNAB240_SEGMENT_P_POSITIONS = {
  VENCIMENTO_TITULO: { start: 77, end: 85 } as const,
  VALOR_TITULO: { start: 85, end: 100 } as const,
} as const

export const CNAB240_SEGMENT_Q_POSITIONS = {
  SACADO_INSCRICAO_NUMERO: { start: 18, end: 33 } as const,
  SACADO_NOME: { start: 33, end: 73 } as const,
  SACADO_ENDERECO: { start: 73, end: 113 } as const,
} as const

export const CNAB240_SEGMENT_Y_POSITIONS = {
  VARIANT_CODE: { start: 17, end: 19 } as const,
} as const

export function extractPosition(
  line: string,
  position: { readonly start: number; readonly end: number }
): string {
  return line.substring(position.start, position.end)
}

export function extractPositionTrimmed(
  line: string,
  position: { readonly start: number; readonly end: number }
): string {
  return extractPosition(line, position).trim()
}

export function getCnab400OptionalSuffix1(line: string): string {
  return extractPosition(line, CNAB400_OPTIONAL_IDENTIFIERS.SUFFIX_1)
}

export function getCnab400OptionalSuffix2(line: string): string {
  return extractPosition(line, CNAB400_OPTIONAL_IDENTIFIERS.SUFFIX_2)
}

export function getCnab240SegmentYVariant(line: string): string {
  return extractPosition(line, CNAB240_SEGMENT_Y_POSITIONS.VARIANT_CODE)
}

export function getCnab400BankCode(headerLine: string): string {
  return extractPositionTrimmed(headerLine, CNAB400_HEADER_POSITIONS.CODIGO_BANCO)
}

export function getCnab240BankCode(headerLine: string): string {
  return extractPositionTrimmed(headerLine, CNAB240_HEADER_POSITIONS.CODIGO_BANCO)
}
