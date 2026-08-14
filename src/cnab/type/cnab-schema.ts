import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabField } from '@cnab/type/cnab-field'
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

  validate(_rawLines: string[], _isEager: boolean, _extraFields?: (typeof CnabField)[]): CnabValidationResult {
    const result: CnabValidationResult = {
      isValid: true,
      errors: []
    }

    const items: Array<[CnabLineSchema, string[], number]> = [
      [this.header, [_rawLines[0]], 0],
      [this.trailer, [_rawLines[_rawLines.length - 1]], _rawLines.length - 1],
      [this.boleto, _rawLines.slice(1, -1), 1]
    ]

    for (const [group, lines, firstLine] of items) {
      const groupExtraFields = (_extraFields ?? []).filter(
        field => field.fieldType === group.fieldType
      )

      const groupResult = group.validate(
        lines,
        _isEager,
        groupExtraFields,
        firstLine
      )

      result.isValid = result.isValid && groupResult.isValid
      result.errors.push(...groupResult.errors)

      if (!result.isValid && _isEager) {
        return result
      }
    }

    return result
  }
}
