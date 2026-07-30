/**
 * Testes para document-validator
 * 
 * Este módulo é um re-export das funções de validação de documentos de utils/string-utils.
 * Os testes aqui garantem que as funções são exportadas corretamente e acessíveis
 * através do caminho validators/document-validator.
 */

import {
  isValidCPF,
  isValidCNPJ,
  isValidCpfCnpj,
  validatePayerDocument
} from '@validators/document-validator'

describe('document-validator (re-exports)', () => {
  describe('isValidCPF', () => {
    test('deve validar CPF correto', () => {
      expect(isValidCPF('11144477735')).toBe(true)
      expect(isValidCPF('12345678909')).toBe(true)
    })

    test('deve rejeitar CPF inválido', () => {
      expect(isValidCPF('11144477736')).toBe(false) // Dígito verificador errado
      expect(isValidCPF('12345678900')).toBe(false)
    })

    test('deve rejeitar CPF com todos os dígitos iguais', () => {
      expect(isValidCPF('11111111111')).toBe(false)
      expect(isValidCPF('00000000000')).toBe(false)
    })

    test('deve aceitar CPF com pontuação', () => {
      expect(isValidCPF('111.444.777-35')).toBe(true)
      expect(isValidCPF('123.456.789-09')).toBe(true)
    })
  })

  describe('isValidCNPJ', () => {
    test('deve validar CNPJ correto', () => {
      expect(isValidCNPJ('11222333000181')).toBe(true)
    })

    test('deve rejeitar CNPJ inválido', () => {
      expect(isValidCNPJ('11222333000182')).toBe(false) // Dígito verificador errado
      expect(isValidCNPJ('12345678000100')).toBe(false)
    })

    test('deve rejeitar CNPJ com todos os dígitos iguais', () => {
      expect(isValidCNPJ('11111111111111')).toBe(false)
      expect(isValidCNPJ('00000000000000')).toBe(false)
    })

    test('deve aceitar CNPJ com pontuação', () => {
      expect(isValidCNPJ('11.222.333/0001-81')).toBe(true)
    })
  })

  describe('isValidCpfCnpj', () => {
    test('deve validar CPF correto', () => {
      expect(isValidCpfCnpj('11144477735')).toBe(true)
      expect(isValidCpfCnpj('111.444.777-35')).toBe(true)
    })

    test('deve validar CNPJ correto', () => {
      expect(isValidCpfCnpj('11222333000181')).toBe(true)
      expect(isValidCpfCnpj('11.222.333/0001-81')).toBe(true)
    })

    test('deve rejeitar documento inválido', () => {
      expect(isValidCpfCnpj('11144477736')).toBe(false) // CPF inválido
      expect(isValidCpfCnpj('11222333000182')).toBe(false) // CNPJ inválido
    })

    test('deve rejeitar documento vazio ou com tamanho incorreto', () => {
      expect(isValidCpfCnpj('')).toBe(false)
      expect(isValidCpfCnpj('123')).toBe(false)
      expect(isValidCpfCnpj('123456789012345')).toBe(false) // Muito longo
    })
  })

  describe('validatePayerDocument', () => {
    test('deve validar CPF com padding de zeros', () => {
      expect(validatePayerDocument('000012345678909')).toBe(true) // CPF com padding (15 chars)
      expect(validatePayerDocument('00011144477735')).toBe(true)
    })

    test('deve validar CNPJ com padding de zeros', () => {
      expect(validatePayerDocument('011222333000181')).toBe(true) // CNPJ com padding (15 chars)
    })

    test('deve validar documento sem padding', () => {
      expect(validatePayerDocument('12345678909')).toBe(true) // CPF sem padding (11 chars)
      expect(validatePayerDocument('11222333000181')).toBe(true) // CNPJ sem padding (14 chars)
    })

    test('deve rejeitar documento inválido mesmo com padding', () => {
      expect(validatePayerDocument('000012345678900')).toBe(false) // CPF inválido com padding
      expect(validatePayerDocument('011222333000182')).toBe(false) // CNPJ inválido com padding
    })

    test('deve aceitar documento com pontuação', () => {
      expect(validatePayerDocument('111.444.777-35')).toBe(true)
      expect(validatePayerDocument('11.222.333/0001-81')).toBe(true)
    })
  })
})
