/**
 * Testes para Segmento P - Sicredi CNAB 240
 */

import { SICREDI_CNAB240_SEGMENT_P } from '../../../../../src/banks/sicredi/schemas/cnab240'

describe('Schema Sicredi CNAB 240 - Segmento P', () => {
  describe('Definição dos campos - Controle', () => {
    it('deve ter código do banco na posição 1-3 com padrão "748"', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '748',
      })
    })

    it('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '3',
      })
    })

    it('deve ter identificador do segmento "P" na posição 14', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.servico_segmento).toMatchObject({
        pos: [14, 14],
        pattern: 'P',
      })
    })

    it('deve ter código de movimento VARIÁVEL (não fixo) na posição 16-17', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.servico_codigo_movimento
      expect(campo.pos).toEqual([16, 17])
      expect(campo.pattern).toBeNull()
      expect(campo.required).toBe(true)
    })
  })

  describe('Campos do beneficiário/cedente', () => {
    it('deve ter agência do cedente na posição 18-22 (5 dígitos)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cedente_agencia).toMatchObject({
        pos: [18, 22],
        type: 'num',
        size: 5,
      })
    })

    it('deve ter conta do cedente na posição 24-35 (12 dígitos)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cedente_conta).toMatchObject({
        pos: [24, 35],
        type: 'num',
        size: 12,
      })
    })

    it('deve ter DV da conta na posição 36', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cedente_conta_dv).toMatchObject({
        pos: [36, 36],
        type: 'num',
        size: 1,
      })
    })

    it('DV da agência/cooperativa não deve ser preenchido (posição 23 e 37)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cedente_agencia_dv.required).toBe(false)
      expect(SICREDI_CNAB240_SEGMENT_P.cedente_dv_agencia_conta.required).toBe(false)
    })
  })

  describe('Nosso número', () => {
    it('deve ter nosso número na posição 38-46 (9 dígitos)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.nosso_numero).toMatchObject({
        pos: [38, 46],
        type: 'num',
        size: 9,
      })
    })

    it('deve ter complemento do nosso número na posição 47-57 (não usado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.nosso_numero_complemento
      expect(campo.pos).toEqual([47, 57])
      expect(campo.required).toBe(false)
    })

    it('descrição do nosso número deve mencionar o formato (AA B XXXXX D)', () => {
      const descricao = SICREDI_CNAB240_SEGMENT_P.nosso_numero.description
      expect(descricao).toContain('AA')
      expect(descricao).toContain('XXXXX')
    })
  })

  describe('Carteira e tipo de título', () => {
    it('deve ter carteira "1" (cobrança simples) na posição 58', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.carteira).toMatchObject({
        pos: [58, 58],
        pattern: '1',
      })
    })

    it('deve ter cadastramento "1" (com registro) na posição 59', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cadastramento).toMatchObject({
        pos: [59, 59],
        pattern: '1',
      })
    })

    it('deve ter tipo de documento na posição 60', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.tipo_documento).toMatchObject({
        pos: [60, 60],
        type: 'num',
        size: 1,
      })
    })

    it('deve ter emissão do boleto na posição 61', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.emissao_boleto).toMatchObject({
        pos: [61, 61],
        type: 'num',
        size: 1,
      })
    })

    it('deve ter distribuição do boleto na posição 62', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.distribuicao_boleto).toMatchObject({
        pos: [62, 62],
        type: 'num',
        size: 1,
      })
    })
  })

  describe('Seu número', () => {
    it('deve ter seu número na posição 63-77 (15 caracteres)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.seu_numero).toMatchObject({
        pos: [63, 77],
        type: 'alfa',
        size: 15,
      })
    })

    it('descrição deve mencionar que só 10 primeiras posições são validadas', () => {
      const descricao = SICREDI_CNAB240_SEGMENT_P.seu_numero.description
      expect(descricao).toContain('10')
      expect(descricao.toLowerCase()).toContain('063-072')
    })
  })

  describe('Vencimento e valor', () => {
    it('deve ter vencimento na posição 78-85 com formato DDMMAAAA', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.vencimento_titulo).toMatchObject({
        pos: [78, 85],
        dateFormat: 'DDMMAAAA',
      })
    })

    it('deve ter valor do título na posição 86-100 com 2 decimais', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.valor_titulo).toMatchObject({
        pos: [86, 100],
        type: 'num',
        size: 15,
        decimals: 2,
      })
    })

    it('valor do título deve ter descrição sobre decimais condicionais', () => {
      const descricao = SICREDI_CNAB240_SEGMENT_P.valor_titulo.description
      expect(descricao.toLowerCase()).toMatch(/condiciona(l|is)/)
      expect(descricao.toLowerCase()).toContain('moeda')
    })
  })

  describe('Agência cobradora', () => {
    it('deve ter agência cobradora na posição 101-105 (não usado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.agencia_cobradora
      expect(campo.pos).toEqual([101, 105])
      expect(campo.required).toBe(false)
    })

    it('DV da agência cobradora na posição 106 (não usado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.agencia_cobradora_dv
      expect(campo.pos).toEqual([106, 106])
      expect(campo.required).toBe(false)
    })
  })

  describe('Espécie e aceite', () => {
    it('deve ter espécie do título na posição 107-108', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.especie_titulo).toMatchObject({
        pos: [107, 108],
        type: 'num',
        size: 2,
      })
    })

    it('deve ter aceite na posição 109', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.aceite).toMatchObject({
        pos: [109, 109],
        type: 'alfa',
        size: 1,
      })
    })

    it('data de emissão na posição 110-117 com formato DDMMAAAA', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.data_emissao_titulo).toMatchObject({
        pos: [110, 117],
        dateFormat: 'DDMMAAAA',
      })
    })
  })

  describe('Juros de mora', () => {
    it('deve ter código de juros na posição 118', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.juros_mora_codigo).toMatchObject({
        pos: [118, 118],
        type: 'num',
        size: 1,
      })
    })

    it('deve ter data de juros na posição 119-126', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.juros_mora_data).toMatchObject({
        pos: [119, 126],
        dateFormat: 'DDMMAAAA',
      })
    })

    it('deve ter valor/taxa de juros na posição 127-141', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.juros_mora_valor).toMatchObject({
        pos: [127, 141],
        type: 'num',
        size: 15,
        decimals: 2,
      })
    })
  })

  describe('Desconto', () => {
    it('deve ter código de desconto na posição 142', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.desconto_codigo).toMatchObject({
        pos: [142, 142],
        type: 'num',
        size: 1,
      })
    })

    it('deve ter data de desconto na posição 143-150', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.desconto_data).toMatchObject({
        pos: [143, 150],
        dateFormat: 'DDMMAAAA',
      })
    })

    it('deve ter valor de desconto na posição 151-165', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.desconto_valor).toMatchObject({
        pos: [151, 165],
        type: 'num',
        size: 15,
        decimals: 2,
      })
    })
  })

  describe('IOF e abatimento', () => {
    it('deve ter valor de IOF na posição 166-180 (não utilizado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.iof_valor
      expect(campo.pos).toEqual([166, 180])
      expect(campo.required).toBe(false)
      expect(campo.description.toLowerCase()).toContain('000000000000000')
    })

    it('deve ter valor de abatimento na posição 181-195', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.abatimento_valor).toMatchObject({
        pos: [181, 195],
        type: 'num',
        size: 15,
        decimals: 2,
      })
    })
  })

  describe('Uso empresa', () => {
    it('deve ter uso empresa na posição 196-220 (25 caracteres)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.uso_empresa).toMatchObject({
        pos: [196, 220],
        type: 'alfa',
        size: 25,
      })
    })
  })

  describe('Protesto e baixa', () => {
    it('deve ter código de protesto na posição 221', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.protesto_codigo).toMatchObject({
        pos: [221, 221],
        type: 'num',
        size: 1,
      })
    })

    it('deve ter prazo para protesto na posição 222-223', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.protesto_prazo).toMatchObject({
        pos: [222, 223],
        type: 'num',
        size: 2,
      })
    })

    it('deve ter código de baixa "1" na posição 224', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.baixa_codigo).toMatchObject({
        pos: [224, 224],
        pattern: '1',
      })
    })

    it('deve ter prazo de baixa na posição 225-227 (não utilizado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.baixa_prazo
      expect(campo.pos).toEqual([225, 227])
      expect(campo.required).toBe(false)
    })
  })

  describe('Moeda e contrato', () => {
    it('deve ter código de moeda "09" (Real) na posição 228-229', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.moeda_codigo).toMatchObject({
        pos: [228, 229],
        pattern: '09',
      })
    })

    it('deve ter número de contrato na posição 230-239 (não utilizado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.contrato_numero
      expect(campo.pos).toEqual([230, 239])
      expect(campo.required).toBe(false)
    })

    it('deve ter campo CNAB exclusivo na posição 240', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cnab_exclusivo_2).toMatchObject({
        pos: [240, 240],
        type: 'alfa',
        size: 1,
      })
    })
  })

  describe('Validação de estrutura', () => {
    it('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      Object.entries(SICREDI_CNAB240_SEGMENT_P).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          expect(fieldDef.pos).toBeDefined()
          expect(fieldDef.type).toBeDefined()
          expect(fieldDef.size).toBeDefined()
          expect(fieldDef.pos.length).toBe(2)
          expect(fieldDef.pos[0]).toBeLessThanOrEqual(fieldDef.pos[1])
        },
      )
    })

    it('tamanhos declarados devem bater com as posições', () => {
      Object.entries(SICREDI_CNAB240_SEGMENT_P).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('não deve haver sobreposição de posições', () => {
      const campos = Object.entries(SICREDI_CNAB240_SEGMENT_P).map(
        ([name, def]: [string, any]) => ({
          name,
          start: def.pos[0],
          end: def.pos[1],
        }),
      )

      campos.sort((a, b) => a.start - b.start)

      for (let i = 0; i < campos.length - 1; i++) {
        const atual = campos[i]
        const proximo = campos[i + 1]
        expect(atual.end).toBeLessThan(proximo.start)
      }
    })

    it('deve cobrir todas as 240 posições', () => {
      const posicoesCoberta = new Set<number>()

      Object.values(SICREDI_CNAB240_SEGMENT_P).forEach((fieldDef: any) => {
        for (let pos = fieldDef.pos[0]; pos <= fieldDef.pos[1]; pos++) {
          posicoesCoberta.add(pos)
        }
      })

      expect(posicoesCoberta.size).toBe(240)
      expect(Math.min(...posicoesCoberta)).toBe(1)
      expect(Math.max(...posicoesCoberta)).toBe(240)
    })
  })
})
