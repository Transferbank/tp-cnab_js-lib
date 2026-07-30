/**
 * Pipeline p?blico de ponta a ponta para BANCOBRASIL_cnab_400.REM: exercita
 * `validateCnabFile()`, o caminho que um consumidor real da lib usa ? conte?do
 * bruto do arquivo, sem pr?-separar linhas nem escolher schema manualmente
 * (detec??o de formato/banco inclu?da).
 *
 * Valida??o do conte?do do metadata.json em si fica em `.test.ts`.
 * Parsing das linhas brutas com os schemas TS fica em `.integrity.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { openCnab, CNABFile } from '@/index'
import { CNABFormatCode, ValidationError, CNABRecord } from '@tp-types/core'
import type { FixtureMetadata } from '@tp-types/testing'
import type { CNABReadResult } from '@tp-types/core/read-result'
import type { CNABData } from '@tp-types/read'

describe('openCnab – pipeline público de ponta a ponta: BANCOBRASIL_cnab_400.REM', () => {
  const fixtureDir = path.join(__dirname, '../docs')
  const txtPath = path.join(fixtureDir, 'BANCOBRASIL_cnab_400.REM')
  const jsonPath = path.join(fixtureDir, 'BANCOBRASIL_cnab_400.json')
  const txtContent = fs.readFileSync(txtPath, 'latin1')

  let metadata: FixtureMetadata
  let cnabFile: CNABFile
  let readResult: CNABReadResult<CNABData | Record<string, unknown>>
  let validationResult: { isValid: boolean; feedback?: { lines?: ValidationError[]; records?: CNABRecord[] } }

  beforeAll(() => {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8')
    metadata = JSON.parse(jsonContent) as FixtureMetadata
    cnabFile = openCnab(txtContent)
    readResult = cnabFile.read()
    validationResult = cnabFile.validate(true)
  })

  test('deve detectar formato CNAB 400 e banco Banco do Brasil (001)', () => {
    expect(cnabFile.type).toBe(CNABFormatCode.CNAB400)
    expect(cnabFile.bankCode).toBe('001')
    expect(cnabFile.bankName).toBe('Banco do Brasil')
  })

  test('deve extrair exatamente 113 registros', () => {
    expect(readResult.bills.length).toBe(113)
    expect(readResult.bills.length).toBe(metadata.totals.recordCount)
  })

  test('não deve ter erros de parsing/schema (exceto vencimento no passado)', () => {
    // Este arquivo real tem títulos com vencimento anterior à data atual
    // (arquivo gerado em 26/05/2026, mas estamos em 09/07/2026) – isso é
    // esperado e não é responsabilidade do schema/parser.
    const lines = validationResult.feedback?.lines || []
    const errosDeParsing = lines.filter(
      (error) =>
        !(error.field === 'Data de vencimento' && error.message.includes('anterior à data atual')),
    )

    if (errosDeParsing.length > 0) {
      console.log('Erros de parsing encontrados:')
      errosDeParsing.forEach((error) => {
        console.log(`  Linha ${error.line} - ${error.field}: ${error.message}`)
      })
    }

    expect(errosDeParsing).toEqual([])
  })

  test('deve extrair dados do primeiro título corretamente', () => {
    const records = validationResult.feedback?.records || []
    expect(records.length).toBeGreaterThan(0)
    
    const primeiro = records[0]
    const esperado = metadata.records[0]

    expect(primeiro.name?.trim()).toBe(esperado.name)
    expect(primeiro.amount).toBeCloseTo(esperado.amount, 2)
    expect(primeiro.dueDate).toBe(esperado.dueDate)
    // Documento: parser remove zeros à esquerda
    expect(primeiro.document).toBe(esperado.document.replace(/^0+/, ''))
  })
})

