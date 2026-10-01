import { CnabNumberedLine } from '@cnab/type/cnab-numbered-line'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabGroupDuplicateSegmentError,
  CnabGroupMissingSegmentError,
  CnabValidationError
} from '@cnab/type/cnab-validation-error'

export interface CnabBoletoGroupSegmentRule {
  readonly name: string
  matches(rawLine: string): boolean
  isRequired(group: CnabNumberedLine[]): boolean
}

export abstract class CnabBoletoGroupRule {
  protected readonly segmentRules: CnabBoletoGroupSegmentRule[] = []

  abstract check(rawLine: string): boolean

  validate(group: CnabNumberedLine[]): CnabValidationResult {
    const errors: CnabValidationError[] = [
      ...this.missingSegmentErrors(group),
      ...this.duplicateSegmentErrors(group)
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
      const segmentLines = group.filter(([, rawLine]: CnabNumberedLine) => rule.matches(rawLine))

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

  private hasSegment(group: CnabNumberedLine[], rule: CnabBoletoGroupSegmentRule): boolean {
    return group.some(([, rawLine]: CnabNumberedLine) => rule.matches(rawLine))
  }
}
