import { describe, it, expect } from '@jest/globals'
import {
  DocumentType,
  documentTypeByIndicator,
  normalizeDocument,
  validateDocumentByType,
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

  describe('validateDocumentByType', (): void => {
    describe.each([
      { description: 'valid CPF', document: '12345678909', documentType: DocumentType.CPF },
      { description: 'valid numeric CNPJ', document: '00123400010076', documentType: DocumentType.CNPJ },
      { description: 'valid CNPJ whose root itself starts with zeros', document: '00023400010002', documentType: DocumentType.CNPJ },
      { description: 'valid alphanumeric CNPJ', document: '12ABC34501DE35', documentType: DocumentType.CNPJ },
      { description: 'valid alphanumeric CNPJ with lowercase letters', document: '12abc34501de35', documentType: DocumentType.CNPJ }
    ])('given a $description', ({ document, documentType }): void => {
      it('when validating then accepts it', (): void => {
        expect(validateDocumentByType(document, documentType)).toBe(true)
      })
    })

    describe.each([
      { description: 'CPF with all repeated digits', document: '11111111111', documentType: DocumentType.CPF },
      { description: 'CPF with wrong check digits', document: '12345678900', documentType: DocumentType.CPF },
      { description: 'CPF with alphabetic padding before the digits', document: 'ABCD12345678909', documentType: DocumentType.CPF },
      { description: 'CPF formatted with punctuation, rejected because unlike isValidCPF this does not strip formatting', document: '123.456.789-09', documentType: DocumentType.CPF },
      { description: 'CNPJ with wrong check digit', document: '12ABC34501DE36', documentType: DocumentType.CNPJ },
      { description: 'CNPJ formatted with punctuation, rejected because unlike isValidCNPJ this does not strip formatting', document: '001.234.000/1007-6', documentType: DocumentType.CNPJ },
      { description: 'valid CPF of unknown document type', document: '12345678909', documentType: null }
    ])('given a $description', ({ document, documentType }): void => {
      it('when validating then rejects it', (): void => {
        expect(validateDocumentByType(document, documentType)).toBe(false)
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
