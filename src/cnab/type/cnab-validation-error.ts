import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'

export enum CnabValidationErrorType {
  LINE = 'line',
  FIELD = 'field',
  LAYOUT = 'layout'
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
  readonly fieldKey: string
  readonly range: [number, number]

  constructor(params: {
    lineNumber: number
    fieldKey: string
    range: [number, number]
  }) {
    super({ lineNumber: params.lineNumber })
    this.fieldKey = params.fieldKey
    this.range = params.range
  }

  // 'nome_do_sacado' -> 'Nome do sacado'
  get fieldLabel(): string {
    const label = this.fieldKey.replace(/_/g, ' ').toLowerCase()
    return label.charAt(0).toUpperCase() + label.slice(1)
  }

  get errorType(): CnabValidationErrorType {
    return CnabValidationErrorType.FIELD
  }
}

export abstract class CnabLayoutValidationError extends CnabValidationError {
  readonly bank: CnabBank
  readonly format: CnabFormat

  constructor(params: { bank: CnabBank; format: CnabFormat }) {
    super({ lineNumber: 0 })
    this.bank = params.bank
    this.format = params.format
  }

  get errorType(): CnabValidationErrorType {
    return CnabValidationErrorType.LAYOUT
  }
}

export class CnabMissingEssentialFieldError extends CnabLayoutValidationError {
  readonly fieldKey: string

  constructor(params: { bank: CnabBank; format: CnabFormat; fieldKey: string }) {
    super({ bank: params.bank, format: params.format })
    this.fieldKey = params.fieldKey
  }

  get message(): string {
    return `Layout CNAB${this.format} do banco ${this.bank} não possui o campo essencial ${this.fieldKey}`
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
    fieldKey: string
    range: [number, number]
    minLength: number
  }) {
    super({
      lineNumber: params.lineNumber,
      fieldKey: params.fieldKey,
      range: params.range
    })
    this.minLength = params.minLength
  }

  get message(): string {
    return `${this.fieldLabel} espera ao menos ${this.minLength} caracteres`
  }
}

export class CnabGenericFieldError extends CnabFieldValidationError {
  readonly customMessage: string

  constructor(params: {
    message: string
    lineNumber: number
    fieldKey: string
    range: [number, number]
  }) {
    super({
      lineNumber: params.lineNumber,
      fieldKey: params.fieldKey,
      range: params.range
    })
    this.customMessage = params.message
  }

  get message(): string {
    return this.customMessage
  }
}

export abstract class CnabFieldParseError extends Error {
  readonly fieldKey: string
  readonly rawValue: string

  constructor(message: string, fieldKey: string, rawValue: string) {
    super(message)
    this.name = this.constructor.name
    this.fieldKey = fieldKey
    this.rawValue = rawValue
  }
}

export class CnabFieldInvalidNumberError extends CnabFieldParseError {
  constructor(fieldKey: string, rawValue: string) {
    super(`Valor numérico inválido no campo ${fieldKey}: ${rawValue}`, fieldKey, rawValue)
  }
}

export class CnabFieldInvalidDateError extends CnabFieldParseError {
  constructor(fieldKey: string, rawValue: string) {
    super(`Data inválida no campo ${fieldKey}: ${rawValue}`, fieldKey, rawValue)
  }
}
