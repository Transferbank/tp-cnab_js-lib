/**
 * Testes para date-parser
 */

import {
  parseDateDDMMAA,
  parseDateDDMMAAAA,
  parseDate,
  isDateInPast,
  formatDateBR,
} from '../src/utils/date-parser'

describe('parseDateDDMMAA', () => {
  test('deve parsear data válida no formato DDMMAA', () => {
    const date = parseDateDDMMAA('010726')
    expect(date).toBeInstanceOf(Date)
    expect(date?.getDate()).toBe(1)
    expect(date?.getMonth()).toBe(6) // Julho (0-indexed)
    expect(date?.getFullYear()).toBe(2026)
  })

  test('deve retornar null para formato inválido', () => {
    expect(parseDateDDMMAA('invalid')).toBeNull()
    expect(parseDateDDMMAA('32012')).toBeNull()
    expect(parseDateDDMMAA('311399')).toBeNull()
  })

  test('deve retornar null para string vazia', () => {
    expect(parseDateDDMMAA('')).toBeNull()
  })
})

describe('parseDateDDMMAAAA', () => {
  test('deve parsear data válida no formato DDMMAAAA', () => {
    const date = parseDateDDMMAAAA('01072026')
    expect(date).toBeInstanceOf(Date)
    expect(date?.getDate()).toBe(1)
    expect(date?.getMonth()).toBe(6)
    expect(date?.getFullYear()).toBe(2026)
  })

  test('deve retornar null para data inválida', () => {
    expect(parseDateDDMMAAAA('32012026')).toBeNull()
    expect(parseDateDDMMAAAA('31132026')).toBeNull()
  })
})

describe('parseDate', () => {
  test('deve usar o formato correto', () => {
    const date6 = parseDate('010726', 'DDMMAA')
    expect(date6?.getFullYear()).toBe(2026)

    const date8 = parseDate('01072026', 'DDMMAAAA')
    expect(date8?.getFullYear()).toBe(2026)
  })

  test('deve retornar null para formato null', () => {
    expect(parseDate('01072026', null)).toBeNull()
  })
})

describe('isDateInPast', () => {
  test('deve detectar datas no passado', () => {
    const pastDate = new Date('2020-01-01')
    expect(isDateInPast(pastDate)).toBe(true)
  })

  test('deve detectar datas no futuro', () => {
    const futureDate = new Date('2030-01-01')
    expect(isDateInPast(futureDate)).toBe(false)
  })
})

describe('formatDateBR', () => {
  test('deve formatar data no padrão brasileiro', () => {
    const date = new Date(2026, 6, 1)
    expect(formatDateBR(date)).toBe('01/07/2026')
  })
})
