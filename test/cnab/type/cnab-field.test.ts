import { describe, it, expect } from '@jest/globals'
import { CnabField, optional } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldWriteNotImplementedException } from '@cnab/exception/cnab-exception'
import {
  CnabFieldInvalidNumberError,
  CnabFieldMinLengthError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'

class FakeNumberField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'campo_numerico'
  readonly range: [number, number] = [1, 3]

  shouldValidate(): boolean {
    return true
  }

  protected parseValue(rawValue: string): number {
    if (!/^\d+$/.test(rawValue)) {
      throw new CnabFieldInvalidNumberError(this.fieldKey, rawValue)
    }
    return Number(rawValue)
  }

  protected performValidation(): CnabValidationResult {
    if (this.value == null) {
      return {
        isValid: false,
        errors: [new CnabFieldMinLengthError({ lineNumber: this.lineNumber, fieldKey: this.fieldKey, range: this.range, minLength: 1 })]
      }
    }
    return { isValid: true, errors: [] }
  }
}

describe('optional', (): void => {
  const OptionalFakeNumberField = optional(FakeNumberField)

  it('given blank optional field when validating then accepts it with null value', (): void => {
    // Given
    const field = new OptionalFakeNumberField('   ', 0)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given malformed optional field when validating then reports format error', (): void => {
    // Given
    const field = new OptionalFakeNumberField('1A2', 0)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [new CnabGenericFieldError({
        message: 'Campo campo_numerico com formato inválido: 1A2',
        lineNumber: 0,
        fieldKey: 'campo_numerico',
        range: [1, 3]
      })]
    })
  })
})

describe('write', (): void => {
  it('given a field without formatting for writing when writing then throws a write not implemented exception', (): void => {
    // Given
    const line = Array.from('   ')
    const field = new FakeNumberField('   ', 0)

    // When
    const write = (): void => field.write(line, { campo_numerico: 123 })

    // Then
    expect(write).toThrow(CnabFieldWriteNotImplementedException)
  })
})
