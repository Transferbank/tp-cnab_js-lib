/**
 * Testes para Segmento P - Sicredi CNAB 240
 */

import { SICREDI_CNAB240_SEGMENT_P } from '@banks/sicredi/schemas/cnab240'
import { FieldType, DateFormat } from '@tp-types/index'

describe('Schema Sicredi CNAB 240 - Segmento P', () => {
  describe('Defini��o dos campos - Controle', () => {
    it('deve ter c�digo do banco na posi��o 1-3 com padr�o "748"', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '748',
      })
    })

    it('deve ter tipo de registro "3" (detalhe) na posi��o 8', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '3',
      })
    })

    it('deve ter identificador do segmento "P" na posi��o 14', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.servico_segmento).toMatchObject({
        pos: [14, 14],
        pattern: 'P',
      })
    })

    it('deve ter c�digo de movimento VARI�VEL (n�o fixo) na posi��o 16-17', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.servico_codigo_movimento
      expect(campo.pos).toEqual([16, 17])
      expect(campo.pattern).toBeNull()
      expect(campo.required).toBe(true)
    })
  })

  describe('Campos do benefici�rio/cedente', () => {
    it('deve ter ag�ncia do cedente na posi��o 18-22 (5 d�gitos)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cedente_agencia).toMatchObject({
        pos: [18, 22],
        type: FieldType.NUM,
        size: 5,
      })
    })

    it('deve ter conta do cedente na posi��o 24-35 (12 d�gitos)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cedente_conta).toMatchObject({
        pos: [24, 35],
        type: FieldType.NUM,
        size: 12,
      })
    })

    it('deve ter DV da conta na posi��o 36', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cedente_conta_dv).toMatchObject({
        pos: [36, 36],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('DV da ag�ncia/cooperativa n�o deve ser preenchido (posi��o 23 e 37)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cedente_agencia_dv.required).toBe(false)
      expect(SICREDI_CNAB240_SEGMENT_P.cedente_dv_agencia_conta.required).toBe(false)
    })
  })

  describe('Nosso n�mero', () => {
    it('deve ter nosso n�mero na posi��o 38-46 (9 d�gitos)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.nosso_numero).toMatchObject({
        pos: [38, 46],
        type: FieldType.NUM,
        size: 9,
      })
    })

    it('deve ter complemento do nosso n�mero na posi��o 47-57 (n�o usado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.nosso_numero_complemento
      expect(campo.pos).toEqual([47, 57])
      expect(campo.required).toBe(false)
    })

    it('descri��o do nosso n�mero deve mencionar o formato (AA B XXXXX D)', () => {
      const descricao = SICREDI_CNAB240_SEGMENT_P.nosso_numero.description
      expect(descricao).toContain('AA')
      expect(descricao).toContain('XXXXX')
    })
  })

  describe('Carteira e tipo de t�tulo', () => {
    it('deve ter carteira "1" (cobran�a simples) na posi��o 58', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.carteira).toMatchObject({
        pos: [58, 58],
        pattern: '1',
      })
    })

    it('deve ter cadastramento "1" (com registro) na posi��o 59', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cadastramento).toMatchObject({
        pos: [59, 59],
        pattern: '1',
      })
    })

    it('deve ter tipo de documento na posi��o 60', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.tipo_documento).toMatchObject({
        pos: [60, 60],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('deve ter emiss�o do boleto na posi��o 61', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.emissao_boleto).toMatchObject({
        pos: [61, 61],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('deve ter distribui��o do boleto na posi��o 62', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.distribuicao_boleto).toMatchObject({
        pos: [62, 62],
        type: FieldType.NUM,
        size: 1,
      })
    })
  })

  describe('Seu n�mero', () => {
    it('deve ter seu n�mero na posi��o 63-77 (15 caracteres)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.seu_numero).toMatchObject({
        pos: [63, 77],
        type: FieldType.ALFA,
        size: 15,
      })
    })

    it('descri��o deve mencionar que s� 10 primeiras posi��es s�o validadas', () => {
      const descricao = SICREDI_CNAB240_SEGMENT_P.seu_numero.description
      expect(descricao).toContain('10')
      expect(descricao.toLowerCase()).toContain('063-072')
    })
  })

  describe('Vencimento e valor', () => {
    it('deve ter vencimento na posi��o 78-85 com formato DDMMAAAA', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.vencimento_titulo).toMatchObject({
        pos: [78, 85],
        dateFormat: DateFormat.DDMMAAAA,
      })
    })

    it('deve ter valor do t�tulo na posi��o 86-100 com 2 decimais', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.valor_titulo).toMatchObject({
        pos: [86, 100],
        type: FieldType.NUM,
        size: 15,
        decimals: 2,
      })
    })

    it('valor do t�tulo deve ter descri��o sobre decimais condicionais', () => {
      const descricao = SICREDI_CNAB240_SEGMENT_P.valor_titulo.description
      expect(descricao.toLowerCase()).toMatch(/condiciona(l|is)/)
      expect(descricao.toLowerCase()).toContain('moeda')
    })
  })

  describe('Ag�ncia cobradora', () => {
    it('deve ter ag�ncia cobradora na posi��o 101-105 (n�o usado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.agencia_cobradora
      expect(campo.pos).toEqual([101, 105])
      expect(campo.required).toBe(false)
    })

    it('DV da ag�ncia cobradora na posi��o 106 (n�o usado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.agencia_cobradora_dv
      expect(campo.pos).toEqual([106, 106])
      expect(campo.required).toBe(false)
    })
  })

  describe('Esp�cie e aceite', () => {
    it('deve ter esp�cie do t�tulo na posi��o 107-108', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.especie_titulo).toMatchObject({
        pos: [107, 108],
        type: FieldType.NUM,
        size: 2,
      })
    })

    it('deve ter aceite na posi��o 109', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.aceite).toMatchObject({
        pos: [109, 109],
        type: FieldType.ALFA,
        size: 1,
      })
    })

    it('data de emiss�o na posi��o 110-117 com formato DDMMAAAA', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.data_emissao_titulo).toMatchObject({
        pos: [110, 117],
        dateFormat: DateFormat.DDMMAAAA,
      })
    })
  })

  describe('Juros de mora', () => {
    it('deve ter c�digo de juros na posi��o 118', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.juros_mora_codigo).toMatchObject({
        pos: [118, 118],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('deve ter data de juros na posi��o 119-126', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.juros_mora_data).toMatchObject({
        pos: [119, 126],
        dateFormat: DateFormat.DDMMAAAA,
      })
    })

    it('deve ter valor/taxa de juros na posi��o 127-141', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.juros_mora_valor).toMatchObject({
        pos: [127, 141],
        type: FieldType.NUM,
        size: 15,
        decimals: 2,
      })
    })
  })

  describe('Desconto', () => {
    it('deve ter c�digo de desconto na posi��o 142', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.desconto_codigo).toMatchObject({
        pos: [142, 142],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('deve ter data de desconto na posi��o 143-150', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.desconto_data).toMatchObject({
        pos: [143, 150],
        dateFormat: DateFormat.DDMMAAAA,
      })
    })

    it('deve ter valor de desconto na posi��o 151-165', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.desconto_valor).toMatchObject({
        pos: [151, 165],
        type: FieldType.NUM,
        size: 15,
        decimals: 2,
      })
    })
  })

  describe('IOF e abatimento', () => {
    it('deve ter valor de IOF na posi��o 166-180 (n�o utilizado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.iof_valor
      expect(campo.pos).toEqual([166, 180])
      expect(campo.required).toBe(false)
      expect(campo.description.toLowerCase()).toContain('000000000000000')
    })

    it('deve ter valor de abatimento na posi��o 181-195', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.abatimento_valor).toMatchObject({
        pos: [181, 195],
        type: FieldType.NUM,
        size: 15,
        decimals: 2,
      })
    })
  })

  describe('Uso empresa', () => {
    it('deve ter uso empresa na posi��o 196-220 (25 caracteres)', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.uso_empresa).toMatchObject({
        pos: [196, 220],
        type: FieldType.ALFA,
        size: 25,
      })
    })
  })

  describe('Protesto e baixa', () => {
    it('deve ter c�digo de protesto na posi��o 221', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.protesto_codigo).toMatchObject({
        pos: [221, 221],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('deve ter prazo para protesto na posi��o 222-223', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.protesto_prazo).toMatchObject({
        pos: [222, 223],
        type: FieldType.NUM,
        size: 2,
      })
    })

    it('deve ter c�digo de baixa "1" na posi��o 224', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.baixa_codigo).toMatchObject({
        pos: [224, 224],
        pattern: '1',
      })
    })

    it('deve ter prazo de baixa na posi��o 225-227 (n�o utilizado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.baixa_prazo
      expect(campo.pos).toEqual([225, 227])
      expect(campo.required).toBe(false)
    })
  })

  describe('Moeda e contrato', () => {
    it('deve ter c�digo de moeda "09" (Real) na posi��o 228-229', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.moeda_codigo).toMatchObject({
        pos: [228, 229],
        pattern: '09',
      })
    })

    it('deve ter n�mero de contrato na posi��o 230-239 (n�o utilizado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_P.contrato_numero
      expect(campo.pos).toEqual([230, 239])
      expect(campo.required).toBe(false)
    })

    it('deve ter campo CNAB exclusivo na posi��o 240', () => {
      expect(SICREDI_CNAB240_SEGMENT_P.cnab_exclusivo_2).toMatchObject({
        pos: [240, 240],
        type: FieldType.ALFA,
        size: 1,
      })
    })
  })

  describe('Valida��o de estrutura', () => {
    it('todos os campos devem ter posi��o, tipo e tamanho definidos', () => {
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

    it('tamanhos declarados devem bater com as posi��es', () => {
      Object.entries(SICREDI_CNAB240_SEGMENT_P).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('n�o deve haver sobreposi��o de posi��es', () => {
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

    it('deve cobrir todas as 240 posi��es', () => {
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

