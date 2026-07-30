/**
 * Pipeline público de ponta a ponta para SANTANDER_cnab_400_140.REM: exercita
 * `openCnab()`, o caminho que um consumidor real da lib usa – conteúdo
 * bruto do arquivo, sem pré-separar linhas nem escolher schema manualmente
 * (detecção de formato/banco incluída).
 *
 * Validação do conteúdo do metadata.json em si fica em `.test.ts`.
 * Parsing das linhas brutas com os schemas TS fica em `.integrity.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { openCnab, CNABFile } from '@/index'
import { CNABFormatCode, ValidationError, CNABRecord } from '@tp-types/core'
import type { FixtureMetadata } from '@tp-types/testing'
import type { CNABReadResult } from '@tp-types/core/read-result'
import type { CNABData } from '@tp-types/read'

describe('openCnab – pipeline público de ponta a ponta: SANTANDER_cnab_400_140.REM', () => {
  const fixtureDir = path.join(__dirname, '../../docs/cnab400')
  const txtPath = path.join(fixtureDir, 'SANTANDER_cnab_400_140.REM')
  const jsonPath = path.join(fixtureDir, 'SANTANDER_cnab_400_140.json')
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

  test('deve detectar formato CNAB 400 e banco Santander (033)', () => {
    expect(cnabFile.type).toBe(CNABFormatCode.CNAB400)
    expect(cnabFile.bankCode).toBe('033')
    expect(cnabFile.bankName).toBe('Santander')
  })

  test('deve extrair exatamente 128 registros', () => {
    expect(readResult.bills.length).toBe(128)
    expect(readResult.bills.length).toBe(metadata.totals.recordCount)
  })

  test('não deve ter erros de parsing/schema (exceto vencimento no passado)', () => {
    // Este arquivo real tem títulos com vencimento anterior à data atual
    // (arquivo gerado em 25/05/2026, mas estamos em 09/07/2026) – isso é
    // esperado e não é responsabilidade do schema/parser.
    const lines = validationResult.feedback?.lines || []
    const errosDeParsing = lines.filter(
      (error: ValidationError) =>
        !(error.field === 'Data de vencimento' && error.message.includes('anterior à data atual')),
    )

    if (errosDeParsing.length > 0) {
      console.log('Erros de parsing encontrados:')
      errosDeParsing.forEach((error: ValidationError) => {
        console.log(`  Linha ${error.line}: ${error.message}`)
      })
    }

    expect(errosDeParsing).toEqual([])
  })

  test('deve extrair os dados do primeiro título batendo com os metadados', () => {
    const records = validationResult.feedback?.records || []
    expect(records.length).toBeGreaterThan(0)
    
    const primeiro = records[0]
    const esperado = metadata.records[0]

    expect(primeiro.name?.trim()).toBe(esperado.name)
    expect(primeiro.amount).toBeCloseTo(esperado.amount, 2)
    expect(primeiro.dueDate).toBe(esperado.dueDate)
    expect(primeiro.document).toBe(esperado.document.replace(/^0+/, ''))
  })

  test('deve extrair os dados de todos os títulos batendo com os metadados', () => {
    const records = validationResult.feedback?.records || []
    expect(records.length).toBe(metadata.records.length)

    records.forEach((record: CNABRecord, index: number) => {
      const esperado = metadata.records[index]

      expect(record.name?.trim()).toBe(esperado.name)
      expect(record.amount).toBeCloseTo(esperado.amount, 2)
      expect(record.dueDate).toBe(esperado.dueDate)
      // Documento: o parser remove zeros à esquerda
      expect(record.document).toBe(esperado.document.replace(/^0+/, ''))
    })
  })
})

