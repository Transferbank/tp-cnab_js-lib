import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineValidator } from '@cnab/type/cnab-line-validator'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  Cnab240LineSizeValidator,
  Cnab400LineSizeValidator
} from '@cnab/validators/cnab-line-size-validator'

type ValidatorConstructor = new (params: {
  rawLine: string
  lineNumber: number
}) => CnabLineValidator
type FieldClass = typeof CnabField

export class CnabLineSchema {
  readonly fieldType: CnabFieldType
  readonly fields: FieldClass[]
  readonly declaredValidators: ValidatorConstructor[]

  bank: CnabBank | null = null
  fmt: CnabFormat | null = null
  boletoGroupRule: typeof CnabBoletoGroupRule | null = null
  private _validators?: ValidatorConstructor[]

  constructor(config: {
    fieldType: CnabFieldType
    fields: FieldClass[]
    validators?: ValidatorConstructor[]
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

  get validators(): ValidatorConstructor[] {
    if (this._validators == null) {
      const lineSizeValidators: Record<CnabFormat, ValidatorConstructor> = {
        [CnabFormat.CNAB240]: Cnab240LineSizeValidator as ValidatorConstructor,
        [CnabFormat.CNAB400]: Cnab400LineSizeValidator as ValidatorConstructor
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

  *genLineGroups(
    rawLines: string[],
    firstLine: number
  ): Generator<Array<[number, string]>> {
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
    let orphanLines: Array<[number, string]> = []

    for (const numberedLine of numberedLines) {
      const [, rawLine] = numberedLine
      if (this.isBoletoGroupStart(rawLine)) {
        // Entrega linhas órfãs antes do primeiro grupo
        if (orphanLines.length > 0) {
          yield orphanLines
          orphanLines = []
        }
        // Entrega grupo anterior se existir
        if (group.length !== 0) {
          yield group
        }
        group = [numberedLine]
      } else if (group.length > 0) {
        group.push(numberedLine)
      } else {
        // Linhas antes do início do primeiro grupo
        orphanLines.push(numberedLine)
      }
    }

    // Entrega linhas órfãs restantes
    if (orphanLines.length > 0) {
      yield orphanLines
    }

    // Entrega grupo final
    if (group.length !== 0) {
      yield group
    }
  }

  validate(
    rawLines: string[],
    eagerEnabled: boolean,
    firstLine: number,
    extraFields?: FieldClass[]
  ): CnabValidationResult {
    const result: CnabValidationResult = {
      isValid: true,
      errors: []
    }

    const extraFieldsList = extraFields ?? []
    const validationTypes: (ValidatorConstructor | FieldClass)[] = [
      ...this.validators,
      ...this.fields,
      ...extraFieldsList
    ]

    for (const group of this.genLineGroups(rawLines, firstLine)) {
      for (const [lineNumber, rawLine] of group) {
        for (const validationType of validationTypes) {
          const instance = new (validationType as ValidatorConstructor)({
            rawLine,
            lineNumber
          })

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
    }

    return result
  }
}