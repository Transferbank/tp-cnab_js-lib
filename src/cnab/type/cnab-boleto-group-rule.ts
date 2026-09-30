import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  CnabGroupMissingSegmentError,
  CnabGroupDuplicateSegmentError,
  CnabGroupMissingStartSegmentError,
  CnabGroupUnknownSegmentError
} from '@cnab/type/cnab-validation-error'

export interface CnabBoletoGroupSegmentRule {
  readonly name: string
  readonly required: boolean
  // Padrão 1. Use Infinity para segmentos que podem se repetir livremente
  readonly maxOccurrences?: number
  matches(rawLine: string): boolean
}

export abstract class CnabBoletoGroupRule {
  protected readonly segmentRules: CnabBoletoGroupSegmentRule[] = []

  // Recusa linhas de boleto que não batem com nenhuma regra. Só é seguro quando
  // segmentRules declara todos os segmentos que o layout permite
  protected readonly rejectUnknownSegments: boolean = false

  abstract check(rawLine: string): boolean

  // Linha que só pode aparecer dentro de um boleto
  abstract isBoletoLine(rawLine: string): boolean

  // Nome da linha nas mensagens de erro, ex: 'segmento Q', 'registro 2'
  abstract describeLine(rawLine: string): string

  validate(group: Array<[number, string]>): CnabValidationResult {
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
      } else if (matchCount > (rule.maxOccurrences ?? 1)) {
        const [firstDuplicateLineNumber] = matches[1]
        errors.push(new CnabGroupDuplicateSegmentError({
          lineNumber: firstDuplicateLineNumber,
          segmentName: rule.name,
          count: matchCount
        }))
      }
    }

    if (this.rejectUnknownSegments) {
      for (const [lineNumber, rawLine] of group.slice(1)) {
        const isKnown = this.segmentRules.some((rule: CnabBoletoGroupSegmentRule) => rule.matches(rawLine))
        if (this.isBoletoLine(rawLine) && !isKnown) {
          errors.push(new CnabGroupUnknownSegmentError({ lineNumber, segmentName: this.describeLine(rawLine) }))
        }
      }
    }

    return { isValid: errors.length == 0, errors }
  }
}
