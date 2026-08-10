import { CNABInternalError } from './base'
import type { CNABFormatCode } from '@/types/core/cnab'


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
