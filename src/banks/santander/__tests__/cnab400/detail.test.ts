/**
 * Testes do Schema Santander CNAB 400 - Detalhe (Definição)
 *
 * Valida apenas a estrutura do schema (posições, tipos, tamanhos).
 * Testes com dados reais estão em detail.real-data.test.ts
 */

import { santanderCnab400 } from '@banks/santander/schemas/cnab400'

describe('Schema Santander CNAB 400 - Detalhe (Definição)', () => {
  const detail = santanderCnab400.detail!

  describe('Identificação e controle', () => {
    test('deve ter tipo de registro "1" (detalhe) na posição 1', () => {
      expect(detail.tipo_registro).toBeDefined()
      expect(detail.tipo_registro.pos).toEqual([1, 1])
      expect(detail.tipo_registro.type).toBe('num')
      expect(detail.tipo_registro.pattern).toBe('1')
    })

    test('deve ter código de inscrição do cedente na posição 2-3', () => {
      expect(detail.codigo_inscricao).toBeDefined()
      expect(detail.codigo_inscricao.pos).toEqual([2, 3])
      expect(detail.codigo_inscricao.type).toBe('num')
      expect(detail.codigo_inscricao.size).toBe(2)
    })

    test('deve ter número de inscrição do cedente na posição 4-17', () => {
      expect(detail.numero_inscricao).toBeDefined()
      expect(detail.numero_inscricao.pos).toEqual([4, 17])
      expect(detail.numero_inscricao.type).toBe('num')
      expect(detail.numero_inscricao.size).toBe(14)
    })

    test('deve ter código de transmissão na posição 18-37', () => {
      expect(detail.codigo_transmissao).toBeDefined()
      expect(detail.codigo_transmissao.pos).toEqual([18, 37])
      expect(detail.codigo_transmissao.type).toBe('alfa')
      expect(detail.codigo_transmissao.size).toBe(20)
    })

    test('deve ter número de controle na posição 38-62', () => {
      expect(detail.numero_controle).toBeDefined()
      expect(detail.numero_controle.pos).toEqual([38, 62])
      expect(detail.numero_controle.type).toBe('alfa')
      expect(detail.numero_controle.size).toBe(25)
    })

    test('deve ter nosso número na posição 63-70', () => {
      expect(detail.nosso_numero).toBeDefined()
      expect(detail.nosso_numero.pos).toEqual([63, 70])
      expect(detail.nosso_numero.type).toBe('num')
      expect(detail.nosso_numero.size).toBe(8)
    })
  })

  describe('Descontos e multas', () => {
    test('deve ter data do segundo desconto na posição 71-76', () => {
      expect(detail.data_seg_desconto).toBeDefined()
      expect(detail.data_seg_desconto.pos).toEqual([71, 76])
      expect(detail.data_seg_desconto.type).toBe('data')
      expect(detail.data_seg_desconto.dateFormat).toBe('DDMMAA')
    })

    test('deve ter código de multa na posição 78', () => {
      expect(detail.codigo_multa).toBeDefined()
      expect(detail.codigo_multa.pos).toEqual([78, 78])
      expect(detail.codigo_multa.type).toBe('num')
      expect(detail.codigo_multa.size).toBe(1)
    })

    test('deve ter percentual de multa na posição 79-82 com 2 decimais', () => {
      expect(detail.percentual_multa).toBeDefined()
      expect(detail.percentual_multa.pos).toEqual([79, 82])
      expect(detail.percentual_multa.type).toBe('num')
      expect(detail.percentual_multa.size).toBe(4)
      expect(detail.percentual_multa.decimals).toBe(2)
    })

    test('deve ter unidade de valor na posição 83-84', () => {
      expect(detail.unidade_valor).toBeDefined()
      expect(detail.unidade_valor.pos).toEqual([83, 84])
      expect(detail.unidade_valor.type).toBe('num')
      expect(detail.unidade_valor.size).toBe(2)
    })

    test('deve ter valor em outra unidade na posição 85-97 com 2 decimais', () => {
      expect(detail.valor_outra_unidade).toBeDefined()
      expect(detail.valor_outra_unidade.pos).toEqual([85, 97])
      expect(detail.valor_outra_unidade.type).toBe('num')
      expect(detail.valor_outra_unidade.decimals).toBe(2)
    })

    test('deve ter data da multa na posição 102-107', () => {
      expect(detail.data_multa).toBeDefined()
      expect(detail.data_multa.pos).toEqual([102, 107])
      expect(detail.data_multa.type).toBe('data')
      expect(detail.data_multa.dateFormat).toBe('DDMMAA')
    })
  })

  describe('Carteira e ocorrência', () => {
    test('deve ter carteira na posição 108', () => {
      expect(detail.carteira).toBeDefined()
      expect(detail.carteira.pos).toEqual([108, 108])
      expect(detail.carteira.type).toBe('num')
      expect(detail.carteira.size).toBe(1)
      expect(detail.carteira.required).toBe(true)
    })

    test('deve ter código de ocorrência na posição 109-110', () => {
      expect(detail.codigo_ocorrencia).toBeDefined()
      expect(detail.codigo_ocorrencia.pos).toEqual([109, 110])
      expect(detail.codigo_ocorrencia.type).toBe('num')
      expect(detail.codigo_ocorrencia.size).toBe(2)
      expect(detail.codigo_ocorrencia.required).toBe(true)
    })
  })

  describe('Dados do título', () => {
    test('deve ter número do documento na posição 111-120', () => {
      expect(detail.numero_documento).toBeDefined()
      expect(detail.numero_documento.pos).toEqual([111, 120])
      expect(detail.numero_documento.type).toBe('alfa')
      expect(detail.numero_documento.size).toBe(10)
    })

    test('deve ter vencimento na posição 121-126 com formato DDMMAA', () => {
      expect(detail.vencimento).toBeDefined()
      expect(detail.vencimento.pos).toEqual([121, 126])
      expect(detail.vencimento.type).toBe('data')
      expect(detail.vencimento.dateFormat).toBe('DDMMAA')
      expect(detail.vencimento.required).toBe(true)
    })

    test('deve ter valor do título na posição 127-139 com 2 decimais', () => {
      expect(detail.valor_titulo).toBeDefined()
      expect(detail.valor_titulo.pos).toEqual([127, 139])
      expect(detail.valor_titulo.type).toBe('num')
      expect(detail.valor_titulo.size).toBe(13)
      expect(detail.valor_titulo.decimals).toBe(2)
      expect(detail.valor_titulo.required).toBe(true)
    })

    test('deve ter código do banco cobrador na posição 140-142', () => {
      expect(detail.codigo_banco_cobrador).toBeDefined()
      expect(detail.codigo_banco_cobrador.pos).toEqual([140, 142])
      expect(detail.codigo_banco_cobrador.type).toBe('num')
      expect(detail.codigo_banco_cobrador.size).toBe(3)
    })

    test('deve ter agência cobradora na posição 143-147', () => {
      expect(detail.agencia_cobradora).toBeDefined()
      expect(detail.agencia_cobradora.pos).toEqual([143, 147])
      expect(detail.agencia_cobradora.type).toBe('num')
      expect(detail.agencia_cobradora.size).toBe(5)
    })

    test('deve ter espécie na posição 148-149', () => {
      expect(detail.especie).toBeDefined()
      expect(detail.especie.pos).toEqual([148, 149])
      expect(detail.especie.type).toBe('num')
      expect(detail.especie.size).toBe(2)
    })

    test('deve ter aceite na posição 150', () => {
      expect(detail.aceite).toBeDefined()
      expect(detail.aceite.pos).toEqual([150, 150])
      expect(detail.aceite.type).toBe('alfa')
      expect(detail.aceite.size).toBe(1)
    })

    test('deve ter data de emissão na posição 151-156 com formato DDMMAA', () => {
      expect(detail.data_emissao).toBeDefined()
      expect(detail.data_emissao.pos).toEqual([151, 156])
      expect(detail.data_emissao.type).toBe('data')
      expect(detail.data_emissao.dateFormat).toBe('DDMMAA')
      expect(detail.data_emissao.required).toBe(true)
    })
  })

  describe('Instruções e valores financeiros', () => {
    test('deve ter primeira instrução na posição 157-158', () => {
      expect(detail.instrucao1).toBeDefined()
      expect(detail.instrucao1.pos).toEqual([157, 158])
      expect(detail.instrucao1.type).toBe('num')
      expect(detail.instrucao1.size).toBe(2)
    })

    test('deve ter segunda instrução na posição 159-160', () => {
      expect(detail.instrucao2).toBeDefined()
      expect(detail.instrucao2.pos).toEqual([159, 160])
      expect(detail.instrucao2.type).toBe('num')
      expect(detail.instrucao2.size).toBe(2)
    })

    test('deve ter juros de mora na posição 161-173 com 2 decimais', () => {
      expect(detail.juros_mora).toBeDefined()
      expect(detail.juros_mora.pos).toEqual([161, 173])
      expect(detail.juros_mora.type).toBe('num')
      expect(detail.juros_mora.size).toBe(13)
      expect(detail.juros_mora.decimals).toBe(2)
    })

    test('deve ter data limite de desconto na posição 174-179', () => {
      expect(detail.desconto_ate).toBeDefined()
      expect(detail.desconto_ate.pos).toEqual([174, 179])
      expect(detail.desconto_ate.type).toBe('data')
      expect(detail.desconto_ate.dateFormat).toBe('DDMMAA')
    })

    test('deve ter valor do desconto na posição 180-192 com 2 decimais', () => {
      expect(detail.valor_desconto).toBeDefined()
      expect(detail.valor_desconto.pos).toEqual([180, 192])
      expect(detail.valor_desconto.type).toBe('num')
      expect(detail.valor_desconto.decimals).toBe(2)
    })

    test('deve ter valor do IOF na posição 193-205 com 2 decimais', () => {
      expect(detail.valor_iof).toBeDefined()
      expect(detail.valor_iof.pos).toEqual([193, 205])
      expect(detail.valor_iof.type).toBe('num')
      expect(detail.valor_iof.decimals).toBe(2)
    })

    test('deve ter valor do abatimento na posição 206-218 com 2 decimais', () => {
      expect(detail.valor_abatimento).toBeDefined()
      expect(detail.valor_abatimento.pos).toEqual([206, 218])
      expect(detail.valor_abatimento.type).toBe('num')
      expect(detail.valor_abatimento.decimals).toBe(2)
    })
  })

  describe('Dados do sacado', () => {
    test('deve ter tipo de inscrição do sacado na posição 219-220', () => {
      expect(detail.sacado_codigo_inscricao).toBeDefined()
      expect(detail.sacado_codigo_inscricao.pos).toEqual([219, 220])
      expect(detail.sacado_codigo_inscricao.type).toBe('num')
      expect(detail.sacado_codigo_inscricao.size).toBe(2)
      expect(detail.sacado_codigo_inscricao.required).toBe(true)
    })

    test('deve ter número de inscrição (CPF/CNPJ) do sacado na posição 221-234', () => {
      expect(detail.sacado_numero_inscricao).toBeDefined()
      expect(detail.sacado_numero_inscricao.pos).toEqual([221, 234])
      expect(detail.sacado_numero_inscricao.type).toBe('num')
      expect(detail.sacado_numero_inscricao.size).toBe(14)
      expect(detail.sacado_numero_inscricao.required).toBe(true)
    })

    test('deve ter nome do sacado na posição 235-274', () => {
      expect(detail.nome).toBeDefined()
      expect(detail.nome.pos).toEqual([235, 274])
      expect(detail.nome.type).toBe('alfa')
      expect(detail.nome.size).toBe(40)
      expect(detail.nome.required).toBe(true)
    })

    test('deve ter endereço do sacado na posição 275-314', () => {
      expect(detail.logradouro).toBeDefined()
      expect(detail.logradouro.pos).toEqual([275, 314])
      expect(detail.logradouro.type).toBe('alfa')
      expect(detail.logradouro.size).toBe(40)
    })

    test('deve ter bairro na posição 315-326', () => {
      expect(detail.bairro).toBeDefined()
      expect(detail.bairro.pos).toEqual([315, 326])
      expect(detail.bairro.type).toBe('alfa')
      expect(detail.bairro.size).toBe(12)
    })

    test('deve ter CEP do sacado na posição 327-334', () => {
      expect(detail.cep).toBeDefined()
      expect(detail.cep.pos).toEqual([327, 334])
      expect(detail.cep.type).toBe('num')
      expect(detail.cep.size).toBe(8)
    })

    test('deve ter cidade na posição 335-349', () => {
      expect(detail.cidade).toBeDefined()
      expect(detail.cidade.pos).toEqual([335, 349])
      expect(detail.cidade.type).toBe('alfa')
      expect(detail.cidade.size).toBe(15)
    })

    test('deve ter estado (UF) na posição 350-351', () => {
      expect(detail.estado).toBeDefined()
      expect(detail.estado.pos).toEqual([350, 351])
      expect(detail.estado.type).toBe('alfa')
      expect(detail.estado.size).toBe(2)
    })
  })

  describe('Sacador/avalista e complementos', () => {
    test('deve ter sacador/avalista na posição 352-381', () => {
      expect(detail.sacador_avalista).toBeDefined()
      expect(detail.sacador_avalista.pos).toEqual([352, 381])
      expect(detail.sacador_avalista.type).toBe('alfa')
      expect(detail.sacador_avalista.size).toBe(30)
    })

    test('deve ter identificação de complemento na posição 383', () => {
      expect(detail.id_complemento).toBeDefined()
      expect(detail.id_complemento.pos).toEqual([383, 383])
      expect(detail.id_complemento.type).toBe('alfa')
      expect(detail.id_complemento.size).toBe(1)
    })

    test('deve ter complemento da conta na posição 384-385', () => {
      expect(detail.complemento_conta).toBeDefined()
      expect(detail.complemento_conta.pos).toEqual([384, 385])
      expect(detail.complemento_conta.type).toBe('alfa')
      expect(detail.complemento_conta.size).toBe(2)
    })

    test('deve ter prazo na posição 392-393', () => {
      expect(detail.prazo).toBeDefined()
      expect(detail.prazo.pos).toEqual([392, 393])
      expect(detail.prazo.type).toBe('num')
      expect(detail.prazo.size).toBe(2)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(detail.numero_sequencial).toBeDefined()
      expect(detail.numero_sequencial.pos).toEqual([395, 400])
      expect(detail.numero_sequencial.type).toBe('num')
      expect(detail.numero_sequencial.size).toBe(6)
      expect(detail.numero_sequencial.required).toBe(true)
    })
  })
})
