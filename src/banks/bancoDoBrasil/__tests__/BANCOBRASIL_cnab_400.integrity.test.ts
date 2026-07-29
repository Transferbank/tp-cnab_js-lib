/**
 * Validação de integridade: schemas TypeScript conseguem parsear arquivo real do BB
 */

import * as fs from 'fs'
import * as path from 'path'
import { openCnab } from '@/index'
import { BANK_CODES, CNABFormatCode, ValidationError } from '@tp-types/index'

describe('Integridade: Schemas × Fixture BB CNAB 400', () => {
  const fixtureDir = path.join(__dirname, '../__fixtures__')
  const txtPath = path.join(fixtureDir, 'BANCOBRASIL_cnab_400.REM')
  const txtContent = fs.readFileSync(txtPath, 'latin1')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  test('deve abrir arquivo e detectar banco/formato corretamente', () => {
    const cnabFile = openCnab(txtContent)
    
    expect(cnabFile.type).toBe(CNABFormatCode.CNAB400)
    expect(cnabFile.bankCode).toBe(BANK_CODES.BANCO_DO_BRASIL)
    expect(cnabFile.bankName).toBe('Banco do Brasil')
  })

  test('schemas devem parsear arquivo sem erros estruturais', () => {
    const cnabFile = openCnab(txtContent)
    const validationResult = cnabFile.validate({ withFeedback: true })
    
    // Filtrar apenas erros estruturais (não de negócio como vencimento no passado)
    const allErrors = validationResult.feedback?.lines as ValidationError[] || []
    const structuralErrors = allErrors.filter(
      (error) => 
        !error.message.includes('anterior à data atual') &&
        !error.message.includes('vencimento')
    )

    if (structuralErrors.length > 0) {
      console.log('Erros estruturais encontrados:')
      structuralErrors.forEach((error) => {
        console.log(`  Linha ${error.line}: ${error.message}`)
      })
    }

    expect(structuralErrors).toHaveLength(0)
  })

  test('deve extrair 113 títulos corretamente', () => {
    const cnabFile = openCnab(txtContent)
    const readResult = cnabFile.read()
    
    expect(readResult.bills.length).toBe(113)
  })

  test('arquivo deve ter padrão BB: detalhe tipo 7 + multa tipo 5 intercalados', () => {
    // BB específico: cada título (tipo 7) seguido de multa (tipo 5)
    const tipo7Count = lines.filter((line) => line[0] === '7').length
    const tipo5Count = lines.filter((line) => line[0] === '5').length

    expect(tipo7Count).toBe(113)
    expect(tipo5Count).toBe(113)
    expect(tipo7Count).toBe(tipo5Count)
  })

  test('todas as linhas devem ter exatamente 400 caracteres', () => {
    lines.forEach((line) => {
      expect(line.length).toBe(400)
    })
  })
})
