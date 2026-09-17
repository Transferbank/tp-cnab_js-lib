import { describe, it, expect } from '@jest/globals'
import { CnabFieldInvalidNumberError, CnabFieldUnexpectedParseError } from '@cnab/type/cnab-validation-error'
import { CnabOptionalFieldStub } from '@test/cnab/doubles/cnab-field-stub'

describe('CnabField', (): void => {
  describe('shouldValidate guard', (): void => {
    it('given a line the field does not apply to when validating then reports it as valid', (): void => {
      // Given
      const field = new CnabOptionalFieldStub('12345', 1, { shouldValidateResult: false })

      // When / Then
      expect(field.value).toBeNull()
      expect(field.validate()).toEqual({ isValid: true, errors: [] })
    })
  })

  describe('optional field left blank', (): void => {
    it('given an optional field with blank raw value when validating then accepts it without calling performValidation', (): void => {
      // Given
      const field = new CnabOptionalFieldStub('     ', 1, {
        performValidationResult: { isValid: false, errors: [] }
      })

      // When / Then
      expect(field.value).toBeNull()
      expect(field.validate()).toEqual({ isValid: true, errors: [] })
    })
  })

  describe('parseValue throwing a raw Error', (): void => {
    it('given a field author that forgot to use CnabFieldParseError when reading value then normalizes it to CnabFieldUnexpectedParseError', (): void => {
      // Given
      const field = new CnabOptionalFieldStub('12345', 1, {
        parseValueImpl: (): string => {
          throw new Error('erro cru, nao é um CnabFieldParseError')
        }
      })

      // When / Then
      expect(() => field.value).toThrow(CnabFieldUnexpectedParseError)
      expect(field.validate().isValid).toBe(false)
    })
  })

  describe('parseValue throwing a CnabFieldParseError', (): void => {
    it('given a proper domain parse error when reading value then propagates it unchanged', (): void => {
      // Given
      const field = new CnabOptionalFieldStub('12345', 1, {
        fieldName: 'campo numerico de teste',
        parseValueImpl: (rawValue: string): string => {
          throw new CnabFieldInvalidNumberError('campo numerico de teste', rawValue)
        }
      })

      // When / Then
      expect(() => field.value).toThrow(CnabFieldInvalidNumberError)
      expect(field.validate().isValid).toBe(false)
    })
  })

  describe('value present and parsed successfully', (): void => {
    it('given a well formed value when validating then delegates to performValidation', (): void => {
      // Given
      const field = new CnabOptionalFieldStub('12345', 1, {
        performValidationResult: { isValid: false, errors: [] }
      })

      // When / Then
      expect(field.value).toBe('12345')
      expect(field.validate()).toEqual({ isValid: false, errors: [] })
    })
  })
})
