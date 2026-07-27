/**
 * Exceptions para modo lazy (CNABError direto).
 * Não é erro de input nem inconsistência interna - é wrapper de segurança específico do modo lazy.
 */

import { CNABError } from './base'

/**
 * Falha inesperada durante resolve() de LazyBillItem.
 * Envolve o erro original para adicionar contexto (startLine).
 */
export class CNABLazyResolveError extends CNABError {
  readonly code = 'LAZY_RESOLVE_FAILED'
  readonly startLine: number
  readonly cause: unknown

  constructor(startLine: number, cause: unknown) {
    const causeMessage = cause instanceof Error ? cause.message : String(cause)
    super(
      `Falha ao resolver boleto lazy (startLine: ${startLine}): ${causeMessage}`
    )
    this.startLine = startLine
    this.cause = cause
  }
}
