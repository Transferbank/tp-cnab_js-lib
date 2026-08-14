import { CnabFormat } from '@cnab/types/cnab-format'
import { CnabBankCode } from '@cnab/types/cnab-bank-code'
import { CnabFieldType } from '@cnab/types/cnab-field-type'
import { CnabField } from '@cnab/types/cnab-field'
import { CnabValidationResult } from '@cnab/types/cnab-validation-result'
import { CnabLineValidator } from '@cnab/types/cnab-line-validator'
import { Cnab240LineSizeValidator, Cnab400LineSizeValidator } from '@cnab/validators/cnab-line-size-validator'
import { getGroupRule } from '@cnab/banks/cnab-group-rules-registry'

type ValidatorClass = typeof CnabLineValidator
type FieldClass = typeof CnabField

export class CnabLineSchema {
  public readonly format: CnabFormat
  public readonly bankCode: CnabBankCode
  public readonly fieldType: CnabFieldType
  public readonly fields: FieldClass[]
  public readonly validators: ValidatorClass[]

  constructor(config: {
    format: CnabFormat
    bankCode: CnabBankCode
    fieldType: CnabFieldType
    fields: FieldClass[]
    validators?: ValidatorClass[]
  }) {
    this.format = config.format
    this.bankCode = config.bankCode
    this.fieldType = config.fieldType
    this.fields = config.fields

    const lineSizeValidator = config.format === CnabFormat.CNAB240
      ? Cnab240LineSizeValidator
      : Cnab400LineSizeValidator

    this.validators = [lineSizeValidator, ...(config.validators ?? [])]
  }

  private isBoletoGroupStart(rawLine: string): boolean {
    const bank = CnabBankCode.getBankFromCode(this.bankCode)
    const GroupRule = getGroupRule(bank, this.format)
    return GroupRule.check(rawLine)
  }

  private *genBoletoLineGroupsIterator(rawLines: string[]): Generator<string[]> {
    let boletoRawLines: string[] = []

    for (const rawLine of rawLines) {
      if (this.isBoletoGroupStart(rawLine)) {
        if (boletoRawLines.length !== 0) {
          yield boletoRawLines
        }
        boletoRawLines = [rawLine]
      } else if (boletoRawLines.length > 0) {
        boletoRawLines.push(rawLine)
      }
    }

    if (boletoRawLines.length > 0) {
      yield boletoRawLines
    }
  }

  validate(
    rawLines: string[],
    isEager: boolean,
    extraFields: FieldClass[],
    firstLine: number
  ): CnabValidationResult {
    const result: CnabValidationResult = {
      isValid: true,
      errors: []
    }

    const validationTypes: (ValidatorClass | FieldClass)[] = [
      ...this.validators,
      ...this.fields,
      ...extraFields
    ]

    let lineNumber = firstLine

    const groupLines = this.fieldType === CnabFieldType.BOLETO
      ? this.genBoletoLineGroupsIterator(rawLines)
      : [[...rawLines]]

    for (const group of groupLines) {
      for (const rawLine of group) {
        for (const ValidationType of validationTypes) {
          if (!ValidationType.shouldValidate(rawLine)) {
            continue
          }

          // @ts-expect-error - ValidationType pode ser abstrato, mas subclasses concretas serão instanciadas
          const validator = new ValidationType({
            rawLine,
            lineNumber
          })
          
          const validationResult = validator.validate()

          result.isValid = result.isValid && validationResult.isValid
          result.errors.push(...validationResult.errors)

          if (!result.isValid && isEager) {
            return result
          }
        }
        lineNumber++
      }
    }

    return result
  }
}
