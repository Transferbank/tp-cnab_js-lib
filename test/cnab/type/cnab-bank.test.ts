import { describe, it, expect } from '@jest/globals'
import { CnabBank } from '@cnab/type/cnab-bank'

describe('CnabBank.fromCode', (): void => {
  it.each([
    ['341', CnabBank.ITAU],
    ['104', CnabBank.CAIXA],
    ['748', CnabBank.SICREDI],
    ['756', CnabBank.SICOOB],
    ['237', CnabBank.BRADESCO],
    ['033', CnabBank.SANTANDER],
    ['001', CnabBank.BANCODOBRASIL]
  ])('given code %s then returns the matching bank', (code: string, expected: CnabBank): void => {
    expect(CnabBank.fromCode(code)).toBe(expected)
  })

  it('given unknown code then returns null', (): void => {
    expect(CnabBank.fromCode('999')).toBeNull()
  })
})
