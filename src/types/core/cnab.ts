/**
 * Tipos principais para processamento CNAB
 */

/** Rótulo amigável para exibição (ex: em UI). Não usar para comparações de lógica — use `CNABFormatCode`. */
export type CNABFormat = 'CNAB 240' | 'CNAB 400'

/** 
 * Código interno do formato, usado em toda a lógica de detecção/roteamento/grouping.
 * Valores em uppercase para consistência com o resto do código.
 */
export enum CNABFormatCode {
  CNAB240 = 'CNAB240',
  CNAB400 = 'CNAB400'
}

/**
 * Registro de cobrança "achatado" para exibição/preview (ex: tabela em UI).
 */
export interface CNABRecord {
  name: string
  amount: number
  dueDate: string
  address: string
  document: string
}

/** Um problema encontrado ao validar uma linha/campo do arquivo. */
export interface ValidationError {
  line: number
  field: string
  message: string
}

/**
 * Resultado da extração de UM campo de uma linha, feita por `extractLineFields`.
 */
export interface ParsedField {
  raw: string
  value: string | number
  error: string | null
  canonical: import('../bank').FieldDefinition['canonical']
  [key: string]: unknown
}

/** Todos os campos de UMA linha CNAB já extraídos, indexados pelo nome do campo (mesma chave usada no `RecordSchema`). */
export interface ParsedLine {
  [fieldName: string]: ParsedField
}

/**
 * Resultado da validação de um CNABFile através do método validate().
 */
export interface CNABValidationResult {
  isValid: boolean
  feedback: {
    type: CNABFormat
    bank: string
    lines: ValidationError[]
    records?: CNABRecord[]
  }
}
