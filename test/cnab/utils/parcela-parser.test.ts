import { describe, it, expect } from '@jest/globals'
import { findParcela, findParcelaInRanges } from '@cnab/utils/parcela-parser'

describe('parcela-parser', (): void => {
  describe('findParcela', (): void => {
    describe.each([
      { value: '12345 1/3', expected: { parcela: 1, total: 3 }, description: 'space before parcela and total' },
      { value: '123456-1/3', expected: { parcela: 1, total: 3 }, description: 'dash before parcela and total' },
      { value: '123456-2 5', expected: { parcela: 2, total: 5 }, description: 'dash before parcela and space before total' },
      { value: 'XX12345-01', expected: { parcela: 1, total: null }, description: 'dash before parcela only' },
      { value: '12.345678.01', expected: { parcela: 1, total: null }, description: 'dot before parcela only, with dots in the document' },
      { value: 'XX:123/2', expected: { parcela: 2, total: null }, description: 'slash before parcela only' }
    ])('given a value with parcela: $description', ({ value, expected }): void => {
      it('when searching then returns the parcela', (): void => {
        expect(findParcela(value)).toEqual(expected)
      })
    })

    describe.each([
      { value: '123456', description: 'only the document' },
      { value: '12.345678.00', description: 'parcela written as 00' }
    ])('given a value without parcela: $description', ({ value }): void => {
      it('when searching then returns null', (): void => {
        expect(findParcela(value)).toBeNull()
      })
    })
  })
  describe('findParcelaInRanges', (): void => {
    const firstRange: [number, number] = [1, 15]
    const secondRange: [number, number] = [16, 30]
    const lineWith = (first: string, second: string): string => first.padEnd(15) + second.padEnd(15)

    describe.each([
      { first: '12.345678.10', second: 'XX123456-1', expected: { parcela: 10, total: null }, description: 'second value cut by the field size, parcela taken from the first range' },
      { first: '1234567890', second: '12345 1/3', expected: { parcela: 1, total: 3 }, description: 'parcela and total only in the second range' },
      { first: '123456', second: '123456', expected: null, description: 'no parcela in either range' }
    ])('given $description', ({ first, second, expected }): void => {
      it('when searching then returns the parcela of the first range that has one', (): void => {
        expect(findParcelaInRanges(lineWith(first, second), [firstRange, secondRange])).toEqual(expected)
      })
    })

    it('given a null range when searching then skips it', (): void => {
      expect(findParcelaInRanges(lineWith('PED1234-2/4', '12345 1/3'), [null, secondRange])).toEqual({ parcela: 1, total: 3 })
    })
  })
})
