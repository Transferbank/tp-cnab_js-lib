/**
 * Testes de registro dos schemas de banco (cobertura de regressão pro port JS ? TS)
 */

import { getBankSchema, cnab400Banks } from '../src/schemas'
import { CNABFormatCode } from '@tp-types/index'

describe('cnab400Banks', () => {
  test.each([
    ['001', 'Banco do Brasil'],
    ['033', 'Santander'],
    ['104', 'Caixa Econômica'],
    ['237', 'Bradesco'],
    ['341', 'Itaú'],
    ['756', 'Sicoob'],
  ])('registra o banco %s (%s) com header/detail/trailer', (bankCode, bankName) => {
    const schema = getBankSchema(bankCode, CNABFormatCode.CNAB400)
    expect(schema).not.toBeNull()
    expect(schema?.bankCode).toBe(bankCode)
    expect(schema?.bankName).toBe(bankName)
    expect(schema?.header).toBeDefined()
    expect(schema?.detail).toBeDefined()
    expect(schema?.trailer).toBeDefined()
  })

  test('Banco do Brasil usa tipo_registro "7" no detalhe', () => {
    expect(cnab400Banks['001'].detail?.tipo_registro.pattern).toBe('7')
  })

  test('Santander tem qtd_documentos no trailer para checagem cruzada', () => {
    expect(cnab400Banks['033'].trailer?.qtd_documentos).toBeDefined()
  })
})

describe('cnab240Banks', () => {
  test.each([
    ['033', 'Santander'],
    ['237', 'Bradesco'],
    ['748', 'Sicredi'],
  ])('registra o banco %s (%s) com headerArquivo/segmentoP/segmentoQ/trailerArquivo', (bankCode, bankName) => {
    const schema = getBankSchema(bankCode, CNABFormatCode.CNAB240)
    expect(schema).not.toBeNull()
    expect(schema?.bankCode).toBe(bankCode)
    expect(schema?.bankName).toBe(bankName)
    expect(schema?.headerArquivo).toBeDefined()
    expect(schema?.segmentoP).toBeDefined()
    expect(schema?.segmentoQ).toBeDefined()
    expect(schema?.trailerArquivo).toBeDefined()
  })
})

describe('getBankSchema', () => {
  test('retorna null para banco não cadastrado', () => {
    expect(getBankSchema('999', CNABFormatCode.CNAB400)).toBeNull()
    expect(getBankSchema('999', CNABFormatCode.CNAB240)).toBeNull()
  })
})
