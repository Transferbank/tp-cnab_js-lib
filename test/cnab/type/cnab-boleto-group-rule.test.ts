import { describe, it, expect } from '@jest/globals'
import { CnabNumberedLine } from '@cnab/type/cnab-numbered-line'
import { CnabBoletoGroupRule, CnabBoletoGroupSegmentRule } from '@cnab/type/cnab-boleto-group-rule'
import { CnabGroupDuplicateSegmentError, CnabGroupMissingSegmentError } from '@cnab/type/cnab-validation-error'

class FakeBoletoGroupRule extends CnabBoletoGroupRule {
  protected readonly segmentRules: CnabBoletoGroupSegmentRule[]

  constructor(segmentRules: CnabBoletoGroupSegmentRule[]) {
    super()
    this.segmentRules = segmentRules
  }

  check(rawLine: string): boolean {
    return rawLine.startsWith('A')
  }
}

const segmentB = (isRequired: boolean): CnabBoletoGroupSegmentRule => ({
  name: 'segmento B',
  matches: (rawLine: string): boolean => rawLine.startsWith('B'),
  isRequired: (): boolean => isRequired
})

describe('CnabBoletoGroupRule', (): void => {
  describe('validate', (): void => {
    const firstLineNumber = 10

    it('given group without segment rules when validating then accepts it', (): void => {
      // Given
      const group: CnabNumberedLine[] = [[firstLineNumber, 'A']]

      // When
      const result = new FakeBoletoGroupRule([]).validate(group)

      // Then
      expect(result).toEqual({ isValid: true, errors: [] })
    })

    it('given group with required segment when validating then accepts it', (): void => {
      // Given
      const group: CnabNumberedLine[] = [[firstLineNumber, 'A'], [firstLineNumber + 1, 'B']]

      // When
      const result = new FakeBoletoGroupRule([segmentB(true)]).validate(group)

      // Then
      expect(result).toEqual({ isValid: true, errors: [] })
    })

    it('given group missing a required segment when validating then reports it at the group first line', (): void => {
      // Given
      const group: CnabNumberedLine[] = [[firstLineNumber, 'A'], [firstLineNumber + 1, 'C']]

      // When
      const result = new FakeBoletoGroupRule([segmentB(true)]).validate(group)

      // Then
      expect(result).toEqual({
        isValid: false,
        errors: [new CnabGroupMissingSegmentError({ lineNumber: firstLineNumber, segmentName: 'segmento B' })]
      })
      expect(result.errors[0].message).toBe('Grupo de boleto incompleto: segmento B obrigatório não encontrado')
    })

    it('given group missing a segment that is not required for it when validating then accepts it', (): void => {
      // Given
      const group: CnabNumberedLine[] = [[firstLineNumber, 'A']]

      // When
      const result = new FakeBoletoGroupRule([segmentB(false)]).validate(group)

      // Then
      expect(result).toEqual({ isValid: true, errors: [] })
    })

    it('given group with a repeated segment when validating then reports it at the second occurrence', (): void => {
      // Given
      const group: CnabNumberedLine[] = [[firstLineNumber, 'A'], [firstLineNumber + 1, 'B'], [firstLineNumber + 2, 'B']]

      // When
      const result = new FakeBoletoGroupRule([segmentB(false)]).validate(group)

      // Then
      expect(result).toEqual({
        isValid: false,
        errors: [new CnabGroupDuplicateSegmentError({
          lineNumber: firstLineNumber + 2,
          segmentName: 'segmento B',
          count: 2
        })]
      })
      expect(result.errors[0].message).toBe('Grupo de boleto inválido: segmento B encontrado 2 vezes, esperado no máximo 1')
    })
  })
})
