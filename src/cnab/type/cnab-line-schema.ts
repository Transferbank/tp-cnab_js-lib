import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CNAB_GROUP_RULES } from '@cnab/bank/cnab-group-rules'
import { CnabLineValidator } from '@cnab/type/cnab-line-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGroupRuleNotFoundException } from '@cnab/exception/cnab-exception'
import {
  Cnab240LineSizeValidator,
  Cnab400LineSizeValidator
} from '@cnab/validators/cnab-line-size-validator'

type FieldClass = typeof CnabField
type ValidatorConstructor = new (params: { rawLine: string; lineNumber: number }) => CnabLineValidator

export class CnabLineSchema {
  public readonly fmt: CnabFormat
  public readonly bank: CnabBank
  public readonly fieldType: CnabFieldType
  public readonly fields: FieldClass[]
  public readonly validators: ValidatorConstructor[]

  constructor(config: {
    fmt: CnabFormat
    bank: CnabBank
    fieldType: CnabFieldType
    fields: FieldClass[]
    validators?: ValidatorConstructor[]
  }) {
    this.fmt = config.fmt
    this.bank = config.bank
    this.fieldType = config.fieldType
    this.fields = config.fields

    const lineSizeValidator = config.fmt === CnabFormat.CNAB240
      ? Cnab240LineSizeValidator
      : Cnab400LineSizeValidator
    this.validators = [lineSizeValidator, ...(config.validators ?? [])]
  }

  private isBoletoGroupStart(rawLine: string): boolean {
    const GroupRuleClass = CNAB_GROUP_RULES[this.bank][this.fmt]
    if (GroupRuleClass == null) {
      throw new CnabGroupRuleNotFoundException(this.bank, this.fmt)
    }
    const groupRule = new GroupRuleClass()
    return groupRule.check(rawLine)
  }

  private *genBoletoLineGroupsIterator(rawLines: string[]): Generator<string[]> {
    let boletoRawLines: string[] = []
    for (const rawLine of rawLines) {
      if (this.isBoletoGroupStart(rawLine)) {
        if (boletoRawLines.length !== 0) 
          yield boletoRawLines
        boletoRawLines = [rawLine]
      } else if (boletoRawLines.length > 0) 
        boletoRawLines.push(rawLine)
    }
    if (boletoRawLines.length > 0) 
      yield boletoRawLines
  }

  validate(
    rawLines: string[],
    eagerEnabled: boolean,
    firstLine: number,
    extraFields?: FieldClass[]
  ): CnabValidationResult {
    const fields = extraFields ?? []
    const result: CnabValidationResult = {
      isValid: true,
      errors: []
    }
    const validationTypes: (ValidatorConstructor | FieldClass)[] = [
      ...this.validators,
      ...this.fields,
      ...fields
    ]
    let lineNumber = firstLine
    const groupLines = this.fieldType === CnabFieldType.BOLETO
      ? this.genBoletoLineGroupsIterator(rawLines)
      : [rawLines]
    for (const group of groupLines) {
      for (const rawLine of group) {
        for (const ValidationType of validationTypes) {
          const validator = new (ValidationType as ValidatorConstructor)({
            rawLine,
            lineNumber
          })
          
          if (!validator.shouldValidate()) 
            continue

          const validationResult = validator.validate()
          result.isValid = result.isValid && validationResult.isValid
          result.errors.push(...validationResult.errors)
          if (!result.isValid && eagerEnabled) 
            return result
        }
        ++lineNumber
      }
    }
    return result
  }
}