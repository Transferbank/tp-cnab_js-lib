import { Cnab } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CNAB_GROUP_RULES } from '@cnab/bank/cnab-group-rules'
import { CnabGroupRuleNotFoundException } from '@cnab/exception/cnab-exception'

export class CnabSchema {
  readonly bank: CnabBank
  readonly fmt: CnabFormat
  readonly header: CnabLineSchema
  readonly trailer: CnabLineSchema
  readonly boleto: CnabLineSchema

  constructor(config: {
    bank: CnabBank
    fmt: CnabFormat
    header: CnabLineSchema
    trailer: CnabLineSchema
    boleto: CnabLineSchema
  }) {
    this.bank = config.bank
    this.fmt = config.fmt
    this.header = config.header
    this.trailer = config.trailer
    this.boleto = config.boleto

    const boletoGroupRule = CNAB_GROUP_RULES[this.bank]?.[this.fmt]
    if (boletoGroupRule == null) {
      throw new CnabGroupRuleNotFoundException(this.bank, this.fmt)
    }

    for (const lineSchema of this.lineSchemas) {
      lineSchema.init(this.bank, this.fmt, boletoGroupRule)
    }
  }

  get lineSchemas(): CnabLineSchema[] {
    return [this.header, this.trailer, this.boleto]
  }

  validate(
    rawLines: string[],
    eagerEnabled: boolean,
    extraFields?: Array<typeof CnabField>
  ): CnabValidationResult {
    const result: CnabValidationResult = { isValid: true, errors: [] }

    const items: Array<[CnabLineSchema, string[], number]> = [
      [this.header, [rawLines[0]], 0],
      [this.trailer, [rawLines[rawLines.length - 1]], rawLines.length - 1],
      [this.boleto, rawLines.slice(1, -1), 1]
    ]

    for (const item of items) {
      const [group, lines, firstLine] = item
      const groupExtraFields = (extraFields ?? []).filter(
        (field: typeof CnabField) => field.fieldType === group.fieldType
      )

      const groupResult = group.validate(
        lines,
        eagerEnabled,
        firstLine,
        groupExtraFields
      )

      result.isValid = result.isValid && groupResult.isValid
      result.errors.push(...groupResult.errors)

      if (!result.isValid && eagerEnabled) {
        return result
      }
    }

    return result
  }

  read(_rawLines: string[], _extraFields?: Array<typeof CnabField>): Cnab {
    // TODO: Implementar método read que retorna objeto Cnab com header, trailer e boletos
    // Necessário para CnabFile.read() funcionar corretamente
    // Deve processar: rawLines[0] (header), rawLines[length-1] (trailer), slice(1,-1) (boletos)
    throw new Error('Método read() ainda não implementado')
  }
}