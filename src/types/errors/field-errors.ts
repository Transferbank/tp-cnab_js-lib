import { CNABInputError } from './base'

export class CNABFieldValidationError extends CNABInputError {
  readonly code = 'FIELD_VALIDATION_ERROR'

  constructor(
    readonly field: string,
    readonly rawValue: string,
    reason: string
  ) {
    super(`Campo "${field}" inválido: ${reason} (valor: "${rawValue}")`)
  }
}

export class CNABBoletoValidationError extends CNABInputError {
  readonly code = 'BOLETO_VALIDATION_ERROR'

  constructor(reason: string, readonly lineNumber?: number) {
    super(
      lineNumber != null
        ? `Boleto inválido (linha ${lineNumber}): ${reason}`
        : `Boleto inválido: ${reason}`
    )
  }
}
