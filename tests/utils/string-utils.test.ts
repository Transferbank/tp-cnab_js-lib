/**
 * Testes para validação de documentos
 */

import { isValidCPF, isValidCNPJ, isValidCpfCnpj, validatePayerDocument } from '../../src/utils/string-utils'

describe('isValidCPF', () => {
  test('deve validar CPF correto', () => {
    expect(isValidCPF('12345678909')).toBe(true)
    expect(isValidCPF('111.444.777-35')).toBe(true)
  })

  test('deve rejeitar CPF inválido', () => {
    expect(isValidCPF('12345678900')).toBe(false)
    expect(isValidCPF('11111111111')).toBe(false) // Todos dígitos iguais
    expect(isValidCPF('123')).toBe(false) // Tamanho incorreto
  })
})

describe('isValidCNPJ', () => {
  test('deve validar CNPJ correto', () => {
    expect(isValidCNPJ('11222333000181')).toBe(true)
    expect(isValidCNPJ('11.222.333/0001-81')).toBe(true)
  })

  test('deve rejeitar CNPJ inválido', () => {
    expect(isValidCNPJ('11222333000180')).toBe(false)
    expect(isValidCNPJ('11111111111111')).toBe(false) // Todos dígitos iguais
    expect(isValidCNPJ('123')).toBe(false) // Tamanho incorreto
  })
})

describe('isValidCpfCnpj', () => {
  test('deve validar tanto CPF quanto CNPJ', () => {
    expect(isValidCpfCnpj('12345678909')).toBe(true)
    expect(isValidCpfCnpj('11222333000181')).toBe(true)
  })

  test('deve rejeitar documentos inválidos', () => {
    expect(isValidCpfCnpj('12345')).toBe(false)
    expect(isValidCpfCnpj('invalid')).toBe(false)
  })
})

describe('validatePayerDocument', () => {
  test('deve validar documento com zeros à esquerda', () => {
    // Simula formato CNAB com zeros padding
    expect(validatePayerDocument('00012345678909')).toBe(true)
  })

  test('deve rejeitar documento vazio ou inválido', () => {
    expect(validatePayerDocument('00000000000000')).toBe(false)
    expect(validatePayerDocument('              ')).toBe(false)
  })
})
