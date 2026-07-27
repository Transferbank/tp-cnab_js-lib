/**
 * Exceptions concretas para erros de agrupamento (CNABInputError).
 * Erros na lógica de agrupamento de registros em boletos.
 */

import { CNABInputError } from './base'
import type { ValidationError } from '../core'

/**
 * Erro ao agrupar registros em boletos.
 * Ex: Segmento Q sem P correspondente, sequência inválida.
 */
export class CNABGroupingError extends CNABInputError {
  readonly code = 'GROUPING_ERROR'
  readonly originalError: ValidationError

  constructor(originalError: ValidationError) {
    super(
      `Erro de agrupamento na linha ${originalError.line}: ${originalError.message}`
    )
    this.originalError = originalError
  }

  /** Atalho para originalError.line */
  get line(): number {
    return this.originalError.line
  }
}
