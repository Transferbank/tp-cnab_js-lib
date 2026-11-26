import { describe, it, expect } from '@jest/globals'
import { CnabGroupReader, CnabField, CnabFieldClass, CnabNumberedLine, optional } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import {
  CnabFieldDependencyCycleException,
  CnabFieldDependencyNotDeclaredException
} from '@cnab/exception/cnab-exception'
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

class FakeThirdLineField extends FakeNumberField {
  readonly range: [number, number] = [2, 3]

  shouldValidate(): boolean {
    return this.rawLine.startsWith('3')
  }
}

class FakeGroupAwareSecondLineField extends FakeSecondLineField {
  static readonly dependencies = [FakeThirdLineField]

  readInGroup(group: CnabGroupReader): number | null {
    const thirdLine = group.read(FakeThirdLineField)
    return (this.value ?? 0) + (thirdLine ?? 0)
  }
}

class FakeSelfReadingField extends FakeSecondLineField {
  static readonly dependencies: CnabFieldClass[] = [this]

  readInGroup(group: CnabGroupReader): number | null {
    return group.read(FakeSelfReadingField)
  }
}

describe('CnabGroupReader', (): void => {
  it('given a field that reads itself when reading then throws with the cycle', (): void => {
    // Given
    const lines: CnabNumberedLine[] = [{ lineNumber: 1, rawLine: '100' }, { lineNumber: 2, rawLine: '231' }]
    const group = new CnabGroupReader(lines, [FakeSelfReadingField], 'campo_numerico')

    // When
    const read = (): number | null => group.read(FakeSelfReadingField)

    // Then
    expect(read).toThrow(new CnabFieldDependencyCycleException('campo_numerico', 'FakeSelfReadingField → FakeSelfReadingField'))
  })

  it('given a declared field that reads in group when reading then returns its value read in group', (): void => {
    // Given
    const lines: CnabNumberedLine[] = [{ lineNumber: 1, rawLine: '100' }, { lineNumber: 2, rawLine: '231' }, { lineNumber: 3, rawLine: '307' }]
    const group = new CnabGroupReader(lines, [FakeGroupAwareSecondLineField], 'campo_numerico')

    // When
    const value = group.read(FakeGroupAwareSecondLineField)

    // Then
    expect(value).toBe(38)
  })

  it('given the declared field on another line of the boleto when reading then returns its value', (): void => {
    // Given
    const lines: CnabNumberedLine[] = [{ lineNumber: 1, rawLine: '100' }, { lineNumber: 2, rawLine: '231' }]
    const group = new CnabGroupReader(lines, [FakeSecondLineField], 'campo_numerico')

    // When
    const value = group.read(FakeSecondLineField)

    // Then
    expect(value).toBe(31)
  })

  it('given the declared field with an unreadable value when reading then returns null without throwing', (): void => {
    // Given
    const lines: CnabNumberedLine[] = [{ lineNumber: 1, rawLine: '100' }, { lineNumber: 2, rawLine: '2AB' }]
    const group = new CnabGroupReader(lines, [FakeSecondLineField], 'campo_numerico')

    // When
    const value = group.read(FakeSecondLineField)

    // Then
    expect(value).toBeNull()
  })

  it('given a field not declared as dependency when reading then throws', (): void => {
    // Given
    const lines: CnabNumberedLine[] = [{ lineNumber: 1, rawLine: '100' }, { lineNumber: 2, rawLine: '231' }]
    const group = new CnabGroupReader(lines, [], 'campo_numerico')

    // When
    const read = (): number | null => group.read(FakeSecondLineField)

    // Then
    expect(read).toThrow(new CnabFieldDependencyNotDeclaredException('campo_numerico', 'FakeSecondLineField'))
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
