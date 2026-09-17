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

    it('given a calendar date that does not exist when parsing then returns null instead of rolling it over', (): void => {
      // 31 de fevereiro nao existe - new Date(2026, 1, 31) faria rollover pra 03/03/2026
      expect(parseDateDDMMAAAA('31022026')).toBeNull()
    })

    it('given a non numeric string when parsing then returns null', (): void => {
      expect(parseDateDDMMAAAA('ABCDEFGH')).toBeNull()
    })

    it('given a string with the wrong length when parsing then returns null', (): void => {
      expect(parseDateDDMMAAAA('0112')).toBeNull()
    })
  })

  describe('parseDateDDMMAA', (): void => {
    it('given a two digit year of 49 or below when parsing then resolves to the 2000s', (): void => {
      expect(parseDateDDMMAA('010126')).toEqual(new Date(2026, 0, 1))
    })

    it('given a two digit year of 50 or above when parsing then resolves to the 1900s', (): void => {
      expect(parseDateDDMMAA('010199')).toEqual(new Date(1999, 0, 1))
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
    it('given a date before today when checking then returns true', (): void => {
      expect(isDateInPast(new Date(2000, 0, 1))).toBe(true)
    })

    it('given a date after today when checking then returns false', (): void => {
      expect(isDateInPast(new Date(2999, 0, 1))).toBe(false)
    })
  })

  describe('formatDateBR', (): void => {
    it('given a date when formatting then returns it as DD/MM/AAAA', (): void => {
      expect(formatDateBR(new Date(2026, 11, 1))).toBe('01/12/2026')
    })
  })
})
