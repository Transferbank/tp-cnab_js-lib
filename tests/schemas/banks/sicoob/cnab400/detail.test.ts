/**
 * Testes do Detalhe - Sicoob CNAB 400
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
 * Posições validadas conforme planilha oficial Sicoob (Layout_Cobranca_CNAB400 (1).xls, mai/2025).
 */

import { sicoobCnab400 } from '../../../../../src/banks/sicoob/schemas/cnab400'

describe('Schema Sicoob CNAB 400 - Detalhe (Definição)', () => {
  describe('Definição dos campos - Identificação e Beneficiário', () => {
    test('deve ter tipo_registro "1" (detalhe) na posição 1', () => {
      const field = sicoobCnab400.detail!.tipo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('1')
      expect(field.required).toBe(true)
    })

    test('deve ter tipo_inscricao_beneficiario na posição 2-3', () => {
      const field = sicoobCnab400.detail!.tipo_inscricao_beneficiario

      expect(field.pos).toEqual([2, 3])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter numero_inscricao_beneficiario na posição 4-17', () => {
      const field = sicoobCnab400.detail!.numero_inscricao_beneficiario

      expect(field.pos).toEqual([4, 17])
      expect(field.type).toBe('num')
      expect(field.size).toBe(14)
      expect(field.required).toBe(true)
    })

    test('deve ter prefixo_cooperativa na posição 18-21 (4 dígitos)', () => {
      const field = sicoobCnab400.detail!.prefixo_cooperativa

      expect(field.pos).toEqual([18, 21])
      expect(field.type).toBe('num')
      expect(field.size).toBe(4)
      expect(field.required).toBe(true)
    })

    test('deve ter dv_prefixo na posição 22', () => {
      const field = sicoobCnab400.detail!.dv_prefixo

      expect(field.pos).toEqual([22, 22])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
    })

    test('deve ter conta_corrente na posição 23-30', () => {
      const field = sicoobCnab400.detail!.conta_corrente

      expect(field.pos).toEqual([23, 30])
      expect(field.type).toBe('num')
      expect(field.size).toBe(8)
      expect(field.required).toBe(true)
    })

    test('deve ter dv_conta na posição 31', () => {
      const field = sicoobCnab400.detail!.dv_conta

      expect(field.pos).toEqual([31, 31])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
    })

    test('deve ter numero_convenio_cobranca na posição 32-37', () => {
      const field = sicoobCnab400.detail!.numero_convenio_cobranca

      expect(field.pos).toEqual([32, 37])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(false)
    })

    test('deve ter numero_controle_participante na posição 38-62', () => {
      const field = sicoobCnab400.detail!.numero_controle_participante

      expect(field.pos).toEqual([38, 62])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(25)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Nosso Número e Parcela', () => {
    test('deve ter nosso_numero na posição 63-74 (12 dígitos)', () => {
      const field = sicoobCnab400.detail!.nosso_numero

      expect(field.pos).toEqual([63, 74])
      expect(field.type).toBe('num')
      expect(field.size).toBe(12)
      expect(field.required).toBe(true)
      expect(field.description).toContain('10 dígitos + DV módulo 11')
    })

    test('deve ter numero_parcela na posição 75-76', () => {
      const field = sicoobCnab400.detail!.numero_parcela

      expect(field.pos).toEqual([75, 76])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.pattern).toBe('01')
      expect(field.required).toBe(false)
    })

    test('deve ter grupo_valor na posição 77-78', () => {
      const field = sicoobCnab400.detail!.grupo_valor

      expect(field.pos).toEqual([77, 78])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.pattern).toBe('00')
      expect(field.required).toBe(false)
    })

    test('deve ter brancos_1 na posição 79-81', () => {
      const field = sicoobCnab400.detail!.brancos_1

      expect(field.pos).toEqual([79, 81])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(3)
      expect(field.required).toBe(false)
    })

    test('deve ter indicativo_mensagem_sacador na posição 82', () => {
      const field = sicoobCnab400.detail!.indicativo_mensagem_sacador

      expect(field.pos).toEqual([82, 82])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
      expect(field.description).toContain('sacador/avalista')
    })

    test('deve ter prefixo_titulo na posição 83-85', () => {
      const field = sicoobCnab400.detail!.prefixo_titulo

      expect(field.pos).toEqual([83, 85])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(3)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Carteira e Controles', () => {
    test('deve ter variacao_carteira na posição 86-88', () => {
      const field = sicoobCnab400.detail!.variacao_carteira

      expect(field.pos).toEqual([86, 88])
      expect(field.type).toBe('num')
      expect(field.size).toBe(3)
      expect(field.pattern).toBe('000')
      expect(field.required).toBe(false)
    })

    test('deve ter conta_caucao na posição 89', () => {
      const field = sicoobCnab400.detail!.conta_caucao

      expect(field.pos).toEqual([89, 89])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.pattern).toBe('0')
      expect(field.required).toBe(false)
    })

    test('deve ter numero_contrato_garantia na posição 90-94', () => {
      const field = sicoobCnab400.detail!.numero_contrato_garantia

      expect(field.pos).toEqual([90, 94])
      expect(field.type).toBe('num')
      expect(field.size).toBe(5)
      expect(field.pattern).toBe('00000')
      expect(field.required).toBe(false)
    })

    test('deve ter dv_contrato na posição 95', () => {
      const field = sicoobCnab400.detail!.dv_contrato

      expect(field.pos).toEqual([95, 95])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.pattern).toBe('0')
      expect(field.required).toBe(false)
    })

    test('deve ter numero_bordero na posição 96-101', () => {
      const field = sicoobCnab400.detail!.numero_bordero

      expect(field.pos).toEqual([96, 101])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(false)
    })

    test('deve ter brancos_2 na posição 102-105', () => {
      const field = sicoobCnab400.detail!.brancos_2

      expect(field.pos).toEqual([102, 105])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(4)
      expect(field.required).toBe(false)
    })

    test('deve ter tipo_emissao na posição 106', () => {
      const field = sicoobCnab400.detail!.tipo_emissao

      expect(field.pos).toEqual([106, 106])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter carteira_modalidade na posição 107-108', () => {
      const field = sicoobCnab400.detail!.carteira_modalidade

      expect(field.pos).toEqual([107, 108])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(true)
    })
  })

  describe('Definição dos campos - Comando e Dados do Título', () => {
    test('deve ter comando_movimento na posição 109-110', () => {
      const field = sicoobCnab400.detail!.comando_movimento

      expect(field.pos).toEqual([109, 110])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter numero_documento na posição 111-120', () => {
      const field = sicoobCnab400.detail!.numero_documento

      expect(field.pos).toEqual([111, 120])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(10)
      expect(field.required).toBe(true)
    })

    test('deve ter vencimento na posição 121-126 com formato DDMMAA', () => {
      const field = sicoobCnab400.detail!.vencimento

      expect(field.pos).toEqual([121, 126])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(true)
      expect(field.description).toContain('888888')
      expect(field.description).toContain('999999')
    })

    test('deve ter valor_titulo na posição 127-139 com 2 decimais', () => {
      const field = sicoobCnab400.detail!.valor_titulo

      expect(field.pos).toEqual([127, 139])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter numero_banco na posição 140-142 com padrão "756"', () => {
      const field = sicoobCnab400.detail!.numero_banco

      expect(field.pos).toEqual([140, 142])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('756')
      expect(field.required).toBe(true)
    })

    test('deve ter prefixo_cooperativa_cobradora na posição 143-146', () => {
      const field = sicoobCnab400.detail!.prefixo_cooperativa_cobradora

      expect(field.pos).toEqual([143, 146])
      expect(field.type).toBe('num')
      expect(field.size).toBe(4)
      expect(field.required).toBe(false)
    })

    test('deve ter dv_prefixo_cobradora na posição 147', () => {
      const field = sicoobCnab400.detail!.dv_prefixo_cobradora

      expect(field.pos).toEqual([147, 147])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter especie_titulo na posição 148-149', () => {
      const field = sicoobCnab400.detail!.especie_titulo

      expect(field.pos).toEqual([148, 149])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter aceite na posição 150 (dígito 0/1, não letra N/A)', () => {
      const field = sicoobCnab400.detail!.aceite

      expect(field.pos).toEqual([150, 150])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
      expect(field.description).toContain('0=sem aceite')
      expect(field.description).toContain('1=com aceite')
    })

    test('deve ter data_emissao na posição 151-156 com formato DDMMAA', () => {
      const field = sicoobCnab400.detail!.data_emissao

      expect(field.pos).toEqual([151, 156])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Instruções e Taxas', () => {
    test('deve ter instrucao_1 na posição 157-158', () => {
      const field = sicoobCnab400.detail!.instrucao_1

      expect(field.pos).toEqual([157, 158])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
      expect(field.description).toContain('trailer')
    })

    test('deve ter instrucao_2 na posição 159-160', () => {
      const field = sicoobCnab400.detail!.instrucao_2

      expect(field.pos).toEqual([159, 160])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
      expect(field.description).toContain('trailer')
    })

    test('deve ter taxa_mora_mes na posição 161-166 com 4 decimais', () => {
      const field = sicoobCnab400.detail!.taxa_mora_mes

      expect(field.pos).toEqual([161, 166])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.decimals).toBe(4)
      expect(field.required).toBe(false)
    })

    test('deve ter taxa_multa na posição 167-172 com 4 decimais', () => {
      const field = sicoobCnab400.detail!.taxa_multa

      expect(field.pos).toEqual([167, 172])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.decimals).toBe(4)
      expect(field.required).toBe(false)
    })

    test('deve ter tipo_distribuicao na posição 173', () => {
      const field = sicoobCnab400.detail!.tipo_distribuicao

      expect(field.pos).toEqual([173, 173])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Descontos e IOF', () => {
    test('deve ter data_primeiro_desconto na posição 174-179', () => {
      const field = sicoobCnab400.detail!.data_primeiro_desconto

      expect(field.pos).toEqual([174, 179])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(false)
    })

    test('deve ter valor_primeiro_desconto na posição 180-192 com 2 decimais', () => {
      const field = sicoobCnab400.detail!.valor_primeiro_desconto

      expect(field.pos).toEqual([180, 192])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter codigo_moeda_valor_iof_ou_qtde_moeda na posição 193-205 (campo composto)', () => {
      const field = sicoobCnab400.detail!.codigo_moeda_valor_iof_ou_qtde_moeda

      expect(field.pos).toEqual([193, 205])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
      expect(field.description).toContain('composto')
      expect(field.description).toContain('IOF')
    })

    test('deve ter valor_abatimento na posição 206-218 com 2 decimais', () => {
      const field = sicoobCnab400.detail!.valor_abatimento

      expect(field.pos).toEqual([206, 218])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Dados do Pagador (Sacado)', () => {
    test('deve ter sacado_codigo_inscricao na posição 219-220', () => {
      const field = sicoobCnab400.detail!.sacado_codigo_inscricao

      expect(field.pos).toEqual([219, 220])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter sacado_numero_inscricao na posição 221-234', () => {
      const field = sicoobCnab400.detail!.sacado_numero_inscricao

      expect(field.pos).toEqual([221, 234])
      expect(field.type).toBe('num')
      expect(field.size).toBe(14)
      expect(field.required).toBe(true)
    })

    test('deve ter nome na posição 235-274', () => {
      const field = sicoobCnab400.detail!.nome

      expect(field.pos).toEqual([235, 274])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(true)
    })

    test('deve ter logradouro na posição 275-311 (37 caracteres, não 40)', () => {
      const field = sicoobCnab400.detail!.logradouro

      expect(field.pos).toEqual([275, 311])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(37)
      expect(field.required).toBe(false)
      expect(field.description).toContain('37 chars')
    })

    test('deve ter bairro na posição 312-326', () => {
      const field = sicoobCnab400.detail!.bairro

      expect(field.pos).toEqual([312, 326])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(15)
      expect(field.required).toBe(false)
    })

    test('deve ter cep na posição 327-334', () => {
      const field = sicoobCnab400.detail!.cep

      expect(field.pos).toEqual([327, 334])
      expect(field.type).toBe('num')
      expect(field.size).toBe(8)
      expect(field.required).toBe(false)
    })

    test('deve ter cidade na posição 335-349', () => {
      const field = sicoobCnab400.detail!.cidade

      expect(field.pos).toEqual([335, 349])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(15)
      expect(field.required).toBe(false)
    })

    test('deve ter estado na posição 350-351', () => {
      const field = sicoobCnab400.detail!.estado

      expect(field.pos).toEqual([350, 351])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Observações e Finais', () => {
    test('deve ter observacoes_mensagem_ou_sacador_avalista na posição 352-391', () => {
      const field = sicoobCnab400.detail!.observacoes_mensagem_ou_sacador_avalista

      expect(field.pos).toEqual([352, 391])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
      expect(field.description).toContain('condicional')
    })

    test('deve ter dias_protesto na posição 392-393', () => {
      const field = sicoobCnab400.detail!.dias_protesto

      expect(field.pos).toEqual([392, 393])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter brancos_3 na posição 394', () => {
      const field = sicoobCnab400.detail!.brancos_3

      expect(field.pos).toEqual([394, 394])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter numero_sequencial na posição 395-400', () => {
      const field = sicoobCnab400.detail!.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })

  describe('Características específicas do Sicoob', () => {
    const detail = sicoobCnab400.detail!

    test('deve ter 54 campos no total', () => {
      const campos = Object.keys(detail)
      expect(campos.length).toBe(54)
    })

    test('logradouro deve ter descrição mencionando particularidade de 37 caracteres', () => {
      expect(detail.logradouro.description).toContain('37')
    })

    test('aceite deve usar dígito (tipo num), não letra (tipo alfa)', () => {
      expect(detail.aceite.type).toBe('num')
      expect(detail.aceite.description).not.toContain('N/A')
      expect(detail.aceite.description).toContain('0=')
      expect(detail.aceite.description).toContain('1=')
    })

    test('vencimento deve mencionar valores especiais 888888 e 999999', () => {
      expect(detail.vencimento.description).toContain('888888')
      expect(detail.vencimento.description).toContain('999999')
    })

    test('nosso_numero deve ter descrição mencionando 10 dígitos + DV módulo 11', () => {
      expect(detail.nosso_numero.description).toContain('10 dígitos')
      expect(detail.nosso_numero.description).toContain('DV módulo 11')
    })

    test('instrucao_1 e instrucao_2 devem mencionar habilitação de mensagens no trailer', () => {
      expect(detail.instrucao_1.description).toContain('trailer')
      expect(detail.instrucao_2.description).toContain('trailer')
    })

    test('campos de taxa devem ter 4 decimais (não 2 como valores monetários)', () => {
      expect(detail.taxa_mora_mes.decimals).toBe(4)
      expect(detail.taxa_multa.decimals).toBe(4)
    })

    test('codigo_moeda_valor_iof_ou_qtde_moeda deve ter descrição mencionando composição', () => {
      expect(detail.codigo_moeda_valor_iof_ou_qtde_moeda.description).toContain('composto')
      expect(detail.codigo_moeda_valor_iof_ou_qtde_moeda.description).toContain('1 dígito')
    })

    test('campos obrigatórios devem incluir identificação, título e pagador', () => {
      expect(detail.tipo_registro.required).toBe(true)
      expect(detail.tipo_inscricao_beneficiario.required).toBe(true)
      expect(detail.numero_inscricao_beneficiario.required).toBe(true)
      expect(detail.nosso_numero.required).toBe(true)
      expect(detail.comando_movimento.required).toBe(true)
      expect(detail.numero_documento.required).toBe(true)
      expect(detail.vencimento.required).toBe(true)
      expect(detail.valor_titulo.required).toBe(true)
      expect(detail.sacado_codigo_inscricao.required).toBe(true)
      expect(detail.sacado_numero_inscricao.required).toBe(true)
      expect(detail.nome.required).toBe(true)
      expect(detail.numero_sequencial.required).toBe(true)
    })
  })
})
