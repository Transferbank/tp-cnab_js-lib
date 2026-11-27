import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabField, CnabFieldClass, CnabNumberedLine } from '@cnab/type/cnab-field'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineValidatorClass } from '@cnab/type/cnab-line-validator'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  Cnab240LineSizeValidator,
  Cnab400LineSizeValidator,
} from '@cnab/validators/cnab-line-size-validator'

export class CnabLineSchema {
  readonly bank: CnabBank
  readonly fmt: CnabFormat
  readonly boletoGroupRule: CnabBoletoGroupRule
  readonly fieldType: CnabFieldType
  readonly fields: CnabFieldClass[]
  readonly declaredValidators: CnabLineValidatorClass[]

  private cachedValidators?: CnabLineValidatorClass[]

  private constructor(config: {
    bank: CnabBank
    fmt: CnabFormat
    boletoGroupRule: CnabBoletoGroupRule
    fieldType: CnabFieldType
    fields: CnabFieldClass[]
    validators?: CnabLineValidatorClass[]
  }) {
    this.bank = config.bank
    this.fmt = config.fmt
    this.boletoGroupRule = config.boletoGroupRule
    this.fieldType = config.fieldType
    this.fields = config.fields
    this.declaredValidators = config.validators ?? []
  }

  static create(config: {
    bank: CnabBank
    fmt: CnabFormat
    boletoGroupRule: CnabBoletoGroupRule
    fieldType: CnabFieldType
    fields: CnabFieldClass[]
    validators?: CnabLineValidatorClass[]
  }): CnabLineSchema {
    return new CnabLineSchema(config)
  }

  get validators(): CnabLineValidatorClass[] {
    if (this.cachedValidators == null) {
      const lineSizeValidators: Record<CnabFormat, CnabLineValidatorClass> = {
        [CnabFormat.CNAB240]: Cnab240LineSizeValidator,
        [CnabFormat.CNAB400]: Cnab400LineSizeValidator,
      }

      this.cachedValidators = [lineSizeValidators[this.fmt], ...this.declaredValidators]
    }
    return this.cachedValidators
  }

  isBoletoGroupStart(rawLine: string): boolean {
    return this.boletoGroupRule.check(rawLine)
  }

  *genLineGroups(rawLines: string[], firstLine: number): Generator<CnabNumberedLine[]> {
    const numberedLines: CnabNumberedLine[] = Array.from(
      rawLines,
      (line: string, index: number): CnabNumberedLine => ({ lineNumber: firstLine + index, rawLine: line })
    )

    if (this.fieldType !== CnabFieldType.BOLETO) {
      yield numberedLines
      return
    }

    let group: CnabNumberedLine[] = []

    for (const numberedLine of numberedLines) {
      const { rawLine } = numberedLine
      if (this.isBoletoGroupStart(rawLine)) {
        if (group.length !== 0) {
          yield group
        }
        group = [numberedLine]
      } else if (this.boletoGroupRule.isOutsideBoleto(rawLine)) {
        if (group.length != 0) {
          yield group
        }
        group = []
        yield [numberedLine]
      } else if (group.length > 0) {
        group.push(numberedLine)
      }
    }

    if (group.length !== 0) {
      yield group
    }
  }

  validate(
    rawLines: string[],
    eagerEnabled: boolean,
    firstLine: number,
    extraFields: CnabFieldClass[]
  ): CnabValidationResult {
    const result: CnabValidationResult = { isValid: true, errors: [] }
    const fields = [...this.fields, ...extraFields]

    for (const group of this.genLineGroups(rawLines, firstLine)) {
      const groupValidations: Array<[CnabField<unknown>, CnabValidationResult]> = []

      for (const { lineNumber, rawLine } of group) {
        for (const validatorType of this.validators) {
          const validator = new validatorType(rawLine, lineNumber)

          if (!validator.shouldValidate()) {
            continue
          }

          this.mergeValidationResult(result, validator.validate())
          if (!result.isValid && eagerEnabled) {
            return result
          }
        }

        for (const fieldType of fields) {
          const field = new fieldType(rawLine, lineNumber)

          if (!field.shouldValidate()) {
            continue
          }

          const lineResult = field.validate()

          if (fieldType.resolvesInGroup) {
            groupValidations.push([field, lineResult])
            continue
          }

          this.mergeValidationResult(result, lineResult)
          if (!result.isValid && eagerEnabled) {
            return result
          }
        }
      }

      for (const [field, lineResult] of groupValidations) {
        this.mergeValidationResult(result, field.validateInGroup(group, lineResult))
        if (!result.isValid && eagerEnabled) {
          return result
        }
      }
    }

    return result
  }

  private mergeValidationResult(result: CnabValidationResult, validationResult: CnabValidationResult): void {
    result.isValid = result.isValid && validationResult.isValid
    result.errors.push(...validationResult.errors)
  }
}
