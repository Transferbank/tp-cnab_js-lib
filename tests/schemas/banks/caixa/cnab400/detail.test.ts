/**
 * Testes do Detalhe - Caixa CNAB 400
 *
 * Valida a DEFINIÇÃO do schema (estrutura, posições, tipos).
 *
 * IMPORTANTE: Estes testes focam APENAS na estrutura do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Valores padrão
 * - Campos obrigatórios
 *
 * NÃO usa fixture real — apenas valida a definição do schema em si.
 *
 * Posições validadas conforme manual oficial Caixa CNAB 400 (caixa_layout_CNAB_400_2024.pdf).
 */

import { caixaCnab400 } from '../../../../../src/banks/caixa/schemas/cnab400'

describe('Schema Caixa CNAB 400 - Detalhe (Definição)', () => {
  describe('Definição dos campos - Identificação', () => {
    test('deve ter tipo de registro "1" (detalhe) na posição 1', () => {
      const field = caixaCnab400.detail!.codigo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('1')
      expect(field.required).toBe(true)
    })

    test('deve ter tipo de inscrição da empresa na posição 2-3', () => {
      const field = caixaCnab400.detail!.tipo_inscricao_empresa

      expect(field.pos).toEqual([2, 3])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter número de inscrição da empresa na posição 4-17', () => {
      const field = caixaCnab400.detail!.numero_inscricao_empresa

      expect(field.pos).toEqual([4, 17])
      expect(field.type).toBe('num')
      expect(field.size).toBe(14)
      expect(field.required).toBe(true)
    })

    test('deve ter uso exclusivo na posição 18-20 (zeros)', () => {
      const field = caixaCnab400.detail!.uso_exclusivo_1

      expect(field.pos).toEqual([18, 20])
      expect(field.type).toBe('num')
      expect(field.size).toBe(3)
      expect(field.pattern).toBe('0')
      expect(field.required).toBe(false)
    })

    test('deve ter código do beneficiário na posição 21-27 (7 dígitos, particularidade Caixa)', () => {
      const field = caixaCnab400.detail!.codigo_beneficiario

      expect(field.pos).toEqual([21, 27])
      expect(field.type).toBe('num')
      expect(field.size).toBe(7)
      expect(field.required).toBe(true)
    })
  })

  describe('Definição dos campos - Emissão e Taxa', () => {
    test('deve ter identificação de emissão na posição 28', () => {
      const field = caixaCnab400.detail!.id_emissao

      expect(field.pos).toEqual([28, 28])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter identificação de postagem na posição 29', () => {
      const field = caixaCnab400.detail!.id_postagem

      expect(field.pos).toEqual([29, 29])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter taxa de permanência na posição 30-31', () => {
      const field = caixaCnab400.detail!.taxa_permanencia

      expect(field.pos).toEqual([30, 31])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.pattern).toBe('0')
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Nosso Número (estrutura composta)', () => {
    test('deve ter uso empresa/beneficiário na posição 32-56', () => {
      const field = caixaCnab400.detail!.uso_empresa_beneficiario

      expect(field.pos).toEqual([32, 56])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(25)
      expect(field.required).toBe(false)
    })

    test('deve ter modalidade do nosso número na posição 57-58 (particularidade: 2 dígitos)', () => {
      const field = caixaCnab400.detail!.nosso_numero_modalidade

      expect(field.pos).toEqual([57, 58])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter nosso número na posição 59-73 (15 dígitos)', () => {
      const field = caixaCnab400.detail!.nosso_numero

      expect(field.pos).toEqual([59, 73])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
      expect(field.required).toBe(true)
    })
  })

  describe('Definição dos campos - Juros e Descontos', () => {
    test('deve ter uso livre/pagamento parcial na posição 76', () => {
      const field = caixaCnab400.detail!.uso_livre_pagamento_parcial

      expect(field.pos).toEqual([76, 76])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter código de juros na posição 77', () => {
      const field = caixaCnab400.detail!.codigo_juros

      expect(field.pos).toEqual([77, 77])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter data de juros na posição 78-83', () => {
      const field = caixaCnab400.detail!.data_juros

      expect(field.pos).toEqual([78, 83])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(false)
    })

    test('deve ter código de desconto na posição 84', () => {
      const field = caixaCnab400.detail!.codigo_desconto

      expect(field.pos).toEqual([84, 84])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Carteira e Ocorrência', () => {
    test('deve ter carteira na posição 107-108', () => {
      const field = caixaCnab400.detail!.carteira

      expect(field.pos).toEqual([107, 108])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter código de ocorrência na posição 109-110 (14 códigos possíveis)', () => {
      const field = caixaCnab400.detail!.codigo_ocorrencia

      expect(field.pos).toEqual([109, 110])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(true)
      expect(field.pattern).toBeNull()
    })
  })

  describe('Definição dos campos - Dados do Título', () => {
    test('deve ter número do documento na posição 111-120', () => {
      const field = caixaCnab400.detail!.numero_documento

      expect(field.pos).toEqual([111, 120])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(10)
      expect(field.required).toBe(true)
    })

    test('deve ter vencimento na posição 121-126 com formato DDMMAA', () => {
      const field = caixaCnab400.detail!.vencimento

      expect(field.pos).toEqual([121, 126])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(true)
    })

    test('deve ter valor do título na posição 127-139 com 2 decimais', () => {
      const field = caixaCnab400.detail!.valor_titulo

      expect(field.pos).toEqual([127, 139])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter código do banco cobrador na posição 140-142 com padrão "104"', () => {
      const field = caixaCnab400.detail!.codigo_banco_cobrador

      expect(field.pos).toEqual([140, 142])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('104')
      // required:false por consistência com o mesmo campo em BB/Itaú — evita rejeitar
      // arquivos reais com o campo em branco ou correspondente diferente de '104'.
      expect(field.required).toBe(false)
    })

    test('deve ter agência cobradora na posição 143-147', () => {
      const field = caixaCnab400.detail!.agencia_cobradora

      expect(field.pos).toEqual([143, 147])
      expect(field.type).toBe('num')
      expect(field.size).toBe(5)
      expect(field.required).toBe(false)
    })

    test('deve ter espécie do título na posição 148-149', () => {
      const field = caixaCnab400.detail!.especie_titulo

      expect(field.pos).toEqual([148, 149])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter aceite na posição 150', () => {
      const field = caixaCnab400.detail!.aceite

      expect(field.pos).toEqual([150, 150])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter data de emissão na posição 151-156 com formato DDMMAA', () => {
      const field = caixaCnab400.detail!.data_emissao

      expect(field.pos).toEqual([151, 156])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Instruções e Valores', () => {
    test('deve ter primeira instrução na posição 157-158', () => {
      const field = caixaCnab400.detail!.instrucao_1

      expect(field.pos).toEqual([157, 158])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter segunda instrução na posição 159-160', () => {
      const field = caixaCnab400.detail!.instrucao_2

      expect(field.pos).toEqual([159, 160])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter juros de mora na posição 161-173 com 2 decimais', () => {
      const field = caixaCnab400.detail!.juros_mora

      expect(field.pos).toEqual([161, 173])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter data de desconto na posição 174-179', () => {
      const field = caixaCnab400.detail!.data_desconto

      expect(field.pos).toEqual([174, 179])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(false)
    })

    test('deve ter valor do desconto na posição 180-192 com 2 decimais', () => {
      const field = caixaCnab400.detail!.valor_desconto

      expect(field.pos).toEqual([180, 192])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter valor do IOF na posição 193-205 com 2 decimais', () => {
      const field = caixaCnab400.detail!.valor_iof

      expect(field.pos).toEqual([193, 205])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter abatimento na posição 206-218 com 2 decimais', () => {
      const field = caixaCnab400.detail!.abatimento

      expect(field.pos).toEqual([206, 218])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Dados do Sacado', () => {
    test('deve ter tipo de inscrição do sacado na posição 219-220', () => {
      const field = caixaCnab400.detail!.sacado_codigo_inscricao

      expect(field.pos).toEqual([219, 220])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter número de inscrição do sacado na posição 221-234', () => {
      const field = caixaCnab400.detail!.sacado_numero_inscricao

      expect(field.pos).toEqual([221, 234])
      expect(field.type).toBe('num')
      expect(field.size).toBe(14)
      expect(field.required).toBe(true)
    })

    test('deve ter nome do sacado na posição 235-274', () => {
      const field = caixaCnab400.detail!.nome

      expect(field.pos).toEqual([235, 274])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(true)
    })

    test('deve ter logradouro do sacado na posição 275-314', () => {
      const field = caixaCnab400.detail!.logradouro

      expect(field.pos).toEqual([275, 314])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
    })

    test('deve ter bairro do sacado na posição 315-326', () => {
      const field = caixaCnab400.detail!.bairro

      expect(field.pos).toEqual([315, 326])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(12)
      expect(field.required).toBe(false)
    })

    test('deve ter CEP do sacado na posição 327-334', () => {
      const field = caixaCnab400.detail!.cep

      expect(field.pos).toEqual([327, 334])
      expect(field.type).toBe('num')
      expect(field.size).toBe(8)
      expect(field.required).toBe(false)
    })

    test('deve ter cidade do sacado na posição 335-349', () => {
      const field = caixaCnab400.detail!.cidade

      expect(field.pos).toEqual([335, 349])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(15)
      expect(field.required).toBe(false)
    })

    test('deve ter estado do sacado na posição 350-351', () => {
      const field = caixaCnab400.detail!.estado

      expect(field.pos).toEqual([350, 351])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Multa e Beneficiário Final', () => {
    test('deve ter data de multa na posição 352-357', () => {
      const field = caixaCnab400.detail!.data_multa

      expect(field.pos).toEqual([352, 357])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(false)
    })

    test('deve ter valor de multa na posição 358-367', () => {
      const field = caixaCnab400.detail!.valor_multa

      expect(field.pos).toEqual([358, 367])
      expect(field.type).toBe('num')
      expect(field.size).toBe(10)
      expect(field.required).toBe(false)
    })

    test('deve ter sacador/avalista na posição 368-389 (particularidade: apenas 22 caracteres)', () => {
      const field = caixaCnab400.detail!.sacador_avalista

      expect(field.pos).toEqual([368, 389])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(22)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Campos Finais', () => {
    test('deve ter terceira instrução na posição 390-391', () => {
      const field = caixaCnab400.detail!.instrucao_3

      expect(field.pos).toEqual([390, 391])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter prazo na posição 392-393', () => {
      const field = caixaCnab400.detail!.prazo

      expect(field.pos).toEqual([392, 393])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter código da moeda na posição 394', () => {
      const field = caixaCnab400.detail!.codigo_moeda

      expect(field.pos).toEqual([394, 394])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = caixaCnab400.detail!.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })
})
