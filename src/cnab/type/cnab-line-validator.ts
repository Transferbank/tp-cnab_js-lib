import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

export abstract class CnabLineValidator {
  protected readonly rawLine: string
  protected readonly lineNumber: number

  constructor(rawLine: string, lineNumber: number) {
    this.rawLine = rawLine
    this.lineNumber = lineNumber
  }

  abstract shouldValidate(): boolean

  abstract validate(): CnabValidationResult
}

export type CnabLineValidatorClass = typeof CnabLineValidator