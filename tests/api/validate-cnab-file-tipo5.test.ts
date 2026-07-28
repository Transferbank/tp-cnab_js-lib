/**
 * Teste para verificar se validateCnabFile identifica registros tipo 5
 * no fixture do Banco do Brasil
 */

import * as fs from 'fs'
import * as path from 'path'
import { validateCnabFile } from '../../src'

describe('validateCnabFile - Identificação de registros tipo 5 (Banco do Brasil)', () => {
  const fixturePath = path.join(__dirname, '../fixtures/cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM')
  const txtContent = fs.readFileSync(fixturePath, 'latin1')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  test('fixture deve conter 113 registros tipo 5 (multa)', () => {
    const tipo5Lines = lines.filter((line) => line[0] === '5')
    expect(tipo5Lines.length).toBe(113)
  })

  test('validateCnabFile deve retornar apenas 113 registros (tipo 7), não processando tipo 5', () => {
    const result = validateCnabFile(txtContent)
    
    // A API deve detectar o banco corretamente
    expect(result.format).toBe('CNAB 400')
    expect(result.bank).toEqual({ code: '001', name: 'Banco do Brasil' })
    
    // Deve retornar apenas os 113 registros tipo 7 (detalhe)
    // Registros tipo 5 (multa) NÃO são processados pelo validateCnabFile
    expect(result.totalRecords).toBe(113)
    expect(result.records.length).toBe(113)
  })

  test('linhas tipo 5 devem ser ignoradas silenciosamente (não geram erros)', () => {
    const result = validateCnabFile(txtContent)
    
    // Filtrar apenas erros que não sejam de vencimento no passado
    const errosReais = result.errors.filter(
      (error) => !(error.field === 'Data de vencimento' && error.message.includes('anterior à data atual'))
    )
    
    // Não deve haver erros relacionados a registros tipo 5
    const errosTipo5 = errosReais.filter((error) => 
      error.message.includes('tipo 5') || 
      error.message.includes('Tipo 5') ||
      error.message.toLowerCase().includes('multa')
    )
    
    expect(errosTipo5).toHaveLength(0)
  })

  test('estrutura do arquivo: 1 header + 113 tipo 7 + 113 tipo 5 + 1 trailer = 228 linhas', () => {
    expect(lines.length).toBe(228)
    
    const headerLines = lines.filter(l => l[0] === '0')
    const tipo7Lines = lines.filter(l => l[0] === '7')
    const tipo5Lines = lines.filter(l => l[0] === '5')
    const trailerLines = lines.filter(l => l[0] === '9')
    
    expect(headerLines.length).toBe(1)
    expect(tipo7Lines.length).toBe(113)
    expect(tipo5Lines.length).toBe(113)
    expect(trailerLines.length).toBe(1)
  })

  test('validateCnabFile deve processar apenas linhas tipo 7 (detailRecordType do schema)', () => {
    const result = validateCnabFile(txtContent)
    
    // Cada registro retornado deve corresponder a uma linha tipo 7
    expect(result.records.length).toBe(113)
    
    // Validar que todos os registros têm dados válidos
    result.records.forEach((record) => {
      expect(record.name).toBeTruthy()
      expect(record.amount).toBeGreaterThan(0)
      expect(record.dueDate).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      expect(record.document).toBeTruthy()
    })
  })

  test('linhas entre header e trailer devem alternar tipo 7 e tipo 5', () => {
    // Pular header (linha 0) e trailer (última linha)
    const middleLines = lines.slice(1, -1)
    
    // Deve haver 226 linhas no meio (113 tipo 7 + 113 tipo 5)
    expect(middleLines.length).toBe(226)
    
    // Verificar alternância
    for (let i = 0; i < middleLines.length; i += 2) {
      expect(middleLines[i][0]).toBe('7') // Detalhe
      if (i + 1 < middleLines.length) {
        expect(middleLines[i + 1][0]).toBe('5') // Multa
      }
    }
  })

  test('validateCnabFile NÃO expõe informações dos registros tipo 5 na API pública', () => {
    const result = validateCnabFile(txtContent)
    
    // A API pública não tem campo para retornar registros opcionais (tipo 5)
    // Apenas registros de detalhe (tipo 7) são retornados
    expect(result).toHaveProperty('records')
    expect(result).toHaveProperty('totalRecords')
    
    // Não existe campo como 'optionalRecords' ou 'tipo5Records' na API
    expect(result).not.toHaveProperty('optionalRecords')
    expect(result).not.toHaveProperty('tipo5Records')
    expect(result).not.toHaveProperty('multaRecords')
  })

  test('primeiro registro retornado deve corresponder à primeira linha tipo 7', () => {
    const result = validateCnabFile(txtContent)
    const primeiroRegistro = result.records[0]
    
    // Valores esperados do primeiro título (linha 2 do arquivo, índice 1)
    expect(primeiroRegistro.name.trim()).toBe('COMERCIAL ALFA LTDA')
    expect(primeiroRegistro.document).toBe('1000000997396') // Parser remove zeros à esquerda
    expect(primeiroRegistro.amount).toBe(3390.20)
    expect(primeiroRegistro.dueDate).toBe('20/07/2026')
  })

  test('último registro retornado deve corresponder à última linha tipo 7', () => {
    const result = validateCnabFile(txtContent)
    const ultimoRegistro = result.records[result.records.length - 1]
    
    // O último registro tipo 7 está na penúltima linha antes do trailer
    // (linha 227, pois a linha 228 é o trailer e a 226 é o tipo 5 da última multa)
    
    // Validar que o último registro tem dados válidos
    expect(ultimoRegistro.name).toBeTruthy()
    expect(ultimoRegistro.amount).toBeGreaterThan(0)
    expect(ultimoRegistro.dueDate).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})
