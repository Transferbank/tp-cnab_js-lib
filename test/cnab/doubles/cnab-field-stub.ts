import { CnabField } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

interface CnabOptionalFieldStubOptions {
  fieldName?: string
  range?: [number, number]
  shouldValidateResult?: boolean
  parseValueImpl?: (rawValue: string) => string
  performValidationResult?: CnabValidationResult
}

export class CnabOptionalFieldStub extends CnabField<string> {
  static readonly isOptional = true

  readonly fieldName: string
  readonly range: [number, number]

  private readonly shouldValidateResult: boolean
  private readonly parseValueImpl: (rawValue: string) => string
  private readonly performValidationResult: CnabValidationResult

  constructor(rawLine: string, lineNumber: number, options: CnabOptionalFieldStubOptions = {}) {
    super(rawLine, lineNumber)
    this.fieldName = options.fieldName ?? 'campo opcional de teste'
    this.range = options.range ?? [1, 5]
    this.shouldValidateResult = options.shouldValidateResult ?? true
    this.parseValueImpl = options.parseValueImpl ?? ((rawValue: string): string => rawValue)
    this.performValidationResult = options.performValidationResult ?? { isValid: true, errors: [] }
  }

  shouldValidate(): boolean {
    return this.shouldValidateResult
  }

  protected performValidation(): CnabValidationResult {
    return this.performValidationResult
  }

  protected parseValue(rawValue: string): string {
    return this.parseValueImpl(rawValue)
  }
}
