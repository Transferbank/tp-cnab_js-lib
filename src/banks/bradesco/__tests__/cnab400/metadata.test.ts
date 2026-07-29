/**
 * Testes de Metadados - Bradesco CNAB 400
 * 
 * Valida informações básicas do schema: código do banco, nome e schemas obrigatórios.
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Estrutura correta do schema
 * - Presença de schemas obrigatórios
 * - Metadados corretos
 */

import { bradescoCnab400 } from '@banks/bradesco/schemas/cnab400'

describe('Schema Bradesco CNAB 400 - Metadados', () => {
  test('deve ter código do banco correto (237)', () => {
    expect(bradescoCnab400.bankCode).toBe('237')
  })

  test('deve ter nome do banco correto', () => {
    expect(bradescoCnab400.bankName).toBe('Bradesco')
  })

  test('deve ter todos os schemas obrigatórios para remessa', () => {
    expect(bradescoCnab400.header).toBeDefined()
    expect(bradescoCnab400.detail).toBeDefined()
    expect(bradescoCnab400.trailer).toBeDefined()
  })
})
