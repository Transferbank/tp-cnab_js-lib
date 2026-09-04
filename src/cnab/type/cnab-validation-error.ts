export enum CnabValidationErrorType {
  LINE = 'line',
  FIELD = 'field'
}

export abstract class CnabValidationError {
  readonly lineNumber: number

  constructor(params: { lineNumber: number }) {
    this.lineNumber = params.lineNumber
  }

  abstract get errorType(): CnabValidationErrorType
  abstract get message(): string
}

// Classe base para erros de linha
export abstract class CnabLineValidationError extends CnabValidationError {
  get errorType(): CnabValidationErrorType {
    return CnabValidationErrorType.LINE
  }
}

export abstract class CnabFieldValidationError extends CnabValidationError {
  readonly fieldName: string
  readonly range: [number, number]

  constructor(params: {
    lineNumber: number
    fieldName: string
    range: [number, number]
  }) {
    super({ lineNumber: params.lineNumber })
    this.fieldName = params.fieldName
    this.range = params.range
  }

  get errorType(): CnabValidationErrorType {
    return CnabValidationErrorType.FIELD
  }
}

export class CnabInvalidLineSizeError extends CnabLineValidationError {
  readonly expectedSize: number
  readonly actualSize: number

  constructor(params: {
    lineNumber: number
    expectedSize: number
    actualSize: number
  }) {
    super({ lineNumber: params.lineNumber })
    this.expectedSize = params.expectedSize
    this.actualSize = params.actualSize
  }

  get message(): string {
    return `Tamanho de linha inválido: esperado ${this.expectedSize}, recebido ${this.actualSize}`
  }
}

export class CnabInvalidLineStartError extends CnabLineValidationError {
  readonly expectedStart: string

  constructor(params: { lineNumber: number; expectedStart: string }) {
    super({ lineNumber: params.lineNumber })
    this.expectedStart = params.expectedStart
  }

  get message(): string {
    return `Início de linha inválido: esperado "${this.expectedStart}"`
  }
}

export class CnabFieldMinLengthError extends CnabFieldValidationError {
  readonly minLength: number

  constructor(params: {
    lineNumber: number
    fieldName: string
    range: [number, number]
    minLength: number
  }) {
    super({
      lineNumber: params.lineNumber,
      fieldName: params.fieldName,
      range: params.range
    })
    this.minLength = params.minLength
  }

  get message(): string {
    const capitalizedFieldName =
      this.fieldName.charAt(0).toUpperCase() + this.fieldName.slice(1)
    return `${capitalizedFieldName} espera ao menos ${this.minLength} caracteres`
  }
}
