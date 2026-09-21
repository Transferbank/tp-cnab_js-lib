import { describe, it, expect } from '@jest/globals'
import {
  validateDocument,
  validateDocumentByIndicator,
  isValidCPF,
  isValidCNPJ
} from '@cnab/utils/document-parser'

describe('document-parser', (): void => {
  describe('validateDocument', (): void => {
    it('given a valid CPF right-padded with zeros when validating then accepts it', (): void => {
      expect(validateDocument('00012345678909')).toBe(true)
    })

    it('given a valid CNPJ right-padded with zeros when validating then accepts it', (): void => {
      expect(validateDocument('0000123400010076')).toBe(true)
    })

    it('given a valid CNPJ whose root itself starts with zeros when validating then does not misread it as a CPF', (): void => {
      // CNPJ 00023400010002 (raiz comeca com "000") armazenado num campo
      // de 15 posicoes com 1 zero de padding a mais: soma 4 zeros a
      // esquerda no total. Stripar todos os zeros (bug antigo) sobra com
      // exatamente 11 digitos e valida como CPF por engano, rejeitando
      // um CNPJ legitimo.
      expect(validateDocument('000023400010002')).toBe(true)
    })

    it('given an all zero document when validating then rejects it', (): void => {
      expect(validateDocument('000000000000000')).toBe(false)
    })

    it('given a blank document when validating then rejects it', (): void => {
      expect(validateDocument('')).toBe(false)
    })

    it('given an invalid document when validating then rejects it', (): void => {
      expect(validateDocument('12345678900')).toBe(false)
    })

    it('given a CPF formatted with punctuation when validating then rejects it', (): void => {
      expect(validateDocument('123.456.789-09')).toBe(false)
    })
  })

  describe('validateDocumentByIndicator', (): void => {
    it('given a CPF indicator with alphabetic padding before the digits when validating then rejects it', (): void => {
      expect(validateDocumentByIndicator('ABCD12345678909', '1', '1', '2')).toBe(false)
    })
  })

  describe('isValidCPF', (): void => {
    it('given a valid CPF when validating then returns true', (): void => {
      expect(isValidCPF('12345678909')).toBe(true)
    })

    it('given a CPF with all repeated digits when validating then returns false', (): void => {
      expect(isValidCPF('11111111111')).toBe(false)
    })

    it('given a CPF formatted with punctuation when validating then returns false', (): void => {
      expect(isValidCPF('123.456.789-09')).toBe(false)
    })
  })

  describe('isValidCNPJ', (): void => {
    it('given a valid CNPJ when validating then returns true', (): void => {
      expect(isValidCNPJ('00123400010076')).toBe(true)
    })

    it('given a CNPJ with all repeated digits when validating then returns false', (): void => {
      expect(isValidCNPJ('11111111111111')).toBe(false)
    })

    it('given a CNPJ formatted with punctuation when validating then returns false', (): void => {
      expect(isValidCNPJ('00.123.400/0100-76')).toBe(false)
    })

    it('given a valid alphanumeric CNPJ when validating then returns true', (): void => {
      // Raiz alfanumerica "12ABC34501" + ordem "DE" + DV "35", conforme o
      // novo formato da Receita Federal (digitos verificadores continuam numericos)
      expect(isValidCNPJ('12ABC34501DE35')).toBe(true)
    })

    it('given an alphanumeric CNPJ with lowercase letters when validating then returns true', (): void => {
      expect(isValidCNPJ('12abc34501de35')).toBe(true)
    })

    it('given an alphanumeric CNPJ with a wrong check digit when validating then returns false', (): void => {
      expect(isValidCNPJ('12ABC34501DE36')).toBe(false)
    })

    it('given an alphanumeric CNPJ with a letter in the check digit positions when validating then returns false', (): void => {
      expect(isValidCNPJ('12ABC34501DEA5')).toBe(false)
    })
  })
})
