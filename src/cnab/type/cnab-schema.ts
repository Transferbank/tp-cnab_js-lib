import { CnabField } from '@cnab/type/cnab-field'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

export class CnabSchema {
  public readonly header: CnabLineSchema
  public readonly trailer: CnabLineSchema
  public readonly boleto: CnabLineSchema

  constructor(config: {
    header: CnabLineSchema
    trailer: CnabLineSchema
    boleto: CnabLineSchema
  }) {
    this.header = config.header
    this.trailer = config.trailer
    this.boleto = config.boleto
  }

  validate(rawLines: string[], eagerEnabled: boolean, extraFields?: (typeof CnabField)[]): CnabValidationResult {
    const fields = extraFields ?? []
    const result: CnabValidationResult = {isValid: true, errors: []}
    const items: Array<[CnabLineSchema, string[], number]> = [
      [this.header, [rawLines[0]], 0],
      [this.trailer, [rawLines[rawLines.length - 1]], rawLines.length - 1],
      [this.boleto, rawLines.slice(1, -1), 1]
    ]
    for (const [group, lines, firstLine] of items) {
      const groupExtraFields = fields.filter(
        field => field.fieldType === group.fieldType
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
}