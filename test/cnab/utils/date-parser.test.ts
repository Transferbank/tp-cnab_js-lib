import { describe, it, expect } from '@jest/globals'
import {
  DateFormat,
  parseDate,
  parseDateDDMMAA,
  parseDateDDMMAAAA,
  parseDateAAAAMMDD,
  isDateInPast,
  formatDateBR
} from '@cnab/utils/date-parser'

describe('date-parser', (): void => {
  describe('parseDateDDMMAAAA', (): void => {
    it('given a well formed date when parsing then returns the corresponding Date', (): void => {
      expect(parseDateDDMMAAAA('01122026')).toEqual(new Date(2026, 11, 1))
    })

    describe.each([
      {
        description: 'a calendar date that does not exist (31 de fevereiro), instead of rolling it over to 03/03/2026',
        input: '31022026'
      },
      { description: 'a non numeric string', input: 'ABCDEFGH' },
      { description: 'a string with the wrong length', input: '0112' }
    ])('given $description', ({ input }): void => {
      it('when parsing then returns null', (): void => {
        expect(parseDateDDMMAAAA(input)).toBeNull()
      })
    })
  })

  describe('parseDateDDMMAA', (): void => {
    describe.each([
      { description: 'a two digit year of 49 or below, resolving to the 2000s', input: '010126', expected: new Date(2026, 0, 1) },
      { description: 'a two digit year of 50 or above, resolving to the 1900s', input: '010199', expected: new Date(1999, 0, 1) }
    ])('given $description', ({ input, expected }): void => {
      it('when parsing then returns the corresponding Date', (): void => {
        expect(parseDateDDMMAA(input)).toEqual(expected)
      })
    })

    it('given a calendar date that does not exist when parsing then returns null', (): void => {
      expect(parseDateDDMMAA('310226')).toBeNull()
    })
  })

  describe('parseDateAAAAMMDD', (): void => {
    it('given a well formed date when parsing then returns the corresponding Date', (): void => {
      expect(parseDateAAAAMMDD('20261201')).toEqual(new Date(2026, 11, 1))
    })

    it('given a calendar date that does not exist when parsing then returns null', (): void => {
      expect(parseDateAAAAMMDD('20260231')).toBeNull()
    })
  })

  describe('parseDate', (): void => {
    it('given DateFormat.DDMMAAAA when parsing then delegates to parseDateDDMMAAAA', (): void => {
      expect(parseDate('01122026', DateFormat.DDMMAAAA)).toEqual(new Date(2026, 11, 1))
    })

    it('given a null format when parsing then returns null', (): void => {
      expect(parseDate('01122026', null)).toBeNull()
    })
  })

  describe('isDateInPast', (): void => {
    describe.each([
      { date: new Date(2000, 0, 1), expected: true },
      { date: new Date(2999, 0, 1), expected: false }
    ])('parameterized cases', ({ date, expected }): void => {
      it(`given a date of ${date.toDateString()} when checking then returns ${expected}`, (): void => {
        expect(isDateInPast(date)).toBe(expected)
      })
    })
  })

  describe('formatDateBR', (): void => {
    it('given a date when formatting then returns it as DD/MM/AAAA', (): void => {
      expect(formatDateBR(new Date(2026, 11, 1))).toBe('01/12/2026')
    })
  })
})
