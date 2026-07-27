/**
 * Pipeline público de ponta a ponta para ITAU_cnab_400.REM: exercita
 * `validateCnabFile()`, o caminho que um consumidor real da lib usa — conteúdo
 * bruto do arquivo, sem pré-separar linhas nem escolher schema manualmente
 * (detecção de formato/banco incluída).
 *
 * Validação do conteúdo do metadata.json em si fica em `.test.ts`.
 * Parsing das linhas brutas com os schemas TS fica em `.integrity.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { validateCnabFile } from '../../../../src'
import { loadFixtureMetadata } from '../../../helpers/fixture-metadata'

describe('validateCnabFile — pipeline público de ponta a ponta: ITAU_cnab_400.REM', () => {
  const fixtureDir = path.join(__dirname)
  const txtPath = path.join(fixtureDir, 'ITAU_cnab_400.REM')
  const txtContent = fs.readFileSync(txtPath, 'utf-8')

  let metadata: ReturnType<typeof loadFixtureMetadata>
  let result: ReturnType<typeof validateCnabFile>

  beforeAll(() => {
    metadata = loadFixtureMetadata('itau', 'ITAU_cnab_400', 'cnab400')
    result = validateCnabFile(txtContent)
  })

  test('deve detectar formato CNAB 400 e banco Itaú (341)', () => {
    expect(result.format).toBe('CNAB 400')
    expect(result.bank).toEqual({ code: '341', name: 'Itaú' })
  })

  test('deve extrair um registro por título (319)', () => {
    expect(result.totalRecords).toBe(metadata.totals.recordCount)
    expect(result.totalRecords).toBe(319)
  })

  test('não deve ter erros críticos de parsing/schema', () => {
    // Filtra apenas erros críticos (não avisos de vencimento no passado que são regras de negócio)
    const errosCriticos = result.errors.filter(
      (error) => !(error.column === 'Data de vencimento' && error.message.includes('anterior à data atual'))
    )

    if (errosCriticos.length > 0) {
      console.log('Erros críticos encontrados:')
      errosCriticos.forEach((error) => {
        console.log(`  Linha ${error.line}, ${error.column}: ${error.message}`)
      })
    }

    expect(errosCriticos).toEqual([])
  })

  test('deve extrair os dados do primeiro título batendo com os metadados', () => {
    const primeiro = result.records[0]
    const esperado = metadata.records[0]

    expect(primeiro.name).toContain(esperado.name)
    expect(primeiro.amount).toBe(esperado.amount)
    expect(primeiro.dueDate).toBe(esperado.dueDate)
    expect(primeiro.document).toBe(esperado.document)
  })

  test('deve extrair os dados do último título batendo com os metadados', () => {
    const ultimo = result.records[result.records.length - 1]
    const esperado = metadata.records[metadata.records.length - 1]

    expect(ultimo.name).toContain(esperado.name)
    expect(ultimo.amount).toBe(esperado.amount)
    expect(ultimo.dueDate).toBe(esperado.dueDate)
    expect(ultimo.document).toBe(esperado.document)
  })

  test('soma total dos valores deve bater com metadados (R$ 1.237.856,15)', () => {
    const somaTotal = result.records.reduce((sum, record) => sum + record.amount, 0)
    expect(somaTotal).toBeCloseTo(1237856.15, 2)
    expect(somaTotal).toBeCloseTo(metadata.totals.totalAmount, 2)
  })
})
