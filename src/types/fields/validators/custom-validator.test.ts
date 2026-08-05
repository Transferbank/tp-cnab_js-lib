import { CustomValidator } from './custom-validator'

describe('CustomValidator', () => {
  test('valida com função customizada', () => {
    const validator = new CustomValidator(
      (raw: string) => raw.trim().length > 0,
      'deve conter pelo menos um caractere não vazio'
    )

    expect(validator.validate('teste')).toBe(true)
    expect(validator.validate('   ')).toBe(false)
    expect(validator.validate('')).toBe(false)
    expect(validator.errorMessage).toBe('deve conter pelo menos um caractere não vazio')
  })

  test('permite lógica de validação complexa', () => {
    const validator = new CustomValidator(
      (raw: string) => {
        const num = parseInt(raw, 10)
        return !isNaN(num) && num >= 0 && num <= 100
      },
      'deve ser um número entre 0 e 100'
    )

    expect(validator.validate('50')).toBe(true)
    expect(validator.validate('0')).toBe(true)
    expect(validator.validate('100')).toBe(true)
    expect(validator.validate('101')).toBe(false)
    expect(validator.validate('abc')).toBe(false)
  })
})
