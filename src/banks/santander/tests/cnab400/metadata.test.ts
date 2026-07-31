/**
 * Testes de metadados do Schema Santander CNAB 400
 *
 * Verifica:
 * - Código do banco correto
 * - Nome do banco correto
 * - Schemas obrigatórios definidos
 */

import { santanderCnab400 } from '@banks/santander/schemas/cnab400'
import { BANK_CODES } from '@tp-types/index'

describe('Schema Santander CNAB 400 - Metadados', () => {
  test('deve ter código do banco correto (033)', () => {
    expect(santanderCnab400.bankCode).toBe(BANK_CODES.SANTANDER)
  })

  test('deve ter nome do banco correto', () => {
    expect(santanderCnab400.bankName).toBe('Santander')
  })

  test('deve ter todos os schemas obrigatórios para remessa', () => {
    expect(santanderCnab400.header).toBeDefined()
    expect(santanderCnab400.detail).toBeDefined()
    expect(santanderCnab400.trailer).toBeDefined()
  })

  test('header deve ter campos essenciais', () => {
    expect(santanderCnab400.header!.tipo_registro).toBeDefined()
    expect(santanderCnab400.header!.codigo_banco).toBeDefined()
    expect(santanderCnab400.header!.nome_empresa).toBeDefined()
    expect(santanderCnab400.header!.data_geracao).toBeDefined()
  })

  test('detail deve ter campos essenciais', () => {
    expect(santanderCnab400.detail!.tipo_registro).toBeDefined()
    expect(santanderCnab400.detail!.numero_documento).toBeDefined()
    expect(santanderCnab400.detail!.vencimento).toBeDefined()
    expect(santanderCnab400.detail!.valor_titulo).toBeDefined()
    expect(santanderCnab400.detail!.sacado_numero_inscricao).toBeDefined()
    expect(santanderCnab400.detail!.nome).toBeDefined()
  })

  test('trailer deve ter campos essenciais', () => {
    expect(santanderCnab400.trailer!.tipo_registro).toBeDefined()
    expect(santanderCnab400.trailer!.qtd_documentos).toBeDefined()
    expect(santanderCnab400.trailer!.valor_total).toBeDefined()
    expect(santanderCnab400.trailer!.numero_sequencial).toBeDefined()
  })
})

