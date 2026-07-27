/**
 * Testes do Segmento P - Santander CNAB 240
 * 
 * Valida a estrutura e campos do Segmento P (dados financeiros do título).
 * Atualizado conforme Manual H7815 v6 (Fevereiro/2023).
 */

import { santanderCnab240 } from '../../../../../src/banks/santander/schemas/cnab240'

describe('Schema Santander CNAB 240 - Segmento P', () => {
  describe('Definição dos campos - Manual 2023', () => {
    test('deve ter código do banco na posição 1-3 com padrão "033"', () => {
      const field = santanderCnab240.segmentoP!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('033')
      expect(field.type).toBe('num')
    })

    test('deve ter lote na posição 4-7', () => {
      const field = santanderCnab240.segmentoP!.controle_lote
      
      expect(field.pos).toEqual([4, 7])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      const field = santanderCnab240.segmentoP!.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('3')
    })

    test('deve ter identificador do segmento "P" na posição 14', () => {
      const field = santanderCnab240.segmentoP!.servico_segmento
      
      expect(field.pos).toEqual([14, 14])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('P')
    })

    test('deve ter código de movimento VARIÁVEL (não fixo) na posição 16-17', () => {
      const field = santanderCnab240.segmentoP!.servico_codigo_movimento
      
      expect(field.pos).toEqual([16, 17])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
      expect(field.pattern).toBeNull() // Bug corrigido: não pode ser fixo em '01'
      expect(field.description).toContain('variável')
    })

    test('deve ter agência do cedente com 4 dígitos (pos 18-21) - Manual 2023', () => {
      const field = santanderCnab240.segmentoP!.cedente_agencia
      
      expect(field.pos).toEqual([18, 21])
      expect(field.type).toBe('num')
      expect(field.size).toBe(4)
      expect(field.description).toContain('4 dígitos')
    })

    test('deve ter conta do cedente com 9 dígitos (pos 23-31) - Manual 2023', () => {
      const field = santanderCnab240.segmentoP!.cedente_conta
      
      expect(field.pos).toEqual([23, 31])
      expect(field.type).toBe('num')
      expect(field.size).toBe(9)
      expect(field.description).toContain('9 dígitos')
    })

    test('deve ter conta cobrança FIDC com 9 dígitos (pos 33-41) - Manual 2023', () => {
      const field = santanderCnab240.segmentoP!.conta_cobranca
      
      expect(field.pos).toEqual([33, 41])
      expect(field.type).toBe('num')
      expect(field.size).toBe(9)
      expect(field.description).toContain('FIDC')
    })

    test('deve ter nosso número na posição 45-57', () => {
      const field = santanderCnab240.segmentoP!.nosso_numero
      
      expect(field.pos).toEqual([45, 57])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.required).toBe(true)
    })

    test('deve ter vencimento na posição 78-85 com formato DDMMAAAA', () => {
      const field = santanderCnab240.segmentoP!.vencimento_titulo
      
      expect(field.pos).toEqual([78, 85])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAAAA')
      expect(field.required).toBe(true)
    })

    test('deve ter valor do título na posição 86-100 com 2 decimais', () => {
      const field = santanderCnab240.segmentoP!.valor_titulo
      
      expect(field.pos).toEqual([86, 100])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(true)
    })

    test('deve ter percentual IOF na posição 166-180 com 5 decimais - Manual 2023', () => {
      const field = santanderCnab240.segmentoP!.iof_percentual
      
      expect(field.pos).toEqual([166, 180])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
      expect(field.decimals).toBe(5)
      expect(field.description).toContain('Percentual')
      expect(field.description).toContain('5 casas decimais')
    })

    test('deve ter agência cobradora FIDC com 4 dígitos (pos 101-104) - Manual 2023', () => {
      const field = santanderCnab240.segmentoP!.agencia_cobradora
      
      expect(field.pos).toEqual([101, 104])
      expect(field.type).toBe('num')
      expect(field.size).toBe(4)
      expect(field.description).toContain('FIDC')
    })

    test('deve ter DV da agência cobradora na posição 105 - Manual 2023', () => {
      const field = santanderCnab240.segmentoP!.agencia_cobradora_dv
      
      expect(field.pos).toEqual([105, 105])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
    })

    test('deve ter prazo de baixa com 2 dígitos (pos 226-227) - Manual 2023', () => {
      const field = santanderCnab240.segmentoP!.baixa_prazo
      
      expect(field.pos).toEqual([226, 227])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.description).toContain('dias')
    })

    test('deve ter 44 campos definidos no total', () => {
      const campos = Object.keys(santanderCnab240.segmentoP!)
      expect(campos.length).toBe(44)
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      for (const field of Object.values(santanderCnab240.segmentoP!)) {
        expect(field.pos).toBeDefined()
        expect(field.pos.length).toBe(2)
        expect(field.type).toBeDefined()
        expect(['num', 'alfa', 'data']).toContain(field.type)
        expect(field.size).toBeGreaterThan(0)
      }
    })

    test('tamanhos declarados devem bater com as posições', () => {
      for (const field of Object.values(santanderCnab240.segmentoP!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('não deve haver sobreposição de posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(santanderCnab240.segmentoP!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('deve cobrir todas as 240 posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(santanderCnab240.segmentoP!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          positions.add(i)
        }
      }
      
      expect(positions.size).toBe(240)
      for (let i = 1; i <= 240; i++) {
        expect(positions.has(i)).toBe(true)
      }
    })
  })
})
