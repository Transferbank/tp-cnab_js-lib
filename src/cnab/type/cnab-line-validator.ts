import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabNumberedLine } from '@cnab/type/cnab-field'

export abstract class CnabLineValidator {
  protected readonly rawLine: string
  protected readonly lineNumber: number

  constructor(rawLine: string, lineNumber: number) {
    this.rawLine = rawLine
    this.lineNumber = lineNumber
  }

  abstract shouldValidate(): boolean

  abstract validate(): CnabValidationResult

  validateInGroup(_group: CnabNumberedLine[]): CnabValidationResult {
    return this.validate()
  }
}

export interface CnabLineValidatorClass {
  new (rawLine: string, lineNumber: number): CnabLineValidator
}