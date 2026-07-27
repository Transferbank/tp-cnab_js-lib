/**
 * Testes do Detalhe - Bradesco CNAB 400
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
 * Para testes contra arquivo real, ver: detail.real-data.test.ts
 *
 * Posições validadas cruzando brcobranca (Ruby) e cnab_yaml (YAML), duas fontes
 * independentes que concordam byte a byte.
 */

import { bradescoCnab400 } from '../../../../../src/banks/bradesco/schemas/cnab400'

describe('Schema Bradesco CNAB 400 - Detalhe (Definição)', () => {
  describe('Definição dos campos - Identificação', () => {
    test('deve ter tipo de registro "1" (detalhe) na posição 1', () => {
      const field = bradescoCnab400.detail!.tipo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('1')
      expect(field.required).toBe(true)
    })

    test('deve ter agência de débito na posição 2-6', () => {
      const field = bradescoCnab400.detail!.agencia_debito

      expect(field.pos).toEqual([2, 6])
      expect(field.type).toBe('num')
      expect(field.size).toBe(5)
      expect(field.required).toBe(false)
    })

    test('deve ter dígito verificador da agência de débito na posição 7', () => {
      const field = bradescoCnab400.detail!.agencia_debito_dv

      expect(field.pos).toEqual([7, 7])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter conta corrente na posição 13-19', () => {
      const field = bradescoCnab400.detail!.conta_corrente

      expect(field.pos).toEqual([13, 19])
      expect(field.type).toBe('num')
      expect(field.size).toBe(7)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Identificação da Empresa', () => {
    test('deve ter zero fixo na posição 21', () => {
      const field = bradescoCnab400.detail!.zeros_1

      expect(field.pos).toEqual([21, 21])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('0')
      expect(field.required).toBe(true)
    })

    test('deve ter código da carteira na posição 22-24', () => {
      const field = bradescoCnab400.detail!.carteira_codigo

      expect(field.pos).toEqual([22, 24])
      expect(field.type).toBe('num')
      expect(field.size).toBe(3)
      expect(field.required).toBe(true)
    })

    test('deve ter agência do cedente na posição 25-29', () => {
      const field = bradescoCnab400.detail!.agencia_cedente

      expect(field.pos).toEqual([25, 29])
      expect(field.type).toBe('num')
      expect(field.size).toBe(5)
      expect(field.required).toBe(true)
    })

    test('deve ter conta do cedente na posição 30-36', () => {
      const field = bradescoCnab400.detail!.conta_cedente

      expect(field.pos).toEqual([30, 36])
      expect(field.type).toBe('num')
      expect(field.size).toBe(7)
      expect(field.required).toBe(true)
    })

    test('deve ter dígito verificador da conta do cedente na posição 37', () => {
      const field = bradescoCnab400.detail!.conta_cedente_dv

      expect(field.pos).toEqual([37, 37])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
    })
  })

  describe('Definição dos campos - Nosso Número', () => {
    test('deve ter número de controle da empresa na posição 38-62', () => {
      const field = bradescoCnab400.detail!.numero_controle_empresa

      expect(field.pos).toEqual([38, 62])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(25)
      expect(field.required).toBe(false)
    })

    test('deve ter código do banco (débito automático) na posição 63-65, condicional (não fixo)', () => {
      const field = bradescoCnab400.detail!.codigo_banco

      expect(field.pos).toEqual([63, 65])
      expect(field.type).toBe('num')
      // Não pode ter padrao fixo: manual 2022 diz '237' se débito automático
      // contratado, '000' caso contrário — travar em '000' rejeitaria remessas reais.
      expect(field.pattern).toBeNull()
      expect(field.required).toBe(true)
      expect(field.description).toContain('237')
      expect(field.description).toContain('000')
    })

    test('deve ter indicador de multa na posição 66', () => {
      const field = bradescoCnab400.detail!.multa_indicador

      expect(field.pos).toEqual([66, 66])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('0')
      expect(field.required).toBe(false)
    })

    test('deve ter percentual de multa na posição 67-70', () => {
      const field = bradescoCnab400.detail!.multa_percentual

      expect(field.pos).toEqual([67, 70])
      expect(field.type).toBe('num')
      expect(field.size).toBe(4)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter nosso número na posição 71-81', () => {
      const field = bradescoCnab400.detail!.nosso_numero

      expect(field.pos).toEqual([71, 81])
      expect(field.type).toBe('num')
      expect(field.size).toBe(11)
      expect(field.required).toBe(true)
    })

    test('deve ter dígito verificador do nosso número na posição 82', () => {
      const field = bradescoCnab400.detail!.nosso_numero_dv

      expect(field.pos).toEqual([82, 82])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
    })
  })

  describe('Definição dos campos - Dados do Título', () => {
    test('deve ter código de ocorrência na posição 109-110, sem valor fixo (varia por título)', () => {
      const field = bradescoCnab400.detail!.codigo_ocorrencia

      expect(field.pos).toEqual([109, 110])
      expect(field.type).toBe('num')
      // Não tem `padrao` fixo: um arquivo real mistura 01/02/04/06 entre os detalhes
      // (ver tests/fixtures/cnab400/bradesco/remessa-multipla.txt), então não pode ser
      // tratado como "único valor legal" — só precisa estar presente (obrigatorio).
      expect(field.pattern).toBeNull()
      expect(field.required).toBe(true)
    })

    test('deve ter número do documento na posição 111-120 (10 posições)', () => {
      const field = bradescoCnab400.detail!.numero_documento

      expect(field.pos).toEqual([111, 120])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(10)
      expect(field.required).toBe(true)
    })

    test('deve ter vencimento na posição 121-126 com formato DDMMAA', () => {
      const field = bradescoCnab400.detail!.vencimento

      expect(field.pos).toEqual([121, 126])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(true)
    })

    test('deve ter valor do título na posição 127-139 com 2 decimais', () => {
      const field = bradescoCnab400.detail!.valor_titulo

      expect(field.pos).toEqual([127, 139])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter espécie do título na posição 148-149', () => {
      const field = bradescoCnab400.detail!.especie_titulo

      expect(field.pos).toEqual([148, 149])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('01')
      expect(field.required).toBe(true)
    })

    test('deve ter aceite na posição 150', () => {
      const field = bradescoCnab400.detail!.aceite

      expect(field.pos).toEqual([150, 150])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('N')
      expect(field.required).toBe(true)
    })

    test('deve ter data de emissão na posição 151-156 com formato DDMMAA', () => {
      const field = bradescoCnab400.detail!.data_emissao

      expect(field.pos).toEqual([151, 156])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(true)
    })
  })

  describe('Definição dos campos - Instruções e Valores', () => {
    test('deve ter primeira instrução na posição 157-158', () => {
      const field = bradescoCnab400.detail!.instrucao_1

      expect(field.pos).toEqual([157, 158])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('00')
      expect(field.required).toBe(false)
    })

    test('deve ter segunda instrução na posição 159-160', () => {
      const field = bradescoCnab400.detail!.instrucao_2

      expect(field.pos).toEqual([159, 160])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('00')
      expect(field.required).toBe(false)
    })

    test('deve ter juros de mora (campo único) na posição 161-173', () => {
      const field = bradescoCnab400.detail!.juros_mora

      expect(field.pos).toEqual([161, 173])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter data limite para desconto na posição 174-179', () => {
      const field = bradescoCnab400.detail!.desconto_data_limite

      expect(field.pos).toEqual([174, 179])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(false)
    })

    test('deve ter valor do desconto na posição 180-192', () => {
      const field = bradescoCnab400.detail!.desconto_valor

      expect(field.pos).toEqual([180, 192])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter valor do IOF na posição 193-205', () => {
      const field = bradescoCnab400.detail!.iof_valor

      expect(field.pos).toEqual([193, 205])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter valor do abatimento na posição 206-218', () => {
      const field = bradescoCnab400.detail!.abatimento_valor

      expect(field.pos).toEqual([206, 218])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })
  })

  describe('Definição dos campos - Dados do Sacado', () => {
    test('deve ter tipo de inscrição do sacado na posição 219-220', () => {
      const field = bradescoCnab400.detail!.sacado_codigo_inscricao

      expect(field.pos).toEqual([219, 220])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter número de inscrição (CPF/CNPJ) na posição 221-234', () => {
      const field = bradescoCnab400.detail!.sacado_numero_inscricao

      expect(field.pos).toEqual([221, 234])
      expect(field.type).toBe('num')
      expect(field.size).toBe(14)
      expect(field.required).toBe(true)
    })

    test('deve ter nome do sacado na posição 235-274', () => {
      const field = bradescoCnab400.detail!.nome

      expect(field.pos).toEqual([235, 274])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(true)
    })

    test('deve ter endereço do sacado na posição 275-314', () => {
      const field = bradescoCnab400.detail!.logradouro

      expect(field.pos).toEqual([275, 314])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
    })

    test('deve ter CEP do sacado na posição 327-334', () => {
      const field = bradescoCnab400.detail!.cep

      expect(field.pos).toEqual([327, 334])
      expect(field.type).toBe('num')
      expect(field.size).toBe(8)
      expect(field.required).toBe(false)
    })

    test('deve ter sacador/avalista ou 2ª mensagem na posição 335-394', () => {
      const field = bradescoCnab400.detail!.sacador_avalista

      expect(field.pos).toEqual([335, 394])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(60)
      expect(field.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = bradescoCnab400.detail!.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })
})
