/**
 * Testes de Metadados - Bradesco CNAB 240
 * 
 * Valida informações básicas do schema: código do banco, nome e schemas obrigatórios.
 */

import { bradescoCnab240 } from '../../../../../src/banks/bradesco/schemas/cnab240'

describe('Schema Bradesco CNAB 240 - Metadados', () => {
  test('deve ter código do banco correto (237)', () => {
    expect(bradescoCnab240.bankCode).toBe('237')
  })

  test('deve ter nome do banco correto', () => {
    expect(bradescoCnab240.bankName).toBe('Bradesco')
  })

  test('deve ter todos os schemas obrigatórios', () => {
    expect(bradescoCnab240.headerArquivo).toBeDefined()
    expect(bradescoCnab240.segmentoP).toBeDefined()
    expect(bradescoCnab240.segmentoQ).toBeDefined()
    expect(bradescoCnab240.trailerArquivo).toBeDefined()
  })

  test('deve ter schemas opcionais implementados', () => {
    expect(bradescoCnab240.headerLote).toBeDefined()
    expect(bradescoCnab240.trailerLote).toBeDefined()
    
    // Segmentos opcionais agora em optionalRecords
    expect(bradescoCnab240.optionalRecords).toBeDefined()
    expect(bradescoCnab240.optionalRecords).toHaveLength(5)
    
    const identifiers = bradescoCnab240.optionalRecords?.map(r => r.identifier) ?? []
    expect(identifiers).toContain('R')
    expect(identifiers).toContain('S')
    expect(identifiers).toContain('Y01')
    expect(identifiers).toContain('Y04')
    expect(identifiers).toContain('Y50')
  })
})
