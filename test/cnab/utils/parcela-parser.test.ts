import { describe, it, expect } from '@jest/globals'
import { findParcela } from '@cnab/utils/parcela-parser'

describe('parcela-parser', (): void => {
  describe('findParcela', (): void => {
    describe.each([
      { value: '12345 1/3', expected: { parcela: 1, total: 3 }, description: 'space before parcela and total' },
      { value: '123456-1/3', expected: { parcela: 1, total: 3 }, description: 'dash before parcela and total' },
      { value: '123456-2 5', expected: { parcela: 2, total: 5 }, description: 'dash before parcela and space before total' },
      { value: 'XX12345-01', expected: { parcela: 1, total: null }, description: 'dash before parcela only' },
      { value: '12.345678.01', expected: { parcela: 1, total: null }, description: 'dot before parcela only, with dots in the document' },
      { value: 'XX:123/2', expected: { parcela: 2, total: null }, description: 'slash before parcela only' },
      { value: '12.345678.00', expected: { parcela: 0, total: null }, description: 'parcela única written as 00' }
    ])('given a value with parcela: $description', ({ value, expected }): void => {
      it('when searching then returns the parcela', (): void => {
        expect(findParcela(value)).toEqual(expected)
      })
    })

    describe.each([
      { value: '123456', description: 'only the document' },
      { value: 'NF00012345', description: 'document with letters' },
      { value: '15.12.2026', description: 'number with more than 3 digits after the last dot' }
    ])('given a value without parcela: $description', ({ value }): void => {
      it('when searching then returns null', (): void => {
        expect(findParcela(value)).toBeNull()
      })
    })
  })
})
