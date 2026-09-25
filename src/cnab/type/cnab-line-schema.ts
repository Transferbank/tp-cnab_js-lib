import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineValidatorClass } from '@cnab/type/cnab-line-validator'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabBoletoValidationResult, CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  Cnab240LineSizeValidator,
  Cnab400LineSizeValidator,
} from '@cnab/validators/cnab-line-size-validator'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabLineData } from '@cnab/type/cnab-line-data'

interface CnabValidatable {
  shouldValidate(): boolean
  validate(): CnabValidationResult
}

type CnabFieldConstructor = new (rawLine: string, lineNumber: number) => CnabField<unknown>

interface CnabValidatableConstructor {
  new (rawLine: string, lineNumber: number): CnabValidatable
}

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

  *genLineGroups(rawLines: string[], firstLine: number): Generator<Array<[number, string]>> {
    const numberedLines: Array<[number, string]> = Array.from(
      rawLines,
      (line: string, index: number): [number, string] => [firstLine + index, line]
    )

    if (this.fieldType !== CnabFieldType.BOLETO) {
      yield numberedLines
      return
    }

    let group: Array<[number, string]> = []

    for (const numberedLine of numberedLines) {
      const [, rawLine] = numberedLine
      if (this.isBoletoGroupStart(rawLine)) {
        if (group.length !== 0) {
          yield group
        }
        group = [numberedLine]
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
    extraFields?: CnabFieldClass[]
  ): CnabValidationResult {
    const result: CnabValidationResult = { isValid: true, errors: [] }
    const validationTypes = this.genValidationTypes(extraFields)

    for (const group of this.genLineGroups(rawLines, firstLine)) {
      const groupResult = this.validateGroup(group, eagerEnabled, validationTypes)

      result.isValid = result.isValid && groupResult.isValid
      result.errors.push(...groupResult.errors)

      if (!result.isValid && eagerEnabled) {
        return result
      }
    }

    return result
  }

validateGroups(
    rawLines: string[],
    eagerEnabled: boolean,
    firstLine: number,
    extraFields?: CnabFieldClass[]
  ): CnabBoletoValidationResult[] {
    const validationTypes = this.genValidationTypes(extraFields)
    const results: CnabBoletoValidationResult[] = []

    let index = 0
    for (const group of this.genLineGroups(rawLines, firstLine)) {
      const groupResult = this.validateGroup(group, eagerEnabled, validationTypes)

      results.push({
        ...groupResult,
        index,
        lineNumbers: group.map(([lineNumber]) => lineNumber),
      })
      index++
    }

    return results
  }

  private genValidationTypes(extraFields?: CnabFieldClass[]): CnabValidatableConstructor[] {
    return [
      ...this.validators,
      ...this.fields,
      ...(extraFields ?? []),
    ] as CnabValidatableConstructor[]
  }

  private validateGroup( group: Array<[number, string]>,eagerEnabled: boolean, validationTypes: CnabValidatableConstructor[]  ): CnabValidationResult {
    const result: CnabValidationResult = { isValid: true, errors: [] }

    for (const [lineNumber, rawLine] of group) {
      for (const validationType of validationTypes) {
        const instance = new validationType(rawLine, lineNumber)

        if (!instance.shouldValidate()) {
          continue
        }

        const validationResult = instance.validate()
        result.isValid = result.isValid && validationResult.isValid
        result.errors.push(...validationResult.errors)

        if (!result.isValid && eagerEnabled) {
          return result
        }
      }
    }

    return result
  }

  instantiate(rawLine: string, lineNumber: number, extraFields?: CnabFieldClass[]): CnabLineData {
    const extraFieldsList = extraFields ?? []
    const allFields = [...this.fields, ...extraFieldsList] as unknown as CnabFieldConstructor[]

    const instantiatedFields = allFields
      .map((FieldClass) => new FieldClass(rawLine, lineNumber))
      .filter((field) => field.shouldValidate())

    return new CnabLineData({
      rawLine,
      lineNumber,
      fields: instantiatedFields
    })
  }
}
