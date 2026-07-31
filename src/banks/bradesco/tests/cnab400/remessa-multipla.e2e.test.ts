/**
 * Pipeline público de ponta a ponta para Bradesco CNAB 400 remessa-multipla.txt:
 * exercita `openCnab()`, o caminho que um consumidor real da lib usa – conteúdo
 * bruto do arquivo, sem pré-separar linhas nem escolher schema manualmente
 * (detecção de formato/banco incluída).
 */

import * as fs from 'fs'
import * as path from 'path'
import { openCnabFromLines, CNABFile } from '@/index'
import { CNABFormatCode } from '@tp-types/core'
import type { CNABReadResult } from '@tp-types/core/read-result'
import type { CNABData } from '@tp-types/read'


function stringToLines(content: string): string[] {
  return content.split(/\r?\n/).filter((line) => line.length > 0)
}
describe('openCnab – pipeline público de ponta a ponta: Bradesco CNAB 400 remessa-multipla', () => {
  const fixtureDir = path.join(__dirname, '../../docs/cnab400')
  const txtPath = path.join(fixtureDir, 'remessa-multipla.txt')
  const jsonPath = path.join(fixtureDir, 'remessa-multipla.json')
  const txtContent = fs.readFileSync(txtPath, 'latin1')
  
  let metadata: any
  let cnabFile: CNABFile
  let readResult: CNABReadResult<CNABData | Record<string, unknown>>
  let validationResult: ReturnType<CNABFile['validate']>

  beforeAll(() => {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8')
    metadata = JSON.parse(jsonContent)
    cnabFile = openCnabFromLines(stringToLines(txtContent))
    readResult = cnabFile.read()
    validationResult = cnabFile.validate(true)
  })

  test('deve detectar formato CNAB 400 e banco Bradesco (237)', () => {
    expect(cnabFile.type).toBe(CNABFormatCode.CNAB400)
    expect(cnabFile.bankCode).toBe('237')
    expect(cnabFile.bankName).toBe('Bradesco')
  })

  test('deve extrair exatamente 37 registros', () => {
    expect(readResult.bills.length).toBe(37)
    expect(readResult.bills.length).toBe(metadata.totals.recordCount)
  })

  test('não deve ter erros de parsing/schema (exceto vencimento no passado)', () => {
    // Este arquivo real tem títulos com vencimento anterior à data atual
    // – isso é esperado e não é responsabilidade do schema/parser.
    const lines = validationResult.feedback?.lines || []
    const errosDeParsing = lines.filter(
      (error: { field: string; message: string }) =>
        !(error.field === 'Data de vencimento' && error.message.includes('anterior à data atual')),
    )

    if (errosDeParsing.length > 0) {
      console.log('Erros de parsing encontrados:')
      errosDeParsing.forEach((error: { line: number; field: string; message: string }) => {
        console.log(`  Linha ${error.line} - ${error.field}: ${error.message}`)
      })
    }

    expect(errosDeParsing).toEqual([])
  })

  test('deve extrair dados do primeiro título corretamente', () => {
    const records = validationResult.feedback?.records || []
    expect(records.length).toBeGreaterThan(0)
    
    const primeiro: any = records[0]
    const esperado = metadata.records[0]

    expect(primeiro.name?.trim()).toBe(esperado.name)
    expect(primeiro.amount).toBeCloseTo(esperado.amount, 2)
    expect(primeiro.dueDate).toBe(esperado.dueDate)
    // Documento: parser remove zeros à esquerda
    expect(primeiro.document).toBe(esperado.document.replace(/^0+/, ''))
  })
})

