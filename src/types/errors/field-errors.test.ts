import { CNABFieldValidationError, CNABBoletoValidationError, CNABBoletoNotFoundError, CNABDocumentValidationError } from './field-errors'
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

describe('CNABBoletoNotFoundError', () => {
  test('deve estender CNABInputError', () => {
    const error = new CNABBoletoNotFoundError(5, 3)
    expect(error).toBeInstanceOf(CNABInputError)
  })

  test('deve ter code fixo BOLETO_NOT_FOUND', () => {
    const error = new CNABBoletoNotFoundError(5, 3)
    expect(error.code).toBe('BOLETO_NOT_FOUND')
  })

  test('deve armazenar index e boletoCount', () => {
    const error = new CNABBoletoNotFoundError(5, 3)
    expect(error.index).toBe(5)
    expect(error.boletoCount).toBe(3)
  })

  test('deve formatar mensagem corretamente', () => {
    const error = new CNABBoletoNotFoundError(5, 3)
    expect(error.message).toBe('Boleto 5 não existe (o arquivo tem 3 boleto(s))')
  })
})

describe('CNABDocumentValidationError', () => {
  test('deve estender CNABInputError', () => {
    const error = new CNABDocumentValidationError('header ausente')
    expect(error).toBeInstanceOf(CNABInputError)
  })

  test('deve ter code fixo DOCUMENT_VALIDATION_ERROR', () => {
    const error = new CNABDocumentValidationError('header ausente')
    expect(error.code).toBe('DOCUMENT_VALIDATION_ERROR')
  })

  test('deve armazenar lineNumber quando fornecido', () => {
    const error = new CNABDocumentValidationError('tipo inválido', 5)
    expect(error.lineNumber).toBe(5)
  })

  test('deve formatar mensagem com número da linha', () => {
    const error = new CNABDocumentValidationError('tipo inválido', 5)
    expect(error.message).toBe('Arquivo inválido (linha 5): tipo inválido')
  })

  test('deve formatar mensagem sem número da linha', () => {
    const error = new CNABDocumentValidationError('arquivo vazio')
    expect(error.message).toBe('Arquivo inválido: arquivo vazio')
    expect(error.lineNumber).toBeUndefined()
  })
})
