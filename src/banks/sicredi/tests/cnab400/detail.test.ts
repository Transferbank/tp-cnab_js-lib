/**
 * Testes do Schema Sicredi CNAB 400 - Detalhe (Registro Tipo 1)
 *
 * Verifica a definição do schema do detalhe conforme o manual oficial Sicredi
 * (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.2, p.26-31
 */

import { DETAIL } from '@banks/sicredi/schemas/cnab400/detail'

describe('Schema Sicredi CNAB 400 - Detalhe (Registro Tipo 1)', () => {
  describe('Definição dos campos', () => {
    test('deve ter tipo de registro "1" (detalhe) na posição 1', () => {
      expect(DETAIL.tipo_registro).toBeDefined()
      expect(DETAIL.tipo_registro.pos).toEqual([1, 1])
      expect(DETAIL.tipo_registro.type).toBe('num')
      expect(DETAIL.tipo_registro.size).toBe(1)
      expect(DETAIL.tipo_registro.pattern).toBe('1')
      expect(DETAIL.tipo_registro.required).toBe(true)
    })

    test('deve ter tipo de cobrança na posição 2', () => {
      expect(DETAIL.tipo_cobranca).toBeDefined()
      expect(DETAIL.tipo_cobranca.pos).toEqual([2, 2])
      expect(DETAIL.tipo_cobranca.type).toBe('alfa')
      expect(DETAIL.tipo_cobranca.size).toBe(1)
      expect(DETAIL.tipo_cobranca.pattern).toBe('A')
      expect(DETAIL.tipo_cobranca.required).toBe(true)
    })

    test('deve ter número da carteira na posição 3', () => {
      expect(DETAIL.numero_carteira).toBeDefined()
      expect(DETAIL.numero_carteira.pos).toEqual([3, 3])
      expect(DETAIL.numero_carteira.type).toBe('alfa')
      expect(DETAIL.numero_carteira.size).toBe(1)
      expect(DETAIL.numero_carteira.pattern).toBe('A')
      expect(DETAIL.numero_carteira.required).toBe(true)
    })

    test('deve ter tipo de impressão na posição 4', () => {
      expect(DETAIL.tipo_impressao).toBeDefined()
      expect(DETAIL.tipo_impressao.pos).toEqual([4, 4])
      expect(DETAIL.tipo_impressao.type).toBe('alfa')
      expect(DETAIL.tipo_impressao.size).toBe(1)
    })

    test('deve ter tipo de boleto na posição 6', () => {
      expect(DETAIL.tipo_boleto).toBeDefined()
      expect(DETAIL.tipo_boleto.pos).toEqual([6, 6])
      expect(DETAIL.tipo_boleto.type).toBe('alfa')
      expect(DETAIL.tipo_boleto.size).toBe(1)
    })

    test('deve ter tipo de moeda na posição 17', () => {
      expect(DETAIL.tipo_moeda).toBeDefined()
      expect(DETAIL.tipo_moeda.pos).toEqual([17, 17])
      expect(DETAIL.tipo_moeda.type).toBe('alfa')
      expect(DETAIL.tipo_moeda.size).toBe(1)
      expect(DETAIL.tipo_moeda.pattern).toBe('A')
      expect(DETAIL.tipo_moeda.required).toBe(true)
    })

    test('deve ter tipo de desconto na posição 18', () => {
      expect(DETAIL.tipo_desconto).toBeDefined()
      expect(DETAIL.tipo_desconto.pos).toEqual([18, 18])
      expect(DETAIL.tipo_desconto.type).toBe('alfa')
      expect(DETAIL.tipo_desconto.size).toBe(1)
    })

    test('deve ter tipo de juros na posição 19', () => {
      expect(DETAIL.tipo_juros).toBeDefined()
      expect(DETAIL.tipo_juros.pos).toEqual([19, 19])
      expect(DETAIL.tipo_juros.type).toBe('alfa')
      expect(DETAIL.tipo_juros.size).toBe(1)
    })

    test('deve ter tipo de multa na posição 20', () => {
      expect(DETAIL.tipo_multa).toBeDefined()
      expect(DETAIL.tipo_multa.pos).toEqual([20, 20])
      expect(DETAIL.tipo_multa.type).toBe('alfa')
      expect(DETAIL.tipo_multa.size).toBe(1)
    })

    test('deve ter data de início de juros na posição 21-28 com formato AAAAMMDD', () => {
      expect(DETAIL.data_inicio_juros).toBeDefined()
      expect(DETAIL.data_inicio_juros.pos).toEqual([21, 28])
      expect(DETAIL.data_inicio_juros.type).toBe('data')
      expect(DETAIL.data_inicio_juros.size).toBe(8)
      expect(DETAIL.data_inicio_juros.dateFormat).toBe('AAAAMMDD')
    })

    test('deve ter data de início de multa na posição 29-36 com formato AAAAMMDD', () => {
      expect(DETAIL.data_inicio_multa).toBeDefined()
      expect(DETAIL.data_inicio_multa.pos).toEqual([29, 36])
      expect(DETAIL.data_inicio_multa.type).toBe('data')
      expect(DETAIL.data_inicio_multa.size).toBe(8)
      expect(DETAIL.data_inicio_multa.dateFormat).toBe('AAAAMMDD')
    })

    test('deve ter nosso número na posição 48-56', () => {
      expect(DETAIL.nosso_numero).toBeDefined()
      expect(DETAIL.nosso_numero.pos).toEqual([48, 56])
      expect(DETAIL.nosso_numero.type).toBe('num')
      expect(DETAIL.nosso_numero.size).toBe(9)
    })

    test('deve ter data de instrução na posição 63-70 com formato AAAAMMDD', () => {
      expect(DETAIL.data_instrucao).toBeDefined()
      expect(DETAIL.data_instrucao.pos).toEqual([63, 70])
      expect(DETAIL.data_instrucao.type).toBe('data')
      expect(DETAIL.data_instrucao.size).toBe(8)
      expect(DETAIL.data_instrucao.dateFormat).toBe('AAAAMMDD')
    })

    test('deve ter instrução na posição 109-110', () => {
      expect(DETAIL.instrucao).toBeDefined()
      expect(DETAIL.instrucao.pos).toEqual([109, 110])
      expect(DETAIL.instrucao.type).toBe('num')
      expect(DETAIL.instrucao.size).toBe(2)
      expect(DETAIL.instrucao.required).toBe(true)
    })

    test('deve ter número do documento na posição 111-120', () => {
      expect(DETAIL.numero_documento).toBeDefined()
      expect(DETAIL.numero_documento.pos).toEqual([111, 120])
      expect(DETAIL.numero_documento.type).toBe('alfa')
      expect(DETAIL.numero_documento.size).toBe(10)
    })

    test('deve ter vencimento na posição 121-126 com formato DDMMAA', () => {
      expect(DETAIL.vencimento).toBeDefined()
      expect(DETAIL.vencimento.pos).toEqual([121, 126])
      expect(DETAIL.vencimento.type).toBe('data')
      expect(DETAIL.vencimento.size).toBe(6)
      expect(DETAIL.vencimento.dateFormat).toBe('DDMMAA')
      expect(DETAIL.vencimento.required).toBe(true)
    })

    test('deve ter valor do título na posição 127-139 com 2 decimais', () => {
      expect(DETAIL.valor_titulo).toBeDefined()
      expect(DETAIL.valor_titulo.pos).toEqual([127, 139])
      expect(DETAIL.valor_titulo.type).toBe('num')
      expect(DETAIL.valor_titulo.size).toBe(13)
      expect(DETAIL.valor_titulo.decimals).toBe(2)
      expect(DETAIL.valor_titulo.required).toBe(true)
    })

    test('deve ter espécie do título na posição 149', () => {
      expect(DETAIL.especie).toBeDefined()
      expect(DETAIL.especie.pos).toEqual([149, 149])
      expect(DETAIL.especie.type).toBe('alfa')
      expect(DETAIL.especie.size).toBe(1)
      expect(DETAIL.especie.required).toBe(true)
    })

    test('deve ter aceite na posição 150', () => {
      expect(DETAIL.aceite).toBeDefined()
      expect(DETAIL.aceite.pos).toEqual([150, 150])
      expect(DETAIL.aceite.type).toBe('alfa')
      expect(DETAIL.aceite.size).toBe(1)
      expect(DETAIL.aceite.required).toBe(true)
    })

    test('deve ter data de emissão na posição 151-156 com formato DDMMAA', () => {
      expect(DETAIL.data_emissao).toBeDefined()
      expect(DETAIL.data_emissao.pos).toEqual([151, 156])
      expect(DETAIL.data_emissao.type).toBe('data')
      expect(DETAIL.data_emissao.size).toBe(6)
      expect(DETAIL.data_emissao.dateFormat).toBe('DDMMAA')
      expect(DETAIL.data_emissao.required).toBe(true)
    })

    test('deve ter juros de mora na posição 161-173 com 2 decimais', () => {
      expect(DETAIL.juros_mora).toBeDefined()
      expect(DETAIL.juros_mora.pos).toEqual([161, 173])
      expect(DETAIL.juros_mora.type).toBe('num')
      expect(DETAIL.juros_mora.size).toBe(13)
      expect(DETAIL.juros_mora.decimals).toBe(2)
    })

    test('deve ter data limite de desconto na posição 174-179 com formato DDMMAA', () => {
      expect(DETAIL.data_limite_desconto).toBeDefined()
      expect(DETAIL.data_limite_desconto.pos).toEqual([174, 179])
      expect(DETAIL.data_limite_desconto.type).toBe('data')
      expect(DETAIL.data_limite_desconto.size).toBe(6)
      expect(DETAIL.data_limite_desconto.dateFormat).toBe('DDMMAA')
    })

    test('deve ter valor de desconto na posição 180-192 com 2 decimais', () => {
      expect(DETAIL.valor_desconto).toBeDefined()
      expect(DETAIL.valor_desconto.pos).toEqual([180, 192])
      expect(DETAIL.valor_desconto.type).toBe('num')
      expect(DETAIL.valor_desconto.size).toBe(13)
      expect(DETAIL.valor_desconto.decimals).toBe(2)
    })

    test('deve ter valor de abatimento na posição 206-218 com 2 decimais', () => {
      expect(DETAIL.valor_abatimento).toBeDefined()
      expect(DETAIL.valor_abatimento.pos).toEqual([206, 218])
      expect(DETAIL.valor_abatimento.type).toBe('num')
      expect(DETAIL.valor_abatimento.size).toBe(13)
      expect(DETAIL.valor_abatimento.decimals).toBe(2)
    })

    test('deve ter código de inscrição do sacado na posição 219', () => {
      expect(DETAIL.sacado_codigo_inscricao).toBeDefined()
      expect(DETAIL.sacado_codigo_inscricao.pos).toEqual([219, 219])
      expect(DETAIL.sacado_codigo_inscricao.type).toBe('num')
      expect(DETAIL.sacado_codigo_inscricao.size).toBe(1)
      expect(DETAIL.sacado_codigo_inscricao.required).toBe(true)
    })

    test('deve ter número de inscrição do sacado na posição 221-234', () => {
      expect(DETAIL.sacado_numero_inscricao).toBeDefined()
      expect(DETAIL.sacado_numero_inscricao.pos).toEqual([221, 234])
      expect(DETAIL.sacado_numero_inscricao.type).toBe('num')
      expect(DETAIL.sacado_numero_inscricao.size).toBe(14)
      expect(DETAIL.sacado_numero_inscricao.required).toBe(true)
    })

    test('deve ter nome do sacado na posição 235-274 (40 caracteres padrão FEBRABAN)', () => {
      expect(DETAIL.nome).toBeDefined()
      expect(DETAIL.nome.pos).toEqual([235, 274])
      expect(DETAIL.nome.type).toBe('alfa')
      expect(DETAIL.nome.size).toBe(40)
      expect(DETAIL.nome.required).toBe(true)
    })

    test('deve ter logradouro na posição 275-314', () => {
      expect(DETAIL.logradouro).toBeDefined()
      expect(DETAIL.logradouro.pos).toEqual([275, 314])
      expect(DETAIL.logradouro.type).toBe('alfa')
      expect(DETAIL.logradouro.size).toBe(40)
    })

    test('deve ter CEP na posição 327-334', () => {
      expect(DETAIL.cep).toBeDefined()
      expect(DETAIL.cep.pos).toEqual([327, 334])
      expect(DETAIL.cep.type).toBe('num')
      expect(DETAIL.cep.size).toBe(8)
    })

    test('deve ter postagem do título na posição 72', () => {
      expect(DETAIL.postagem_titulo).toBeDefined()
      expect(DETAIL.postagem_titulo.pos).toEqual([72, 72])
      expect(DETAIL.postagem_titulo.type).toBe('alfa')
      expect(DETAIL.postagem_titulo.size).toBe(1)
      expect(DETAIL.postagem_titulo.required).toBe(true)
    })

    test('deve ter impressão do boleto na posição 74', () => {
      expect(DETAIL.impressao_boleto).toBeDefined()
      expect(DETAIL.impressao_boleto.pos).toEqual([74, 74])
      expect(DETAIL.impressao_boleto.type).toBe('alfa')
      expect(DETAIL.impressao_boleto.size).toBe(1)
      expect(DETAIL.impressao_boleto.required).toBe(true)
    })

    test('deve ter número de inscrição do beneficiário final na posição 340-353', () => {
      expect(DETAIL.numero_inscricao_beneficiario_final).toBeDefined()
      expect(DETAIL.numero_inscricao_beneficiario_final.pos).toEqual([340, 353])
      expect(DETAIL.numero_inscricao_beneficiario_final.type).toBe('num')
      expect(DETAIL.numero_inscricao_beneficiario_final.size).toBe(14)
    })

    test('deve ter nome do beneficiário final na posição 354-394', () => {
      expect(DETAIL.nome_beneficiario_final).toBeDefined()
      expect(DETAIL.nome_beneficiario_final.pos).toEqual([354, 394])
      expect(DETAIL.nome_beneficiario_final.type).toBe('alfa')
      expect(DETAIL.nome_beneficiario_final.size).toBe(41)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(DETAIL.numero_sequencial).toBeDefined()
      expect(DETAIL.numero_sequencial.pos).toEqual([395, 400])
      expect(DETAIL.numero_sequencial.type).toBe('num')
      expect(DETAIL.numero_sequencial.size).toBe(6)
      expect(DETAIL.numero_sequencial.required).toBe(true)
    })
  })

  describe('Particularidades do Sicredi', () => {
    test('deve usar formato AAAAMMDD para datas de início de juros e multa', () => {
      expect(DETAIL.data_inicio_juros.dateFormat).toBe('AAAAMMDD')
      expect(DETAIL.data_inicio_multa.dateFormat).toBe('AAAAMMDD')
      expect(DETAIL.data_instrucao.dateFormat).toBe('AAAAMMDD')
    })

    test('deve usar formato DDMMAA para datas de vencimento, emissão e desconto', () => {
      expect(DETAIL.vencimento.dateFormat).toBe('DDMMAA')
      expect(DETAIL.data_emissao.dateFormat).toBe('DDMMAA')
      expect(DETAIL.data_limite_desconto.dateFormat).toBe('DDMMAA')
    })

    test('deve ter campo tipo_boleto para controlar boleto híbrido', () => {
      expect(DETAIL.tipo_boleto).toBeDefined()
      expect(DETAIL.tipo_boleto.description).toContain('brido')
    })

    test('deve ter campos específicos para carnê', () => {
      expect(DETAIL.numero_parcela_carne).toBeDefined()
      expect(DETAIL.total_parcelas_carne).toBeDefined()
    })

    test('deve ter dois tipos de multa: percentual e monetário', () => {
      expect(DETAIL.valor_multa_percentual).toBeDefined()
      expect(DETAIL.valor_multa_monetario).toBeDefined()
    })

    test('deve ter instruções de negativação (além de protesto)', () => {
      expect(DETAIL.instrucao_negativacao).toBeDefined()
      expect(DETAIL.dias_negativacao).toBeDefined()
    })

    test('deve usar nomenclatura "Beneficiário Final" (BACEN 3598/3656/3956)', () => {
      expect(DETAIL.numero_inscricao_beneficiario_final).toBeDefined()
      expect(DETAIL.nome_beneficiario_final).toBeDefined()
      expect(DETAIL.numero_inscricao_beneficiario_final.description).toContain('Final')
      expect(DETAIL.nome_beneficiario_final.description).toContain('Final')
    })
  })
})

