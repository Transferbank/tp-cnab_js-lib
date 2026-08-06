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

export class CNABFieldNotFoundError extends CNABInputError {
  readonly code = 'FIELD_NOT_FOUND'

  constructor(readonly fieldKey: string, readonly isExtraField: boolean = false) {
    super(
      isExtraField
        ? `Campo extra "${fieldKey}" não encontrado`
        : `Campo "${fieldKey}" não encontrado`
    )
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

export class CNABBoletoNotFoundError extends CNABInputError {
  readonly code = 'BOLETO_NOT_FOUND'

  constructor(readonly index: number, readonly boletoCount: number) {
    super(`Boleto ${index} não existe (o arquivo tem ${boletoCount} boleto(s))`)
  }
}

export class CNABDocumentValidationError extends CNABInputError {
  readonly code = 'DOCUMENT_VALIDATION_ERROR'

  constructor(reason: string, readonly lineNumber?: number) {
    super(
      lineNumber != null
        ? `Arquivo inválido (linha ${lineNumber}): ${reason}`
        : `Arquivo inválido: ${reason}`
    )
  }
}
