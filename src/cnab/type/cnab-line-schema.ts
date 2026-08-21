import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineValidator, CnabLineValidatorClass } from '@cnab/type/cnab-line-validator'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  Cnab240LineSizeValidator,
  Cnab400LineSizeValidator
} from '@cnab/validators/cnab-line-size-validator'

interface CnabValidatableConstructor {
  shouldValidate(rawLine: string): boolean
  new (params: { rawLine: string; lineNumber: number }): CnabLineValidator | CnabField
}

export class CnabLineSchema {
  readonly fieldType: CnabFieldType
  readonly fields: CnabFieldClass[]
  readonly declaredValidators: CnabLineValidatorClass[]

  bank: CnabBank | null = null
  fmt: CnabFormat | null = null
  boletoGroupRule: typeof CnabBoletoGroupRule | null = null
  private _validators?: CnabLineValidatorClass[]

  constructor(config: {
    fieldType: CnabFieldType
    fields: CnabFieldClass[]
    validators?: CnabLineValidatorClass[]
  }) {
    this.fieldType = config.fieldType
    this.fields = config.fields
    this.declaredValidators = config.validators ?? []
  }

  init(
    bank: CnabBank,
    fmt: CnabFormat,
    boletoGroupRule: typeof CnabBoletoGroupRule
  ): void {
    this.bank = bank
    this.fmt = fmt
    this.boletoGroupRule = boletoGroupRule
    delete this._validators // limpa o cache
  }

  get validators(): CnabLineValidatorClass[] {
    if (this._validators == null) {
      const lineSizeValidators: Record<CnabFormat, CnabLineValidatorClass> = {
        [CnabFormat.CNAB240]: Cnab240LineSizeValidator,
        [CnabFormat.CNAB400]: Cnab400LineSizeValidator
      }

      this._validators = [
        lineSizeValidators[this.fmt!],
        ...this.declaredValidators
      ]
    }
    return this._validators
  }

  isBoletoGroupStart(rawLine: string): boolean {
    return this.boletoGroupRule!.check(rawLine)
  }

  *genLineGroups( rawLines: string[], firstLine: number): Generator<Array<[number, string]>> {
    const numberedLines: Array<[number, string]> = Array.from(
      rawLines,
      (line: string, index: number): [number, string] => [
        firstLine + index,
        line
      ]
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
    const result: CnabValidationResult = {
      isValid: true,
      errors: []
    }

    const extraFieldsList = extraFields ?? []
    const validationTypes = [
      ...this.validators,
      ...this.fields,
      ...extraFieldsList
    ] as CnabValidatableConstructor[]

    for (const group of this.genLineGroups(rawLines, firstLine)) {
      for (const [lineNumber, rawLine] of group) {
        for (const validationType of validationTypes) {
          if (!validationType.shouldValidate(rawLine)) {
            continue
          }

          const instance = new validationType({
            rawLine,
            lineNumber
          })

          const validationResult = instance.validate()
          result.isValid = result.isValid && validationResult.isValid
          result.errors.push(...validationResult.errors)

          if (!result.isValid && eagerEnabled) {
            return result
          }
        }
      }
    }

    return result
  }
}