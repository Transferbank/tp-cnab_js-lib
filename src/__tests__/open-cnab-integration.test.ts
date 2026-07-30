/**
 * Teste de integração: percorre os fixtures reais disponíveis (um arquivo de
 * remessa por banco cadastrado) e verifica que openCnab() + read() /
 * read({ lazy: true }) / readAsync() / validate() funcionam ponta-a-ponta,
 * sem lançar exceções inesperadas.
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { openCnab } from '../index'

interface FixtureCase {
  label: string
  path: string
}

// Um fixture por banco/formato com schema cadastrado em src/schemas/index.ts.
const FIXTURES: FixtureCase[] = [
  { label: 'CNAB 400 - Banco do Brasil', path: 'bancoDoBrasil/__fixtures__/BANCOBRASIL_cnab_400.REM' },
  { label: 'CNAB 400 - Bradesco', path: 'bradesco/__fixtures__/cnab400/remessa-multipla.txt' },
  { label: 'CNAB 400 - Caixa', path: 'caixa/__fixtures__/cnab400/CAIXA_cnab_400.REM' },
  { label: 'CNAB 400 - Itaú', path: 'itau/__fixtures__/cnab400/ITAU_cnab_400.REM' },
  { label: 'CNAB 400 - Santander', path: 'santander/__fixtures__/cnab400/SANTANDER_cnab_400_140.REM' },
  { label: 'CNAB 400 - Sicoob', path: 'sicoob/__fixtures__/cnab400/SICOOB_cnab_400.REM' },
  { label: 'CNAB 400 - Sicredi', path: 'sicredi/__fixtures__/cnab400/SICREDI_cnab_400.CRM' },
  { label: 'CNAB 240 - Bradesco', path: 'bradesco/__fixtures__/cnab240/remessa-multipla.txt' },
]

function loadFixture(relativePath: string): string {
  return readFileSync(join(__dirname, '../banks', relativePath), 'latin1')
}

describe('openCnab() - integração com fixtures reais', () => {
  describe.each(FIXTURES)('$label', ({ path }) => {
    test('read() (SIMPLE, eager) retorna header/trailer/bills sem lançar', () => {
      const cnabFile = openCnab(loadFixture(path))
      const result = cnabFile.read()

      expect(result.header).toBeDefined()
      expect(result.trailer).toBeDefined()
      expect(Array.isArray(result.bills)).toBe(true)
      expect(result.bills.length).toBeGreaterThan(0)
    })

    test('read({ mode: "FULL" }) retorna todos os campos do banco sem lançar', () => {
      const cnabFile = openCnab(loadFixture(path))
      const result = cnabFile.read({ mode: 'FULL' })

      expect(result.bills.length).toBeGreaterThan(0)
      result.bills.forEach((bill) => {
        expect(bill).not.toBeNull()
        expect(typeof bill).toBe('object')
      })
    })

    test('read({ lazy: true }).resolve() produz o mesmo resultado que o modo eager', async () => {
      const cnabFile = openCnab(loadFixture(path))
      const eager = cnabFile.read()
      const lazy = cnabFile.read({ lazy: true })

      expect(lazy.bills.length).toBe(eager.bills.length)

      const resolved = await Promise.all(lazy.bills.map((item) => item.resolve()))
      expect(resolved).toEqual(eager.bills)
    })

    test('readAsync() (eager) produz o mesmo resultado que read()', async () => {
      const cnabFile = openCnab(loadFixture(path))
      const sync = cnabFile.read()
      const asyncResult = await cnabFile.readAsync()

      expect(asyncResult).toEqual(sync)
    })

    test('readAsync({ lazy: true }).resolve() produz o mesmo resultado que o modo eager', async () => {
      const cnabFile = openCnab(loadFixture(path))
      const eager = cnabFile.read()
      const lazy = await cnabFile.readAsync({ lazy: true })

      expect(lazy.bills.length).toBe(eager.bills.length)

      const resolved = await Promise.all(lazy.bills.map((item) => item.resolve()))
      expect(resolved).toEqual(eager.bills)
    })

    test('validate() não lança e não reporta erros além de "Data de vencimento"', () => {
      const cnabFile = openCnab(loadFixture(path))
      const result = cnabFile.validate()

      expect(typeof result.isValid).toBe('boolean')
      expect(Array.isArray(result.feedback.lines)).toBe(true)

      // "Data de vencimento" é uma regra sensível ao tempo: os fixtures têm
      // datas fixas que eventualmente ficam "vencidas" — mesma convenção já
      // usada em tests/cnab-file.test.ts.
      const nonDateErrors = result.feedback.lines.filter((e) => e.field !== 'Data de vencimento')
      expect(nonDateErrors).toEqual([])
    })
  })
})
