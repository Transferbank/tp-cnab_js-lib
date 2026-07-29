/**
 * Testes do Schema Banco do Brasil CNAB 400 - Metadados
 *
 * Verifica:
 * - Código do banco correto (001)
 * - Nome do banco correto
 * - Schemas obrigatórios implementados
 * - Campos essenciais presentes
 */

import { bancoDoBrasilCnab400 } from '@banks/bancoDoBrasil/schemas/cnab400'

describe('Schema Banco do Brasil CNAB 400 - Metadados', () => {
  test('deve ter código do banco correto (001)', () => {
    expect(bancoDoBrasilCnab400.bankCode).toBe('001')
  })

  test('deve ter nome do banco correto', () => {
    expect(bancoDoBrasilCnab400.bankName).toBe('Banco do Brasil')
  })

  test('deve ter todos os schemas obrigatórios para remessa', () => {
    expect(bancoDoBrasilCnab400.header).toBeDefined()
    expect(bancoDoBrasilCnab400.detail).toBeDefined()
    expect(bancoDoBrasilCnab400.trailer).toBeDefined()
  })

  test('header deve ter campos essenciais', () => {
    const header = bancoDoBrasilCnab400.header!

    expect(header.tipo_registro).toBeDefined()
    expect(header.codigo_banco).toBeDefined()
    expect(header.agencia).toBeDefined()
    expect(header.conta).toBeDefined()
    expect(header.nome_empresa).toBeDefined()
    expect(header.data_geracao).toBeDefined()
    expect(header.convenio_lider).toBeDefined()
    expect(header.numero_sequencial).toBeDefined()
  })

  test('detail deve ter campos essenciais', () => {
    const detail = bancoDoBrasilCnab400.detail!

    expect(detail.tipo_registro).toBeDefined()
    expect(detail.nosso_numero).toBeDefined()
    expect(detail.valor_titulo).toBeDefined()
    expect(detail.vencimento).toBeDefined()
    expect(detail.nome).toBeDefined()
    expect(detail.sacado_numero_inscricao).toBeDefined()
    expect(detail.numero_sequencial).toBeDefined()
  })

  test('trailer deve ter campos essenciais', () => {
    const trailer = bancoDoBrasilCnab400.trailer!

    expect(trailer.tipo_registro).toBeDefined()
    expect(trailer.numero_sequencial).toBeDefined()
  })

  describe('Particularidades do BB', () => {
    test('detail deve ter tipo_registro com padrão "7" (não "1")', () => {
      expect(bancoDoBrasilCnab400.detail!.tipo_registro.pattern).toBe('7')
    })

    test('header deve ter código do banco com padrão "001"', () => {
      expect(bancoDoBrasilCnab400.header!.codigo_banco.pattern).toBe('001')
    })

    test('trailer não deve ter campos de totalização (diferente de outros bancos)', () => {
      const trailer = bancoDoBrasilCnab400.trailer!

      expect(trailer.qtd_documentos).toBeUndefined()
      expect(trailer.valor_total).toBeUndefined()
    })
  })
})
