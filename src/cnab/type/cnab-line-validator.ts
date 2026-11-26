import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGroupReader } from '@cnab/type/cnab-group-reader'

export abstract class CnabLineValidator {
  protected readonly rawLine: string
  protected readonly lineNumber: number

  constructor(rawLine: string, lineNumber: number) {
    this.rawLine = rawLine
    this.lineNumber = lineNumber
  }

  abstract shouldValidate(): boolean

  abstract validate(): CnabValidationResult

  validateInGroup(_group: CnabGroupReader): CnabValidationResult {
    return this.validate()
  }
}

export interface CnabLineValidatorClass {
  new (rawLine: string, lineNumber: number): CnabLineValidator
}