/**
 * Pipeline público de ponta a ponta para SANTANDER_cnab_400_140.REM: exercita
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
import { CNABFormatCode } from '@tp-types/index'

describe('validateCnabFile — pipeline público de ponta a ponta: SANTANDER_cnab_400_140.REM', () => {
  const fixtureDir = path.join(__dirname)
  const txtPath = path.join(fixtureDir, 'SANTANDER_cnab_400_140.REM')
  const txtContent = fs.readFileSync(txtPath, 'latin1')

  let metadata: ReturnType<typeof loadFixtureMetadata>
  let result: ReturnType<typeof validateCnabFile>

  beforeAll(() => {
    metadata = loadFixtureMetadata('santander', 'SANTANDER_cnab_400_140', CNABFormatCode.CNAB400)
    result = validateCnabFile(txtContent)
  })

  test('deve detectar formato CNAB 400 e banco Santander (033)', () => {
    expect(result.format).toBe('CNAB 400')
    expect(result.bank).toEqual({ code: '033', name: 'Santander' })
  })

  test('deve extrair exatamente 128 registros', () => {
    expect(result.totalRecords).toBe(128)
    expect(result.totalRecords).toBe(metadata.totals.recordCount)
  })

  test('não deve ter erros de parsing/schema (exceto vencimento no passado)', () => {
    // Este arquivo real tem títulos com vencimento anterior à data atual (arquivo
    // gerado em 25/05/2026, mas estamos em 09/07/2026) — isso é esperado e não é
    // responsabilidade do schema/parser. Qualquer outro erro (posição errada, campo
    // obrigatório vazio, tipo inválido) ainda deve ser zero aqui.
    const errosDeParsing = result.errors.filter(
      (error) =>
        !(error.field === 'Data de vencimento' && error.message.includes('anterior à data atual')),
    )

    if (errosDeParsing.length > 0) {
      console.log('Erros de parsing encontrados:')
      errosDeParsing.forEach((error) => {
        console.log(`  Linha ${error.line} - ${error.column}: ${error.message}`)
      })
    }

    expect(errosDeParsing).toEqual([])
  })

  test('deve extrair os dados do primeiro título batendo com os metadados', () => {
    const primeiro = result.records[0]
    const esperado = metadata.records[0]

    expect(primeiro.name.trim()).toBe(esperado.name)
    expect(primeiro.amount).toBeCloseTo(esperado.amount, 2)
    expect(primeiro.dueDate).toBe(esperado.dueDate)
    expect(primeiro.document).toBe(esperado.document.replace(/^0+/, ''))
  })

  test('deve extrair os dados de todos os títulos batendo com os metadados', () => {
    expect(result.records.length).toBe(metadata.records.length)

    result.records.forEach((record, index) => {
      const esperado = metadata.records[index]

      expect(record.name.trim()).toBe(esperado.name)
      expect(record.amount).toBeCloseTo(esperado.amount, 2)
      expect(record.dueDate).toBe(esperado.dueDate)
      // Documento: o parser remove zeros à esquerda, mas o metadata pode tê-los
      expect(record.document).toBe(esperado.document.replace(/^0+/, ''))
    })
  })
})
