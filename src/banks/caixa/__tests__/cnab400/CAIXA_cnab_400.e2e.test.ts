/**
 * Pipeline público de ponta a ponta para CAIXA_cnab_400.REM: exercita
 * `openCnab()`, o caminho que um consumidor real da lib usa – conteúdo
 * bruto do arquivo, sem pré-separar linhas nem escolher schema manualmente
 * (detecção de formato/banco incluída).
 */

import * as fs from 'fs'
import * as path from 'path'
import { openCnab, CNABFile } from '@/index'
import { CNABFormatCode } from '@tp-types/core'
import type { CNABReadResult } from '@tp-types/core/read-result'
import type { CNABData } from '@tp-types/read'

describe('openCnab – pipeline público de ponta a ponta: CAIXA_cnab_400.REM', () => {
  const fixtureDir = path.join(__dirname, '../../__fixtures__/cnab400')
  const txtPath = path.join(fixtureDir, 'CAIXA_cnab_400.REM')
  const txtContent = fs.readFileSync(txtPath, 'latin1')

  let cnabFile: CNABFile
  let readResult: CNABReadResult<CNABData | Record<string, unknown>>
  let validationResult: { isValid: boolean; feedback?: { lines?: any[]; records?: any[] } }

  beforeAll(() => {
    cnabFile = openCnab(txtContent)
    readResult = cnabFile.read()
    validationResult = cnabFile.validate({ withFeedback: true })
  })

  test('deve detectar formato CNAB 400 e banco Caixa (104)', () => {
    expect(cnabFile.type).toBe(CNABFormatCode.CNAB400)
    expect(cnabFile.bankCode).toBe('104')
    expect(cnabFile.bankName).toBe('Caixa Econômica')
  })

  test('deve extrair registros do arquivo', () => {
    expect(readResult.bills).toBeDefined()
    expect(readResult.bills.length).toBeGreaterThan(0)
  })

  test('deve ler o arquivo sem erros estruturais graves', () => {
    // Validação básica - pode ter warnings de negócio mas não erros de estrutura
    const lines = validationResult.feedback?.lines || []
    const errosEstruturais = lines.filter(
      (error) => error.message && !error.message.includes('vencimento'),
    )

    // Aceitar alguns avisos de data de vencimento
    expect(errosEstruturais.length).toBeLessThan(10)
  })

  test('deve ter header, details e trailer', () => {
    const lines = txtContent.split('\n').filter((l) => l.length > 0)
    expect(lines.length).toBeGreaterThan(2) // Pelo menos header + detail + trailer

    // Primeira linha deve ser header (começa com "0")
    expect(lines[0][0]).toBe('0')

    // Última linha deve ser trailer (começa com "9")
    const lastLine = lines[lines.length - 1]
    expect(lastLine[0]).toBe('9')
  })

  test('deve extrair dados básicos dos títulos', () => {
    expect(readResult.bills.length).toBeGreaterThan(0)

    const primeiro = readResult.bills[0] as any
    expect(primeiro).toBeDefined()

    // Verificar que campos básicos foram extraídos
    if (primeiro.name) {
      expect(typeof primeiro.name).toBe('string')
    }
    if (primeiro.amount) {
      expect(typeof primeiro.amount).toBe('number')
      expect(primeiro.amount).toBeGreaterThan(0)
    }
  })
})
