import { describe, it, expect } from '@jest/globals'
import { CnabField, CnabNumberedLine, optional } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
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

class FakeSecondLineField extends FakeNumberField {
  readonly range: [number, number] = [2, 3]

  shouldValidate(): boolean {
    return this.rawLine.startsWith('2')
  }
}

class FakeDependentField extends FakeNumberField {
  readSecondLine(group: CnabNumberedLine[]): number | null {
    return this.groupValue(group, FakeSecondLineField)
  }
}

describe('groupValue', (): void => {
  it('given the field on another line of the boleto when reading then returns its value', (): void => {
    // Given
    const group: CnabNumberedLine[] = [[1, '100'], [2, '231']]
    const field = new FakeDependentField('100', 1)

    // When
    const value = field.readSecondLine(group)

    // Then
    expect(value).toBe(31)
  })

  it('given the field with an unreadable value when reading then returns null without throwing', (): void => {
    // Given
    const group: CnabNumberedLine[] = [[1, '100'], [2, '2AB']]
    const field = new FakeDependentField('100', 1)

    // When
    const value = field.readSecondLine(group)

    // Then
    expect(value).toBeNull()
  })
})

class FakeSecondLineCodeField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'codigo'
  readonly range: [number, number] = [2, 3]

  shouldValidate(): boolean {
    return this.rawLine.startsWith('2')
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }
}

class FakeDispensableField extends FakeNumberField {
  static readonly validatesInGroup = true
  protected readonly dispensingField = FakeSecondLineCodeField
  protected readonly dispensingValues = ['31']
}

describe('dispensa no boleto', (): void => {
  it('given the other field with a dispensing value when validating and reading in group then accepts the field and leaves it out', (): void => {
    // Given
    const group: CnabNumberedLine[] = [[1, '1A2'], [2, '231']]
    const field = new FakeDispensableField('1A2', 1)

    // When
    const result = field.validateInGroup(group)
    const value = field.readInGroup(group)

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(value).toBeNull()
  })

  it('given the other field with another value when validating in group then validates the field as usual', (): void => {
    // Given
    const group: CnabNumberedLine[] = [[1, '1A2'], [2, '277']]
    const field = new FakeDispensableField('1A2', 1)

    // When
    const result = field.validateInGroup(group)

    // Then
    expect(result.isValid).toBe(false)
    expect(result.errors).toMatchObject([{ message: 'Campo campo_numerico com formato inválido: 1A2' }])
  })
})

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
