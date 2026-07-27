/**
 * Exceptions concretas para inconsistências internas (CNABInternalError).
 * Erros que indicam bugs ou problemas de configuração da biblioteca.
 * Consumidores que receberem devem reportar como issue.
 */

import { CNABInternalError } from './base'
import type { CNABFormatCode } from '../core'

/**
 * Inconsistência entre registries internos da lib.
 * Ex: schema cadastrado mas regra de agrupamento não encontrada.
 */
export class CNABInternalInconsistencyError extends CNABInternalError {
  readonly code = 'INTERNAL_INCONSISTENCY'
  readonly bankCode: string
  readonly format: CNABFormatCode

  constructor(bankCode: string, format: CNABFormatCode) {
    super(
      `Inconsistência interna: schema cadastrado para ${bankCode} ${format}, mas sem regra de agrupamento correspondente`
    )
    this.bankCode = bankCode
    this.format = format
  }
}
