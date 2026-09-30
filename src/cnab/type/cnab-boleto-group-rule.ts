import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  CnabGroupMissingSegmentError,
  CnabGroupDuplicateSegmentError
} from '@cnab/type/cnab-validation-error'

export interface CnabBoletoGroupSegmentRule {
  readonly name: string
  readonly required: boolean
  matches(rawLine: string): boolean
}

export abstract class CnabBoletoGroupRule {
  protected readonly segmentRules: CnabBoletoGroupSegmentRule[] = []

  abstract check(rawLine: string): boolean

  // Linha que só pode aparecer dentro de um boleto
  abstract isBoletoLine(rawLine: string): boolean

  // Nome da linha nas mensagens de erro, ex: 'segmento Q', 'registro 2'
  abstract describeLine(rawLine: string): string

  validate(group: Array<[number, string]>): CnabValidationResult {
    if (group.length == 0) {
      return { isValid: true, errors: [] }
    }

    const errors: CnabValidationError[] = []
    const [firstLineNumber] = group[0]

    for (const rule of this.segmentRules) {
      const matchCount = group.filter(([, rawLine]: [number, string]) => rule.matches(rawLine)).length

      if (rule.required && matchCount == 0) {
        errors.push(new CnabGroupMissingSegmentError({ lineNumber: firstLineNumber, segmentName: rule.name }))
      } else if (matchCount > 1) {
        errors.push(new CnabGroupDuplicateSegmentError({
          lineNumber: firstLineNumber,
          segmentName: rule.name,
          count: matchCount
        }))
      }
    }

    return { isValid: errors.length == 0, errors }
  }
}
