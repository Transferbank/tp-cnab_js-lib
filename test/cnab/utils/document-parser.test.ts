import { describe, it, expect } from '@jest/globals'
import {
  DocumentType,
  documentTypeByIndicator,
  normalizeDocument,
  validateDocument,
  validateDocumentByIndicator,
  isValidCPF,
  isValidCNPJ
} from '@cnab/utils/document-parser'

describe('document-parser', (): void => {
  describe('isValidCPF', (): void => {
    describe.each([
      { cpf: '12345678909', description: 'plain digits' },
      { cpf: '123.456.789-09', description: 'formatted with punctuation' }
    ])('given a valid CPF: $description', ({ cpf }): void => {
      it('when validating then returns true', (): void => {
        expect(isValidCPF(cpf)).toBe(true)
      })
    })

    describe.each([
      { cpf: '11111111111', description: 'all repeated digits' },
      { cpf: '1234567890A', description: 'containing a letter' }
    ])('given an invalid CPF: $description', ({ cpf }): void => {
      it('when validating then returns false', (): void => {
        expect(isValidCPF(cpf)).toBe(false)
      })
    })
  })

  describe('isValidCNPJ', (): void => {
    describe.each([
      { cnpj: '00123400010076', description: 'plain numeric digits' },
      { cnpj: '00.123.400/0100-76', description: 'formatted with punctuation' },
      { cnpj: '12ABC34501DE35', description: 'alphanumeric' },
      { cnpj: '12abc34501de35', description: 'alphanumeric with lowercase letters' }
    ])('given a valid CNPJ: $description', ({ cnpj }): void => {
      it('when validating then returns true', (): void => {
        expect(isValidCNPJ(cnpj)).toBe(true)
      })
    })

    describe.each([
      { cnpj: '11111111111111', description: 'all repeated digits' },
      { cnpj: '12ABC34501DE36', description: 'wrong check digit' },
      { cnpj: '12ABC34501DEA5', description: 'letter in a check digit position' }
    ])('given an invalid CNPJ: $description', ({ cnpj }): void => {
      it('when validating then returns false', (): void => {
        expect(isValidCNPJ(cnpj)).toBe(false)
      })
    })
  })

  describe('validateDocument', (): void => {
    describe.each([
      { document: '00012345678909', description: 'CPF right-padded with zeros' },
      { document: '0000123400010076', description: 'numeric CNPJ right-padded with zeros' },
      // CNPJ 00023400010002 (raiz comeca com "000") armazenado num campo de 15
      // posicoes com 1 zero de padding a mais: stripar todos os zeros (bug
      // antigo) sobra com exatamente 11 digitos e valida como CPF por engano.
      { document: '000023400010002', description: 'CNPJ whose root itself starts with zeros' },
      { document: '12ABC34501DE35', description: 'alphanumeric CNPJ' },
      { document: '12abc34501de35', description: 'alphanumeric CNPJ with lowercase letters' }
    ])('given a valid document: $description', ({ document }): void => {
      it('when validating then accepts it', (): void => {
        expect(validateDocument(document)).toBe(true)
      })
    })

    describe.each([
      { document: '000000000000000', description: 'all zeros, fails the repeated-digit check' },
      { document: '', description: 'blank value' },
      { document: '12345678900', description: 'wrong check digits' },
      {
        document: '123.456.789-09',
        description: 'CPF formatted with punctuation, rejected because unlike isValidCPF this does not strip formatting'
      }
    ])('given an invalid document: $description', ({ document }): void => {
      it('when validating then rejects it', (): void => {
        expect(validateDocument(document)).toBe(false)
      })
    })
  })

  describe('validateDocumentByIndicator', (): void => {
    describe.each([
      {
        description: 'CPF indicator with a valid CPF',
        document: '12345678909',
        tipoInscricao: '01',
        cpfIndicator: '01',
        cnpjIndicator: '02'
      },
      {
        description: 'CNPJ indicator with a valid numeric CNPJ',
        document: '00123400010076',
        tipoInscricao: '02',
        cpfIndicator: '01',
        cnpjIndicator: '02'
      },
      {
        description: 'CNPJ indicator with a valid alphanumeric CNPJ',
        document: '12ABC34501DE35',
        tipoInscricao: '02',
        cpfIndicator: '01',
        cnpjIndicator: '02'
      }
    ])('given a $description', ({ document, tipoInscricao, cpfIndicator, cnpjIndicator }): void => {
      it('when validating then accepts it', (): void => {
        expect(validateDocumentByIndicator(document, tipoInscricao, cpfIndicator, cnpjIndicator)).toBe(true)
      })
    })

    describe.each([
      {
        description: 'CPF indicator with an invalid CPF',
        document: '11111111111',
        tipoInscricao: '01',
        cpfIndicator: '01',
        cnpjIndicator: '02'
      },
      {
        description: 'CPF indicator with alphabetic padding before the digits',
        document: 'ABCD12345678909',
        tipoInscricao: '1',
        cpfIndicator: '1',
        cnpjIndicator: '2'
      },
      {
        description: 'CNPJ indicator with an alphanumeric CNPJ with wrong check digit',
        document: '12ABC34501DE36',
        tipoInscricao: '02',
        cpfIndicator: '01',
        cnpjIndicator: '02'
      },
      {
        description: 'CNPJ indicator with punctuation in the document, rejected because unlike isValidCNPJ this does not strip formatting',
        document: '001.234.000/1007-6',
        tipoInscricao: '02',
        cpfIndicator: '01',
        cnpjIndicator: '02'
      },
      {
        description: 'tipo de inscricao that matches neither indicator, falling through to rejection',
        document: '12345678909',
        tipoInscricao: '99',
        cpfIndicator: '01',
        cnpjIndicator: '02'
      }
    ])('given a $description', ({ document, tipoInscricao, cpfIndicator, cnpjIndicator }): void => {
      it('when validating then rejects it', (): void => {
        expect(validateDocumentByIndicator(document, tipoInscricao, cpfIndicator, cnpjIndicator)).toBe(false)
      })
    })
  })

  describe('documentTypeByIndicator', (): void => {
    describe.each([
      { description: 'CPF indicator', tipoInscricao: '01', expected: DocumentType.CPF },
      { description: 'CNPJ indicator', tipoInscricao: '02', expected: DocumentType.CNPJ },
      { description: 'tipo de inscricao that matches neither indicator', tipoInscricao: '00', expected: null },
      { description: 'blank tipo de inscricao', tipoInscricao: '', expected: null }
    ])('given a $description', ({ tipoInscricao, expected }): void => {
      it('when resolving the document type then returns it', (): void => {
        expect(documentTypeByIndicator(tipoInscricao, '01', '02')).toBe(expected)
      })
    })
  })

  describe('normalizeDocument', (): void => {
    describe.each([
      { description: 'CPF padded with zeros to 14 positions', document: '00012345678909', documentType: DocumentType.CPF, expected: '12345678909' },
      { description: 'CPF padded with zeros to 15 positions', document: '000012345678909', documentType: DocumentType.CPF, expected: '12345678909' },
      { description: 'CNPJ padded with zeros to 15 positions', document: '000123400010076', documentType: DocumentType.CNPJ, expected: '00123400010076' },
      { description: 'CNPJ without padding', document: '12ABC34501DE35', documentType: DocumentType.CNPJ, expected: '12ABC34501DE35' },
      { description: 'CPF without padding', document: '12345678909', documentType: DocumentType.CPF, expected: '12345678909' },
      { description: 'CPF with non zero characters before the digits', document: 'ABCD12345678909', documentType: DocumentType.CPF, expected: 'ABCD12345678909' },
      { description: 'document of unknown type', document: '00012345678909', documentType: null, expected: '00012345678909' }
    ])('given a $description', ({ document, documentType, expected }): void => {
      it('when normalizing then returns only the document digits', (): void => {
        expect(normalizeDocument(document, documentType)).toBe(expected)
      })
    })
  })
})
