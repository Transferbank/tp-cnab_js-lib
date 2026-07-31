/**
 * Testes para Segmento Y-53 - Santander CNAB 240
 * 
 * Segmento opcional para desconto com limites (valor mínimo e máximo)
 */

import { SANTANDER_CNAB240_SEGMENT_Y53 } from '@banks/santander/schemas/cnab240'

describe('Schema Santander CNAB 240 - Segmento Y-53', () => {
  describe('Definição dos campos', () => {
    it('deve ter código do banco na posição 1-3 com padrão "033"', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y53.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '033',
      })
    })

    it('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y53.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '3',
      })
    })

    it('deve ter identificador do segmento "Y" na posição 14', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y53.servico_segmento).toMatchObject({
        pos: [14, 14],
        pattern: 'Y',
      })
    })

    it('deve ter código de registro opcional "53" na posição 18-19', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y53.registro_opcional_id).toMatchObject({
        pos: [18, 19],
        pattern: '53',
      })
    })
  })

  describe('Campos de desconto com limites', () => {
    it('deve ter campo para tipo de valor máximo', () => {
      const campo = SANTANDER_CNAB240_SEGMENT_Y53.valor_maximo_tipo
      expect(campo).toBeDefined()
      expect(campo.type).toBe('num')
      expect(campo.description).toContain('Tipo de valor')
    })

    it('deve ter campo para valor máximo', () => {
      const campo = SANTANDER_CNAB240_SEGMENT_Y53.valor_maximo
      expect(campo).toBeDefined()
      expect(campo.type).toBe('num')
      expect(campo.decimals).toBe(2) // fixo no schema, ajustado por helper
    })

    it('deve ter campo para tipo de valor mínimo', () => {
      const campo = SANTANDER_CNAB240_SEGMENT_Y53.valor_minimo_tipo
      expect(campo).toBeDefined()
      expect(campo.type).toBe('num')
    })

    it('deve ter campo para valor mínimo', () => {
      const campo = SANTANDER_CNAB240_SEGMENT_Y53.valor_minimo
      expect(campo).toBeDefined()
      expect(campo.type).toBe('num')
      expect(campo.decimals).toBe(2) // fixo no schema, ajustado por helper
    })

    it('campos de valor devem ter 15 dígitos totais (13 inteiros + 2 decimais)', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y53.valor_maximo.size).toBe(15)
      expect(SANTANDER_CNAB240_SEGMENT_Y53.valor_minimo.size).toBe(15)
    })
  })

  describe('Nota 48 do manual - Decimais condicionais', () => {
    it('campos de tipo devem indicar que controlam o formato do valor seguinte', () => {
      const descricao = SANTANDER_CNAB240_SEGMENT_Y53.valor_maximo_tipo.description
      expect(descricao).toMatch(/tipo.*valor/i)
      expect(descricao.toLowerCase()).toContain('percentual')
    })

    it('campos de valor devem mencionar que são condicionais ao tipo', () => {
      const descricaoMax = SANTANDER_CNAB240_SEGMENT_Y53.valor_maximo.description
      const descricaoMin = SANTANDER_CNAB240_SEGMENT_Y53.valor_minimo.description

      // Deve mencionar condicionalidade
      const temReferencia = (desc: string) =>
        desc.toLowerCase().includes('condicional') ||
        desc.toLowerCase().includes('percentual')

      expect(temReferencia(descricaoMax) || temReferencia(descricaoMin)).toBe(true)
    })
  })

  describe('Validação de estrutura', () => {
    it('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      Object.entries(SANTANDER_CNAB240_SEGMENT_Y53).forEach(
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
      Object.entries(SANTANDER_CNAB240_SEGMENT_Y53).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('não deve haver sobreposição de posições', () => {
      const campos = Object.entries(SANTANDER_CNAB240_SEGMENT_Y53).map(
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

      Object.values(SANTANDER_CNAB240_SEGMENT_Y53).forEach((fieldDef: any) => {
        for (let pos = fieldDef.pos[0]; pos <= fieldDef.pos[1]; pos++) {
          posicoesCoberta.add(pos)
        }
      })

      expect(posicoesCoberta.size).toBe(240)
      expect(Math.min(...posicoesCoberta)).toBe(1)
      expect(Math.max(...posicoesCoberta)).toBe(240)
    })
  })

  describe('Sequência de campos', () => {
    it('tipo de valor deve vir imediatamente antes do valor correspondente', () => {
      const posMaxTipo = SANTANDER_CNAB240_SEGMENT_Y53.valor_maximo_tipo.pos[1]
      const posMaxValor = SANTANDER_CNAB240_SEGMENT_Y53.valor_maximo.pos[0]

      const posMinTipo = SANTANDER_CNAB240_SEGMENT_Y53.valor_minimo_tipo.pos[1]
      const posMinValor = SANTANDER_CNAB240_SEGMENT_Y53.valor_minimo.pos[0]

      // Tipo deve vir imediatamente antes do valor
      expect(posMaxValor).toBe(posMaxTipo + 1)
      expect(posMinValor).toBe(posMinTipo + 1)
    })
  })
})

