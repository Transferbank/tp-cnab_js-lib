import { Cnab } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabBoleto } from '@cnab/type/cnab-boleto'
import { CnabLineData } from '@cnab/type/cnab-line-data'

export class CnabSchema {
  readonly bank: CnabBank
  readonly fmt: CnabFormat
  readonly boletoGroupRule: typeof CnabBoletoGroupRule
  readonly header: CnabLineSchema
  readonly trailer: CnabLineSchema
  readonly boleto: CnabLineSchema

  constructor(config: {
    bank: CnabBank
    fmt: CnabFormat
    boletoGroupRule: typeof CnabBoletoGroupRule
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
    const headerLine = this.header.instantiate(rawLines[0], 0, extraFields)
    
    const trailerLine = this.trailer.instantiate(
      rawLines[rawLines.length - 1],
      rawLines.length - 1,
      extraFields
    )
    
    const boletoRawLines = rawLines.slice(1, -1)
    const boletos: CnabBoleto[] = []
    
    for (const group of this.boleto.genLineGroups(boletoRawLines, 1)) {
      const boletoLines: CnabLineData[] = []
      
      for (const [lineNumber, rawLine] of group) {
        const lineData = this.boleto.instantiate(rawLine, lineNumber, extraFields)
        boletoLines.push(lineData)
      }
      
      boletos.push(new CnabBoleto(boletoLines))
    }
    
    return new Cnab({
      header: headerLine,
      trailer: trailerLine,
      boletos
    })
  }
}