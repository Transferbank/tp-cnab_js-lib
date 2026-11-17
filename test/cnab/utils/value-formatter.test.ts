import { describe, it, expect } from '@jest/globals'
import { DateFormat } from '@cnab/utils/date-parser'
import {
  assertValueType,
  formatAlphanumeric,
  formatDate,
  formatImpliedDecimal,
  formatNumericText
} from '@cnab/utils/value-formatter'

describe('value-formatter', (): void => {
  describe('assertValueType', (): void => {
    describe.each([
      { value: 123, type: 'text' as const, description: 'a number where text is expected' },
      { value: '123', type: 'number' as const, description: 'text where a number is expected' },
      { value: Number.NaN, type: 'number' as const, description: 'NaN' },
      { value: new Date(Number.NaN), type: 'date' as const, description: 'an invalid date' }
    ])('given $description', ({ value, type }): void => {
      it('when asserting then throws a type error', (): void => {
        expect((): void => assertValueType(value, type)).toThrow(TypeError)
      })
    })
  })

  describe('formatAlphanumeric', (): void => {
    it('given a text with accents when formatting then writes it without accents, uppercase and padded with blanks', (): void => {
      expect(formatAlphanumeric('São João', 10)).toBe('SAO JOAO  ')
    })

    it('given a text longer than the field when formatting then throws a range error', (): void => {
      expect((): string => formatAlphanumeric('ABCDEF', 5)).toThrow(RangeError)
    })
  })

  describe('formatNumericText', (): void => {
    it('given a numeric text when formatting then keeps the leading zeros and pads with zeros', (): void => {
      expect(formatNumericText('0123', 6)).toBe('000123')
    })

    it('given a text with letters when formatting then throws a range error', (): void => {
      expect((): string => formatNumericText('12A', 6)).toThrow(RangeError)
    })
  })

  describe('formatImpliedDecimal', (): void => {
    it('given an amount with floating point noise when formatting then rounds to the cents', (): void => {
      expect(formatImpliedDecimal(0.1 + 0.2, 13, 2)).toBe('0000000000030')
    })

    it('given an absent amount when formatting then writes zeros', (): void => {
      expect(formatImpliedDecimal(null, 13, 2)).toBe('0000000000000')
    })

    describe.each([
      { value: -1, description: 'a negative amount' },
      { value: 100000000000, description: 'an amount that does not fit in the field' },
      { value: 1e19, description: 'an amount written in scientific notation' }
    ])('given $description', ({ value }): void => {
      it('when formatting then throws a range error', (): void => {
        expect((): string => formatImpliedDecimal(value, 13, 2)).toThrow(RangeError)
      })
    })
  })

  describe('formatDate', (): void => {
    describe.each([
      { dateFormat: DateFormat.DDMMAA, expected: '030626' },
      { dateFormat: DateFormat.DDMMAAAA, expected: '03062026' },
      { dateFormat: DateFormat.AAAAMMDD, expected: '20260603' }
    ])('given the format $dateFormat', ({ dateFormat, expected }): void => {
      it('when formatting a date then writes it in that format', (): void => {
        expect(formatDate(new Date(2026, 5, 3), dateFormat)).toBe(expected)
      })
    })

    it('given a year outside the two digit century when formatting as DDMMAA then throws a range error', (): void => {
      expect((): string => formatDate(new Date(2050, 0, 1), DateFormat.DDMMAA)).toThrow(RangeError)
    })
  })
})
