import { CnabValidationResult } from './cnab-validation-result'

export abstract class CnabLineValidator {
  protected readonly rawLine: string
  protected readonly lineNumber: number

  constructor(config: { rawLine: string; lineNumber: number }) {
    this.rawLine = config.rawLine
    this.lineNumber = config.lineNumber
  }

  abstract shouldValidate(): boolean

  abstract validate(): CnabValidationResult
}