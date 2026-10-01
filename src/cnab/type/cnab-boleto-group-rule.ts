import { CnabNumberedLine } from '@cnab/type/cnab-numbered-line'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabGroupDuplicateSegmentError,
  CnabGroupMissingSegmentError,
  CnabGroupMissingStartSegmentError,
  CnabValidationError
} from '@cnab/type/cnab-validation-error'

export interface CnabBoletoGroupSegmentRule {
  readonly name: string
  readonly pairedWithStart?: string
  matches(rawLine: string): boolean
  isRequired(group: CnabNumberedLine[]): boolean
}

export abstract class CnabBoletoGroupRule {
  protected readonly segmentRules: CnabBoletoGroupSegmentRule[] = []

  abstract check(rawLine: string): boolean

  validate(group: CnabNumberedLine[]): CnabValidationResult {
    const errors: CnabValidationError[] = [
      ...this.missingSegmentErrors(group),
      ...this.duplicateSegmentErrors(group),
      ...this.missingStartSegmentErrors(group)
    ]

    return { isValid: errors.length == 0, errors }
  }

  private missingSegmentErrors(group: CnabNumberedLine[]): CnabValidationError[] {
    const errors: CnabValidationError[] = []
    const [firstLineNumber] = group[0]

    for (const rule of this.segmentRules) {
      if (!this.hasSegment(group, rule) && rule.isRequired(group)) {
        errors.push(new CnabGroupMissingSegmentError({ lineNumber: firstLineNumber, segmentName: rule.name }))
      }
    }

    return errors
  }

  private duplicateSegmentErrors(group: CnabNumberedLine[]): CnabValidationError[] {
    const errors: CnabValidationError[] = []

    for (const rule of this.segmentRules) {
      // Segmentos pareados com o início do boleto não são tratados como repetição.
      // Ex.: um segundo Q no mesmo boleto indica outro boleto que perdeu o P; 
      // isso é reportado em missingStartSegmentErrors.
      if (rule.pairedWithStart != null) {
        continue
      }

      const segmentLines = this.segmentLines(group, rule)

      if (segmentLines.length > 1) {
        const [secondOccurrenceLineNumber] = segmentLines[1]
        errors.push(new CnabGroupDuplicateSegmentError({
          lineNumber: secondOccurrenceLineNumber,
          segmentName: rule.name,
          count: segmentLines.length
        }))
      }
    }

    return errors
  }

  private missingStartSegmentErrors(group: CnabNumberedLine[]): CnabValidationError[] {
    const errors: CnabValidationError[] = []

    for (const rule of this.segmentRules) {
      if (rule.pairedWithStart == null) {
        continue
      }

      for (const [lineNumber] of this.segmentLines(group, rule).slice(1)) {
        errors.push(new CnabGroupMissingStartSegmentError({
          lineNumber,
          segmentName: rule.name,
          startSegmentName: rule.pairedWithStart
        }))
      }
    }

    return errors
  }

  private segmentLines(group: CnabNumberedLine[], rule: CnabBoletoGroupSegmentRule): CnabNumberedLine[] {
    return group.filter(([, rawLine]: CnabNumberedLine) => rule.matches(rawLine))
  }

  private hasSegment(group: CnabNumberedLine[], rule: CnabBoletoGroupSegmentRule): boolean {
    return group.some(([, rawLine]: CnabNumberedLine) => rule.matches(rawLine))
  }
}
