import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  CnabGroupMissingSegmentError,
  CnabGroupDuplicateSegmentError,
  CnabGroupMissingStartSegmentError
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
    const [firstLineNumber, firstRawLine] = group[0]

    for (const rule of this.segmentRules) {
      const matches = group.filter(([, rawLine]: [number, string]) => rule.matches(rawLine))
      const matchCount = matches.length

      if (rule.required && matchCount == 0) {
        errors.push(new CnabGroupMissingSegmentError({ lineNumber: firstLineNumber, segmentName: rule.name }))
      } else if (rule.required && matchCount > 1) {
        // Um segmento obrigatório a mais indica, na prática, um boleto cujo início sumiu
        // e cujas linhas caíram no boleto anterior (ver genLineGroups)
        for (const [lineNumber] of matches.slice(1)) {
          errors.push(new CnabGroupMissingStartSegmentError({
            lineNumber,
            segmentName: rule.name,
            startSegmentName: this.describeLine(firstRawLine)
          }))
        }
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
