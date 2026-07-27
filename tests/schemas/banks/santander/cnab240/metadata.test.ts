/**
 * Testes de Metadados - Santander CNAB 240
 * 
 * Valida informações básicas do schema e schemas implementados.
 * Atualizado para incluir novos segmentos (Y-03, Y-53, S).
 */

import { santanderCnab240 } from '../../../../../src/banks/santander/schemas/cnab240'

describe('Schema Santander CNAB 240 - Metadados', () => {
  test('deve ter código do banco correto (033)', () => {
    expect(santanderCnab240.bankCode).toBe('033')
  })

  test('deve ter nome do banco correto', () => {
    expect(santanderCnab240.bankName).toBe('Santander')
  })

  test('deve ter todos os schemas obrigatórios', () => {
    expect(santanderCnab240.headerArquivo).toBeDefined()
    expect(santanderCnab240.segmentoP).toBeDefined()
    expect(santanderCnab240.segmentoQ).toBeDefined()
    expect(santanderCnab240.trailerArquivo).toBeDefined()
  })

  test('deve ter schemas de lote (corrigido: agora plugados)', () => {
    expect(santanderCnab240.headerLote).toBeDefined()
    expect(santanderCnab240.trailerLote).toBeDefined()
  })

  test('deve ter schemas opcionais implementados', () => {
    // Segmentos opcionais agora em optionalRecords
    expect(santanderCnab240.optionalRecords).toBeDefined()
    expect(santanderCnab240.optionalRecords).toHaveLength(4)
    
    const identifiers = santanderCnab240.optionalRecords?.map(r => r.identifier) ?? []
    expect(identifiers).toContain('R')
    expect(identifiers).toContain('S')
    expect(identifiers).toContain('Y03')
    expect(identifiers).toContain('Y53')
  })

  test('headerLote e trailerLote devem ser os schemas corretos (não undefined)', () => {
    // Bug corrigido: antes não estavam no BankSchema principal
    expect(santanderCnab240.headerLote).not.toBeUndefined()
    expect(santanderCnab240.trailerLote).not.toBeUndefined()
    
    // Verifica que têm campos reais
    expect(Object.keys(santanderCnab240.headerLote!).length).toBeGreaterThan(0)
    expect(Object.keys(santanderCnab240.trailerLote!).length).toBeGreaterThan(0)
  })
})
