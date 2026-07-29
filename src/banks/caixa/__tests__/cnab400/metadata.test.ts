/**
 * Testes de Metadados - Caixa CNAB 400
 */

import { caixaCnab400 } from '@banks/caixa/schemas/cnab400'

describe('Schema Caixa CNAB 400 - Metadados', () => {
  test('deve ter código do banco correto (104)', () => {
    expect(caixaCnab400.bankCode).toBe('104')
  })

  test('deve ter nome do banco correto', () => {
    expect(caixaCnab400.bankName).toBe('Caixa Econômica')
  })

  test('deve ter todos os schemas obrigatórios para remessa', () => {
    expect(caixaCnab400.header).toBeDefined()
    expect(caixaCnab400.detail).toBeDefined()
    expect(caixaCnab400.trailer).toBeDefined()
  })

  test('header deve ter campos essenciais', () => {
    const header = caixaCnab400.header!
    expect(header.codigo_registro).toBeDefined()
    expect(header.codigo_banco).toBeDefined()
    expect(header.nome_empresa).toBeDefined()
    expect(header.data_geracao).toBeDefined()
    expect(header.numero_sequencial).toBeDefined()
  })

  test('detail deve ter campos essenciais', () => {
    const detail = caixaCnab400.detail!
    expect(detail.codigo_registro).toBeDefined()
    expect(detail.nosso_numero).toBeDefined()
    expect(detail.nosso_numero_modalidade).toBeDefined()
    expect(detail.codigo_beneficiario).toBeDefined()
    expect(detail.codigo_ocorrencia).toBeDefined()
    expect(detail.numero_documento).toBeDefined()
    expect(detail.vencimento).toBeDefined()
    expect(detail.valor_titulo).toBeDefined()
    expect(detail.sacado_numero_inscricao).toBeDefined()
    expect(detail.nome).toBeDefined()
  })

  test('trailer deve ter campos essenciais', () => {
    const trailer = caixaCnab400.trailer!
    expect(trailer.codigo_registro).toBeDefined()
    expect(trailer.numero_sequencial).toBeDefined()
  })

  describe('Particularidades da Caixa', () => {
    test('detail deve ter codigo_beneficiario de 7 dígitos (diferente de outros bancos)', () => {
      const detail = caixaCnab400.detail!
      expect(detail.codigo_beneficiario).toBeDefined()
      expect(detail.codigo_beneficiario.size).toBe(7)
      expect(detail.codigo_beneficiario.pos).toEqual([21, 27])
    })

    test('header deve ter codigo_beneficiario de 7 dígitos', () => {
      const header = caixaCnab400.header!
      expect(header.codigo_beneficiario).toBeDefined()
      expect(header.codigo_beneficiario.size).toBe(7)
      expect(header.codigo_beneficiario.pos).toEqual([31, 37])
    })

    test('nosso número deve ter estrutura composta: modalidade(2) + número(15)', () => {
      const detail = caixaCnab400.detail!
      expect(detail.nosso_numero_modalidade).toBeDefined()
      expect(detail.nosso_numero_modalidade.size).toBe(2)
      expect(detail.nosso_numero).toBeDefined()
      expect(detail.nosso_numero.size).toBe(15)
    })

    test('header deve ter campo versao_layout (só existe na Caixa e Sicredi)', () => {
      const header = caixaCnab400.header!
      expect(header.versao_layout).toBeDefined()
      expect(header.versao_layout.pos).toEqual([101, 103])
    })

    test('sacador_avalista deve ter apenas 22 caracteres (menor que outros bancos)', () => {
      const detail = caixaCnab400.detail!
      expect(detail.sacador_avalista).toBeDefined()
      expect(detail.sacador_avalista.size).toBe(22)
      expect(detail.sacador_avalista.pos).toEqual([368, 389])
    })

    test('header deve ter codigo do banco com padrão "104"', () => {
      const header = caixaCnab400.header!
      expect(header.codigo_banco.pattern).toBe('104')
    })

    test('trailer não deve ter campos de totalização (diferente de outros bancos)', () => {
      const trailer = caixaCnab400.trailer!
      const campos = Object.keys(trailer)
      expect(campos).not.toContain('qtd_documentos')
      expect(campos).not.toContain('valor_total')
    })
  })
})
