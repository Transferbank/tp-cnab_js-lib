import { readFileSync } from 'fs'
import { join } from 'path'
import { openCnabFromLines, ReadMode } from '../index'

function stringToLines(content: string): string[] {
  return content.split(/\r?\n/).filter((line) => line.length > 0)
}

interface FixtureCase {
  label: string
  path: string
}

// Um fixture por banco/formato com schema cadastrado em src/schemas/index.ts.
const FIXTURES: FixtureCase[] = [
  { label: 'CNAB 400 - Banco do Brasil', path: 'bancoDoBrasil/docs/BANCOBRASIL_cnab_400.REM' },
  { label: 'CNAB 400 - Bradesco', path: 'bradesco/docs/cnab400/remessa-multipla.txt' },
  { label: 'CNAB 400 - Caixa', path: 'caixa/docs/cnab400/CAIXA_cnab_400.REM' },
  { label: 'CNAB 400 - Itaú', path: 'itau/docs/cnab400/ITAU_cnab_400.REM' },
  { label: 'CNAB 400 - Santander', path: 'santander/docs/cnab400/SANTANDER_cnab_400_140.REM' },
  { label: 'CNAB 400 - Sicoob', path: 'sicoob/docs/cnab400/SICOOB_cnab_400.REM' },
  { label: 'CNAB 400 - Sicredi', path: 'sicredi/docs/cnab400/SICREDI_cnab_400.CRM' },
  { label: 'CNAB 240 - Bradesco', path: 'bradesco/docs/cnab240/remessa-multipla.txt' },
]

function loadFixture(relativePath: string): string {
  return readFileSync(join(__dirname, '../banks', relativePath), 'latin1')
}

describe('openCnab() - integração com fixtures reais', () => {
  describe.each(FIXTURES)('$label', ({ path }) => {
    test('read() (SIMPLE, eager) retorna header/trailer/bills sem lançar', () => {
      const cnabFile = openCnabFromLines(stringToLines(loadFixture(path)))
      const result = cnabFile.read()

      expect(result.header).toBeDefined()
      expect(result.trailer).toBeDefined()
      expect(Array.isArray(result.bills)).toBe(true)
      expect(result.bills.length).toBeGreaterThan(0)
    })

    test('read({ mode: ReadMode.FULL }) retorna todos os campos do banco sem lançar', () => {
      const cnabFile = openCnabFromLines(stringToLines(loadFixture(path)))
      const result = cnabFile.read({ mode: ReadMode.FULL })

      expect(result.bills.length).toBeGreaterThan(0)
      result.bills.forEach((bill) => {
        expect(bill).not.toBeNull()
        expect(typeof bill).toBe('object')
      })
    })

    test('read({ lazy: true }).resolve() produz o mesmo resultado que o modo eager', async () => {
      const cnabFile = openCnabFromLines(stringToLines(loadFixture(path)))
      const eager = cnabFile.read()
      const lazy = cnabFile.read({ lazy: true })

      expect(lazy.bills.length).toBe(eager.bills.length)

      const resolved = await Promise.all(lazy.bills.map((item) => item.resolve()))
      expect(resolved).toEqual(eager.bills)
    })

    test('readAsync() (eager) produz o mesmo resultado que read()', async () => {
      const cnabFile = openCnabFromLines(stringToLines(loadFixture(path)))
      const sync = cnabFile.read()
      const asyncResult = await cnabFile.readAsync()

      expect(asyncResult).toEqual(sync)
    })

    test('readAsync({ lazy: true }).resolve() produz o mesmo resultado que o modo eager', async () => {
      const cnabFile = openCnabFromLines(stringToLines(loadFixture(path)))
      const eager = cnabFile.read()
      const lazy = await cnabFile.readAsync({ lazy: true })

      expect(lazy.bills.length).toBe(eager.bills.length)

      const resolved = await Promise.all(lazy.bills.map((item) => item.resolve()))
      expect(resolved).toEqual(eager.bills)
    })

    test('validate() não lança e não reporta erros além de "Data de vencimento"', () => {
      const cnabFile = openCnabFromLines(stringToLines(loadFixture(path)))
      const result = cnabFile.validate(true)

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
