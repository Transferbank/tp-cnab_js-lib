/**
 * Testes de Metadados - Sicoob CNAB 400
 */

import { sicoobCnab400 } from '@banks/sicoob/schemas/cnab400'

describe('Schema Sicoob CNAB 400 - Metadados', () => {
  test('deve ter código do banco correto (756)', () => {
    expect(sicoobCnab400.bankCode).toBe('756')
  })

  test('deve ter nome do banco correto', () => {
    expect(sicoobCnab400.bankName).toBe('Sicoob')
  })

  test('deve ter todos os schemas obrigatórios para remessa', () => {
    expect(sicoobCnab400.header).toBeDefined()
    expect(sicoobCnab400.detail).toBeDefined()
    expect(sicoobCnab400.trailer).toBeDefined()
  })

  test('header deve ter campos essenciais', () => {
    const header = sicoobCnab400.header!
    expect(header.tipo_registro).toBeDefined()
    expect(header.codigo_banco).toBeDefined()
    expect(header.nome_beneficiario).toBeDefined()
    expect(header.data_gravacao).toBeDefined()
    expect(header.numero_sequencial).toBeDefined()
  })

  test('detail deve ter campos essenciais', () => {
    const detail = sicoobCnab400.detail!
    expect(detail.tipo_registro).toBeDefined()
    expect(detail.nosso_numero).toBeDefined()
    expect(detail.comando_movimento).toBeDefined()
    expect(detail.numero_documento).toBeDefined()
    expect(detail.vencimento).toBeDefined()
    expect(detail.valor_titulo).toBeDefined()
    expect(detail.sacado_numero_inscricao).toBeDefined()
    expect(detail.nome).toBeDefined()
  })

  test('trailer deve ter campos essenciais', () => {
    const trailer = sicoobCnab400.trailer!
    expect(trailer.tipo_registro).toBeDefined()
    expect(trailer.numero_sequencial).toBeDefined()
  })

  describe('Particularidades do Sicoob', () => {
    test('header deve ter prefixo_cooperativa de 4 dígitos', () => {
      const header = sicoobCnab400.header!
      expect(header.prefixo_cooperativa).toBeDefined()
      expect(header.prefixo_cooperativa.size).toBe(4)
      expect(header.prefixo_cooperativa.pos).toEqual([27, 30])
    })

    test('header deve ter codigo_cliente_beneficiario de 8 dígitos', () => {
      const header = sicoobCnab400.header!
      expect(header.codigo_cliente_beneficiario).toBeDefined()
      expect(header.codigo_cliente_beneficiario.size).toBe(8)
      expect(header.codigo_cliente_beneficiario.pos).toEqual([32, 39])
    })

    test('detail deve ter logradouro de 37 caracteres (não 40 como outros bancos)', () => {
      const detail = sicoobCnab400.detail!
      expect(detail.logradouro).toBeDefined()
      expect(detail.logradouro.size).toBe(37)
      expect(detail.logradouro.pos).toEqual([275, 311])
    })

    test('detail deve ter aceite usando dígito (0/1), não letra (N/A)', () => {
      const detail = sicoobCnab400.detail!
      expect(detail.aceite).toBeDefined()
      expect(detail.aceite.type).toBe('num')
      expect(detail.aceite.size).toBe(1)
      expect(detail.aceite.description).toContain('0=sem aceite')
      expect(detail.aceite.description).toContain('1=com aceite')
    })

    test('detail vencimento deve aceitar valores especiais 888888 e 999999', () => {
      const detail = sicoobCnab400.detail!
      expect(detail.vencimento).toBeDefined()
      expect(detail.vencimento.description).toContain('888888')
      expect(detail.vencimento.description).toContain('999999')
      expect(detail.vencimento.description).toContain('vista')
      expect(detail.vencimento.description).toContain('apresenta')
    })

    test('detail deve ter nosso_numero de 12 dígitos (10 + DV módulo 11)', () => {
      const detail = sicoobCnab400.detail!
      expect(detail.nosso_numero).toBeDefined()
      expect(detail.nosso_numero.size).toBe(12)
      expect(detail.nosso_numero.pos).toEqual([63, 74])
    })

    test('header deve ter codigo do banco com padrão "756"', () => {
      const header = sicoobCnab400.header!
      expect(header.codigo_banco.pattern).toBe('756')
    })

    test('header deve ter nome_banco com padrão "BANCOOBCED"', () => {
      const header = sicoobCnab400.header!
      expect(header.nome_banco).toBeDefined()
      expect(header.nome_banco.pattern).toBe('BANCOOBCED')
      expect(header.nome_banco.pos).toEqual([80, 94])
    })

    test('trailer deve ter 5 blocos de mensagem de 40 caracteres cada (achado estrutural único)', () => {
      const trailer = sicoobCnab400.trailer!
      expect(trailer.mensagem_responsabilidade_1).toBeDefined()
      expect(trailer.mensagem_responsabilidade_1.size).toBe(40)
      expect(trailer.mensagem_responsabilidade_2).toBeDefined()
      expect(trailer.mensagem_responsabilidade_2.size).toBe(40)
      expect(trailer.mensagem_responsabilidade_3).toBeDefined()
      expect(trailer.mensagem_responsabilidade_3.size).toBe(40)
      expect(trailer.mensagem_responsabilidade_4).toBeDefined()
      expect(trailer.mensagem_responsabilidade_4.size).toBe(40)
      expect(trailer.mensagem_responsabilidade_5).toBeDefined()
      expect(trailer.mensagem_responsabilidade_5.size).toBe(40)
    })

    test('trailer mensagens devem estar nas posições 195-394', () => {
      const trailer = sicoobCnab400.trailer!
      expect(trailer.mensagem_responsabilidade_1.pos).toEqual([195, 234])
      expect(trailer.mensagem_responsabilidade_2.pos).toEqual([235, 274])
      expect(trailer.mensagem_responsabilidade_3.pos).toEqual([275, 314])
      expect(trailer.mensagem_responsabilidade_4.pos).toEqual([315, 354])
      expect(trailer.mensagem_responsabilidade_5.pos).toEqual([355, 394])
    })

    test('detail deve ter campo codigo_moeda_valor_iof_ou_qtde_moeda condicional', () => {
      const detail = sicoobCnab400.detail!
      expect(detail.codigo_moeda_valor_iof_ou_qtde_moeda).toBeDefined()
      expect(detail.codigo_moeda_valor_iof_ou_qtde_moeda.pos).toEqual([193, 205])
      expect(detail.codigo_moeda_valor_iof_ou_qtde_moeda.description).toContain('composto')
      expect(detail.codigo_moeda_valor_iof_ou_qtde_moeda.description).toContain('IOF')
      // Check for "monet" to avoid encoding issues
      expect(detail.codigo_moeda_valor_iof_ou_qtde_moeda.description?.toLowerCase()).toContain('monet')
    })

    test('trailer não deve ter campos de totalização (diferente de outros bancos)', () => {
      const trailer = sicoobCnab400.trailer!
      const campos = Object.keys(trailer)
      expect(campos).not.toContain('qtd_documentos')
      expect(campos).not.toContain('valor_total')
    })
  })
})

