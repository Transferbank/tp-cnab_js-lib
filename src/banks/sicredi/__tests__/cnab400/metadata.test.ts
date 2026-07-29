/**
 * Testes de Metadados do Schema Sicredi CNAB 400
 *
 * Verifica informações gerais sobre o schema: código do banco, nome,
 * schemas disponíveis, e campos essenciais.
 */

import { sicrediCnab400 } from '@banks/sicredi/schemas/cnab400'

describe('Schema Sicredi CNAB 400 - Metadados', () => {
  test('deve ter código do banco correto (748)', () => {
    expect(sicrediCnab400.bankCode).toBe('748')
  })

  test('deve ter nome do banco correto', () => {
    expect(sicrediCnab400.bankName).toBe('Sicredi')
  })

  test('deve ter todos os schemas obrigatórios para remessa', () => {
    expect(sicrediCnab400.header).toBeDefined()
    expect(sicrediCnab400.detail).toBeDefined()
    expect(sicrediCnab400.trailer).toBeDefined()
  })

  test('header deve ter campos essenciais', () => {
    const header = sicrediCnab400.header!
    expect(header.tipo_registro).toBeDefined()
    expect(header.codigo_cliente).toBeDefined()
    expect(header.codigo_banco).toBeDefined()
    expect(header.data_geracao).toBeDefined()
    expect(header.numero_sequencial).toBeDefined()
  })

  test('detail deve ter campos essenciais', () => {
    const detail = sicrediCnab400.detail!
    expect(detail.tipo_registro).toBeDefined()
    expect(detail.nosso_numero).toBeDefined()
    expect(detail.numero_documento).toBeDefined()
    expect(detail.vencimento).toBeDefined()
    expect(detail.valor_titulo).toBeDefined()
    expect(detail.sacado_numero_inscricao).toBeDefined()
    expect(detail.nome).toBeDefined()
    expect(detail.numero_sequencial).toBeDefined()
  })

  test('trailer deve ter campos essenciais', () => {
    const trailer = sicrediCnab400.trailer!
    expect(trailer.tipo_registro).toBeDefined()
    expect(trailer.codigo_banco).toBeDefined()
    expect(trailer.codigo_cliente).toBeDefined()
    expect(trailer.numero_sequencial).toBeDefined()
  })

  describe('Particularidades do Sicredi', () => {
    test('header deve usar código do cliente em vez de agência+conta', () => {
      const header = sicrediCnab400.header!
      expect(header.codigo_cliente).toBeDefined()
      expect(header.agencia).toBeUndefined()
      expect(header.conta).toBeUndefined()
    })

    test('header deve ter código do banco com padrão "748"', () => {
      const header = sicrediCnab400.header!
      expect(header.codigo_banco.pattern).toBe('748')
    })

    test('header deve ter data de geração com formato AAAAMMDD', () => {
      const header = sicrediCnab400.header!
      expect(header.data_geracao.dateFormat).toBe('AAAAMMDD')
    })

    test('detail deve ter campo tipo_boleto para controlar híbrido', () => {
      const detail = sicrediCnab400.detail!
      expect(detail.tipo_boleto).toBeDefined()
    })

    test('detail deve ter campos de Beneficiário Final', () => {
      const detail = sicrediCnab400.detail!
      expect(detail.numero_inscricao_beneficiario_final).toBeDefined()
      expect(detail.nome_beneficiario_final).toBeDefined()
    })

    test('trailer não deve ter totalizadores', () => {
      const trailer = sicrediCnab400.trailer!
      expect(trailer.qtd_documentos).toBeUndefined()
      expect(trailer.valor_total).toBeUndefined()
    })
  })
})
