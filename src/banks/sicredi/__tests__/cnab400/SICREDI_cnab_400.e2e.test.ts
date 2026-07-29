/**
 * Pipeline público de ponta a ponta para SICREDI_cnab_400.CRM: exercita
 * `openCnab()`, o caminho que um consumidor real da lib usa – conteúdo
 * bruto do arquivo, sem pré-separar linhas nem escolher schema manualmente
 * (detecção de formato/banco incluída).
 *
 * Validação do conteúdo do metadata.json em si fica em `.test.ts`.
 * Parsing das linhas brutas com os schemas TS fica em `.integrity.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { openCnab, CNABFile } from '../../../../index'
import { CNABFormatCode, ValidationError, CNABRecord } from '../../../../types'
import type { FixtureMetadata } from '@tp-types/testing'
import type { CNABReadResult } from '../../../../types/core/read-result'
import type { CNABData } from '../../../../types/read'

describe('openCnab – pipeline público de ponta a ponta: SICREDI_cnab_400.CRM', () => {
  const fixtureDir = path.join(__dirname, '../../__fixtures__/cnab400')
  const txtPath = path.join(fixtureDir, 'SICREDI_cnab_400.CRM')
  const jsonPath = path.join(fixtureDir, 'SICREDI_cnab_400.json')
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

  test('deve detectar formato CNAB 400 e banco Sicredi (748)', () => {
    expect(cnabFile.type).toBe(CNABFormatCode.CNAB400)
    expect(cnabFile.bankCode).toBe('748')
    expect(cnabFile.bankName).toBe('Sicredi')
  })

  test('deve extrair exatamente 43 registros', () => {
    expect(readResult.bills.length).toBe(43)
    expect(readResult.bills.length).toBe(metadata.totals.recordCount)
  })

  test('não deve ter erros de parsing/schema (exceto vencimento no passado)', () => {
    // Este arquivo real tem títulos com vencimento anterior à data atual
    // (arquivo gerado em 27/06/2026, mas estamos em 29/07/2026) – isso é
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

  test('deve detectar todos os títulos como CNPJ', () => {
    // Esta fixture só tem CNPJs (confirmado em metadata.records[].documentType, ver .test.ts).
    // Nota: documentType não está disponível no tipo CNABRecord da API pública, então
    // comparamos contra o documentRaw do metadata (sempre 14 dígitos, com zeros à esquerda)
    // em vez de assumir um tamanho fixo – o parser público remove os zeros à esquerda.
    const records = validationResult.feedback?.records || []
    
    records.forEach((record: CNABRecord, index: number) => {
      const documentoEsperado = metadata.records[index].documentRaw!.replace(/^0+/, '')
      expect(record.document).toBe(documentoEsperado)
      expect(record.document.length).toBeGreaterThanOrEqual(11) // CNPJ nunca fica menor que CPF mesmo sem zeros
    })
  })

  test('valores extraídos devem bater com os valores esperados', () => {
    const records = validationResult.feedback?.records || []
    
    // Verificar alguns valores específicos
    expect(records[0].amount).toBeCloseTo(660.14, 2)
    expect(records[1].amount).toBeCloseTo(659.93, 2)
    expect(records[2].amount).toBeCloseTo(659.93, 2)
    expect(records[3].amount).toBeCloseTo(232.47, 2)
  })

  test('datas de vencimento devem estar formatadas corretamente', () => {
    const records = validationResult.feedback?.records || []
    
    // Verificar alguns vencimentos específicos
    expect(records[0].dueDate).toBe('29/03/2026')
    expect(records[1].dueDate).toBe('28/04/2026')
    expect(records[2].dueDate).toBe('28/05/2026')
    expect(records[3].dueDate).toBe('29/03/2026')
  })

  test('endereços devem estar extraídos corretamente', () => {
    const records = validationResult.feedback?.records || []
    
    // Verificar alguns endereços específicos
    // Nota: zipCode não está disponível no tipo CNABRecord da API pública
    expect(records[0].address).toContain('AV EXEMPLO,100')
    expect(records[3].address).toContain('RUA EXEMPLO,113')
    expect(records[9].address).toContain('RUA EXEMPLO,126')
  })
})
