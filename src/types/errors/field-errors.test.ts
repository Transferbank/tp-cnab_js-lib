import { CNABFieldValidationError, CNABBoletoValidationError } from './field-errors'
import { CNABInputError } from './base'

describe('CNABFieldValidationError', () => {
  test('deve estender CNABInputError', () => {
    const error = new CNABFieldValidationError('cpf', '12345678900', 'CPF inválido')
    expect(error).toBeInstanceOf(CNABInputError)
  })

  test('deve ter code fixo FIELD_VALIDATION_ERROR', () => {
    const error = new CNABFieldValidationError('cpf', '12345678900', 'CPF inválido')
    expect(error.code).toBe('FIELD_VALIDATION_ERROR')
  })

  test('deve armazenar field e rawValue', () => {
    const error = new CNABFieldValidationError('cpf', '12345678900', 'CPF inválido')
    expect(error.field).toBe('cpf')
    expect(error.rawValue).toBe('12345678900')
  })

  test('deve formatar mensagem corretamente', () => {
    const error = new CNABFieldValidationError('cpf', '12345678900', 'CPF inválido')
    expect(error.message).toBe('Campo "cpf" inválido: CPF inválido (valor: "12345678900")')
  })
})

describe('CNABBoletoValidationError', () => {
  test('deve estender CNABInputError', () => {
    const error = new CNABBoletoValidationError('linha ausente')
    expect(error).toBeInstanceOf(CNABInputError)
  })

  test('deve ter code fixo BOLETO_VALIDATION_ERROR', () => {
    const error = new CNABBoletoValidationError('linha ausente')
    expect(error.code).toBe('BOLETO_VALIDATION_ERROR')
  })

  test('deve armazenar lineNumber quando fornecido', () => {
    const error = new CNABBoletoValidationError('linha ausente', 5)
    expect(error.lineNumber).toBe(5)
  })

  test('deve formatar mensagem com número da linha', () => {
    const error = new CNABBoletoValidationError('linha ausente', 5)
    expect(error.message).toBe('Boleto inválido (linha 5): linha ausente')
  })

  test('deve formatar mensagem sem número da linha', () => {
    const error = new CNABBoletoValidationError('boleto vazio')
    expect(error.message).toBe('Boleto inválido: boleto vazio')
    expect(error.lineNumber).toBeUndefined()
  })
})
