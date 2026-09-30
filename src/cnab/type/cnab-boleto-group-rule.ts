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

  validate(group: Array<[number, string]>): CnabValidationResult {
    const errors: CnabValidationError[] = []
    const [firstLineNumber] = group[0]

    for (const rule of this.segmentRules) {
      const matchCount = group.filter(([, rawLine]: [number, string]) => rule.matches(rawLine)).length

      if (rule.required && matchCount === 0) {
        errors.push(new CnabGroupMissingSegmentError({ lineNumber: firstLineNumber, segmentName: rule.name }))
      } else if (matchCount > 1) {
        errors.push(new CnabGroupDuplicateSegmentError({
          lineNumber: firstLineNumber,
          segmentName: rule.name,
          count: matchCount
        }))
      }
    }

    return { isValid: errors.length === 0, errors }
  }
}
