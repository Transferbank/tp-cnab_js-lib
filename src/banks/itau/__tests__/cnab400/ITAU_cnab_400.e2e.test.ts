/**
 * Pipeline público de ponta a ponta para ITAU_cnab_400.REM: exercita
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
import type { CNABReadResult } from '@tp-types/core/read-result'
import type { CNABData } from '@tp-types/read'

// Tipos locais para metadata
interface FixtureMetadata {
  totals: {
    recordCount: number
    totalAmount: number
  }
  records: Array<{
    name: string
    amount: number
    dueDate: string
    document: string
  }>
}

describe('openCnab – pipeline público de ponta a ponta: ITAU_cnab_400.REM', () => {
  const fixtureDir = path.join(__dirname, '../../__fixtures__/cnab400')
  const txtPath = path.join(fixtureDir, 'ITAU_cnab_400.REM')
  const jsonPath = path.join(fixtureDir, 'ITAU_cnab_400.json')
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
    validationResult = cnabFile.validate({ withFeedback: true })
  })

  test('deve detectar formato CNAB 400 e banco Itaú (341)', () => {
    expect(cnabFile.type).toBe(CNABFormatCode.CNAB400)
    expect(cnabFile.bankCode).toBe('341')
    expect(cnabFile.bankName).toBe('Itaú')
  })

  test('deve extrair um registro por título (319)', () => {
    expect(readResult.bills.length).toBe(metadata.totals.recordCount)
    expect(readResult.bills.length).toBe(319)
  })

  test('não deve ter erros críticos de parsing/schema', () => {
    // Filtra apenas erros críticos (não avisos de vencimento no passado que são regras de negócio)
    const lines = validationResult.feedback?.lines || []
    const errosCriticos = lines.filter(
      (error) => !(error.field === 'Data de vencimento' && error.message.includes('anterior à data atual'))
    )

    if (errosCriticos.length > 0) {
      console.log('Erros críticos encontrados:')
      errosCriticos.forEach((error) => {
        console.log(`  Linha ${error.line}: ${error.field} - ${error.message}`)
      })
    }

    expect(errosCriticos).toEqual([])
  })

  test('deve extrair os dados do primeiro título batendo com os metadados', () => {
    const records = validationResult.feedback?.records || []
    expect(records.length).toBeGreaterThan(0)

    const primeiro = records[0]
    const esperado = metadata.records[0]

    expect(primeiro.name?.trim()).toContain(esperado.name)
    expect(primeiro.amount).toBe(esperado.amount)
    expect(primeiro.dueDate).toBe(esperado.dueDate)
    expect(primeiro.document).toBe(esperado.document)
  })

  test('deve extrair os dados do último título batendo com os metadados', () => {
    const records = validationResult.feedback?.records || []
    const ultimo = records[records.length - 1]
    const esperado = metadata.records[metadata.records.length - 1]

    expect(ultimo.name?.trim()).toContain(esperado.name)
    expect(ultimo.amount).toBe(esperado.amount)
    expect(ultimo.dueDate).toBe(esperado.dueDate)
    expect(ultimo.document).toBe(esperado.document)
  })

  test('soma total dos valores deve bater com metadados (R$ 1.237.856,15)', () => {
    const records = validationResult.feedback?.records || []
    const somaTotal = records.reduce((sum, record) => sum + (record.amount || 0), 0)
    expect(somaTotal).toBeCloseTo(1237856.15, 2)
    expect(somaTotal).toBeCloseTo(metadata.totals.totalAmount, 2)
  })
})
