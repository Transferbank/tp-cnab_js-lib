import { describe, it, expect } from '@jest/globals'
import { TextField } from '@cnab/field/cnab400/retorno/text-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { cnab400RetornoLine, replaceLineRange } from '@test/test-utils'

class NumericTextField extends TextField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'campo_numerico'
  readonly range: [number, number] = [63, 70]
  protected readonly numeric: boolean = true

  shouldValidate(): boolean {
    return true
  }
}

describe('TextField', (): void => {
  describe.each([
    { value: '', description: 'an empty text' },
    { value: null, description: 'an absent value' }
  ])('given a numeric field and $description', ({ value }): void => {
    it('when formatting and reading it back then the field is absent', (): void => {
      // Given
      const line = cnab400RetornoLine('1')
      const formatted = new NumericTextField(line, 1).formatValue(value)

      // When
      const field = new NumericTextField(replaceLineRange(line, [63, 70], formatted), 1)

      // Then
      expect(formatted).toBe('        ')
      expect(field.value).toBeNull()
    })
  })

  it('given a numeric field and a code with leading zeros when formatting then keeps them', (): void => {
    // Given
    const field = new NumericTextField(cnab400RetornoLine('1'), 1)

    // When
    const formatted = field.formatValue('0123')

    // Then
    expect(formatted).toBe('00000123')
  })
})
