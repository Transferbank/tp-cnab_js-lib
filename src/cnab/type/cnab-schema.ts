import { Cnab } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabBoleto } from '@cnab/type/cnab-boleto'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabLineData } from '@cnab/type/cnab-line-data'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
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

  validate(rawLines: string[],eagerEnabled: boolean,extraFields?: CnabFieldClass[]): CnabValidationResult {
    const result: CnabValidationResult = { isValid: true, errors: [] }
    const extraFieldsFor = (group: CnabLineSchema): CnabFieldClass[] =>
      (extraFields ?? []).filter((field: CnabFieldClass) => field.fieldType === group.fieldType)

    const items: Array<[CnabLineSchema, string[], number]> = [
      [this.header, [rawLines[0]], 0],
      [this.trailer, [rawLines[rawLines.length - 1]], rawLines.length - 1],
    ]

    for (const [group, lines, firstLine] of items) {
      const groupResult = group.validate(lines, eagerEnabled, firstLine, extraFieldsFor(group))

      result.isValid = result.isValid && groupResult.isValid
      result.errors.push(...groupResult.errors)

      if (!result.isValid && eagerEnabled) {
        return result
      }
    }

    const boletoRawLines = rawLines.slice(1, -1)
    const boletoExtraFields = extraFieldsFor(this.boleto)

    if (eagerEnabled) {
      // Feedback rápido: só o suficiente pra responder isValid/errors e sair no primeiro erro.
      const boletoResult = this.boleto.validate(boletoRawLines, eagerEnabled, 1, boletoExtraFields)
      result.isValid = result.isValid && boletoResult.isValid
      result.errors.push(...boletoResult.errors)
      return result
    }

    // Feedback completo: monta a quebra por boleto numa unica passada e deriva
    // o isValid/errors agregados dela, em vez de validar os boletos duas vezes.
    result.boletos = this.boleto.validateGroups(boletoRawLines, eagerEnabled, 1, boletoExtraFields)
    for (const boleto of result.boletos) {
      result.isValid = result.isValid && boleto.isValid
      result.errors.push(...boleto.errors)
    }

    return result
  }

  countBoletos(rawLines: string[]): number {
    let count = 0
    for (let i = 1; i < rawLines.length - 1; i++) {
      if (this.boleto.isBoletoGroupStart(rawLines[i])) {
        count++
      }
    }
    return count
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
