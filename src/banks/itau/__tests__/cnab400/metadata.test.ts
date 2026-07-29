/**
 * Testes de Metadados - Itaú CNAB 400
 * 
 * Valida informações básicas do schema: código do banco, nome e schemas obrigatórios.
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Estrutura correta do schema
 * - Presença de schemas obrigatórios
 * - Metadados corretos
 */

import { itauCnab400 } from '@banks/itau/schemas/cnab400'
import { BANK_CODES } from '../../../../../src/types'

describe('Schema Itaú CNAB 400 - Metadados', () => {
  test('deve ter código do banco correto (341)', () => {
    expect(itauCnab400.bankCode).toBe(BANK_CODES.ITAU)
  })

  test('deve ter nome do banco correto', () => {
    expect(itauCnab400.bankName).toBe('Itaú')
  })

  test('deve ter todos os schemas obrigatórios para remessa', () => {
    expect(itauCnab400.header).toBeDefined()
    expect(itauCnab400.detail).toBeDefined()
    expect(itauCnab400.trailer).toBeDefined()
  })
})

