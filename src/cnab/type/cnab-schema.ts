import { Cnab } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabBoleto } from '@cnab/type/cnab-boleto'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabLineData } from '@cnab/type/cnab-line-data'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabBoletoValidationResult, CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineValidatorClass } from '@cnab/type/cnab-line-validator'

type CnabLineSchemaConfig = {
  fieldType: CnabFieldType
  fields: CnabFieldClass[]
  validators?: CnabLineValidatorClass[]
}

export class CnabSchema {
  readonly bank: CnabBank
  readonly fmt: CnabFormat
  readonly boletoGroupRule: CnabBoletoGroupRule
  readonly header: CnabLineSchema
  readonly trailer: CnabLineSchema
  readonly boleto: CnabLineSchema

  constructor(config: {
    bank: CnabBank
    fmt: CnabFormat
    boletoGroupRule: CnabBoletoGroupRule
    header: CnabLineSchemaConfig
    trailer: CnabLineSchemaConfig
    boleto: CnabLineSchemaConfig
  }) {
    this.bank = config.bank
    this.fmt = config.fmt
    this.boletoGroupRule = config.boletoGroupRule

    const sharedConfig = {
      bank: this.bank,
      fmt: this.fmt,
      boletoGroupRule: this.boletoGroupRule,
    }

    this.header = CnabLineSchema.create({ ...sharedConfig, ...config.header })
    this.trailer = CnabLineSchema.create({ ...sharedConfig, ...config.trailer })
    this.boleto = CnabLineSchema.create({ ...sharedConfig, ...config.boleto })
  }

  get lineSchemas(): CnabLineSchema[] {
    return [this.header, this.trailer, this.boleto]
  }

  validate(
    rawLines: string[],
    eagerEnabled: boolean,
    extraFields?: CnabFieldClass[]
  ): CnabValidationResult {
    const result: CnabValidationResult = { isValid: true, errors: [] }

    const items: Array<[CnabLineSchema, string[], number]> = [
      [this.header, [rawLines[0]], 0],
      [this.trailer, [rawLines[rawLines.length - 1]], rawLines.length - 1],
      [this.boleto, rawLines.slice(1, -1), 1],
    ]

    for (const item of items) {
      const [group, lines, firstLine] = item
      const groupExtraFields = (extraFields ?? []).filter(
        (field: CnabFieldClass) => field.fieldType === group.fieldType
      )

      const groupResult = group.validate(lines, eagerEnabled, firstLine, groupExtraFields)

      result.isValid = result.isValid && groupResult.isValid
      result.errors.push(...groupResult.errors)

      if (!result.isValid && eagerEnabled) {
        return result
      }
    }

    return result
  }

  // Valida cada boleto do arquivo individualmente, permitindo saber quais
  // boletos são válidos e quais não, em vez de só um veredito do arquivo inteiro.
  validateBoletos(
    rawLines: string[],
    eagerEnabled: boolean,
    extraFields?: CnabFieldClass[]
  ): CnabBoletoValidationResult[] {
    const boletoExtraFields = (extraFields ?? []).filter(
      (field: CnabFieldClass) => field.fieldType === this.boleto.fieldType
    )

    return this.boleto.validateGroups(rawLines.slice(1, -1), eagerEnabled, 1, boletoExtraFields)
  }

  read(rawLines: string[], extraFields?: CnabFieldClass[]): Cnab {
    const extraFieldsFor = (group: CnabLineSchema): CnabFieldClass[] =>
      (extraFields ?? []).filter((field: CnabFieldClass) => field.fieldType === group.fieldType)

    const header = this.header.instantiate(rawLines[0], 0, extraFieldsFor(this.header))

    const trailer = this.trailer.instantiate(
      rawLines[rawLines.length - 1],
      rawLines.length - 1,
      extraFieldsFor(this.trailer)
    )

    const boletoRawLines = rawLines.slice(1, -1)
    const boletoExtraFields = extraFieldsFor(this.boleto)
    const boletos: CnabBoleto[] = []

    for (const group of this.boleto.genLineGroups(boletoRawLines, 1)) {
      const boletoLines: CnabLineData[] = group.map(
        ([lineNumber, rawLine]) => this.boleto.instantiate(rawLine, lineNumber, boletoExtraFields)
      )
      boletos.push(new CnabBoleto(boletoLines))
    }

    return new Cnab({ header, trailer, boletos })
  }
}
