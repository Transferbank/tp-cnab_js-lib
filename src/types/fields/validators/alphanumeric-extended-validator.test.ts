import { AlphanumericExtendedValidator } from './alphanumeric-extended-validator'

describe('AlphanumericExtendedValidator', () => {
  const validator = new AlphanumericExtendedValidator()

  test('aceita valores alfanuméricos simples', () => {
    expect(validator.validate('ABC123')).toBe(true)
    expect(validator.validate('teste')).toBe(true)
    expect(validator.validate('12345')).toBe(true)
  })

  test('aceita hífen', () => {
    expect(validator.validate('NF82760-03')).toBe(true)
    expect(validator.validate('DOC-123-456')).toBe(true)
  })

  test('aceita barra', () => {
    expect(validator.validate('NF/82760')).toBe(true)
    expect(validator.validate('2024/001')).toBe(true)
  })

  test('aceita ponto', () => {
    expect(validator.validate('REF.123')).toBe(true)
    expect(validator.validate('DOC.2024.001')).toBe(true)
  })

  test('aceita combinações', () => {
    expect(validator.validate('NF-82760/03.A')).toBe(true)
  })

  test('rejeita valor vazio', () => {
    expect(validator.validate('')).toBe(false)
    expect(validator.validate('   ')).toBe(false)
  })

  test('rejeita caracteres especiais não permitidos', () => {
    expect(validator.validate('DOC@123')).toBe(false)
    expect(validator.validate('NF#82760')).toBe(false)
    expect(validator.validate('REF$123')).toBe(false)
  })

  test('trim funciona corretamente', () => {
    expect(validator.validate('  ABC123  ')).toBe(true)
    expect(validator.validate('  NF-82760  ')).toBe(true)
  })
})
