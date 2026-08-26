import { Cnab } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldClass } from '@cnab/type/cnab-field'

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
    header: CnabLineSchema
    trailer: CnabLineSchema
    boleto: CnabLineSchema
  }) {
    this.bank = config.bank
    this.fmt = config.fmt
    this.boletoGroupRule = config.boletoGroupRule
    this.header = config.header
    this.trailer = config.trailer
    this.boleto = config.boleto

    for (const lineSchema of this.lineSchemas) {
      lineSchema.init(this.bank, this.fmt, this.boletoGroupRule)
    }
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
      [this.boleto, rawLines.slice(1, -1), 1]
    ]

    for (const item of items) {
      const [group, lines, firstLine] = item
      const groupExtraFields = (extraFields ?? []).filter(
        (field: CnabFieldClass) => field.fieldType === group.fieldType
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

  read(rawLines: string[], extraFields?: CnabFieldClass[]): Cnab {
    // TODO: Implementar método read que retorna objeto Cnab com header, trailer e boletos
    // Necessário para CnabFile.read() funcionar corretamente
    // Deve processar: rawLines[0] (header), rawLines[length-1] (trailer), slice(1,-1) (boletos)
    throw new Error('Método read() ainda não implementado')
  }
}