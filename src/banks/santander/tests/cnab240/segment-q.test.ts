/**
 * Testes do Segmento Q - Santander CNAB 240
 * 
 * Valida a estrutura e campos do Segmento Q (dados do pagador).
 * Atualizado conforme Manual H7815 v6 (Fevereiro/2023).
 */

import { santanderCnab240 } from '@banks/santander/schemas/cnab240'

describe('Schema Santander CNAB 240 - Segmento Q', () => {
  describe('Definição dos campos - Manual 2023', () => {
    test('deve ter código do banco na posição 1-3 com padrão "033"', () => {
      const field = santanderCnab240.segmentoQ!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('033')
    })

    test('deve ter identificador do segmento "Q" na posição 14', () => {
      const field = santanderCnab240.segmentoQ!.servico_segmento
      
      expect(field.pos).toEqual([14, 14])
      expect(field.pattern).toBe('Q')
    })

    test('deve ter código de movimento VARIÁVEL (não fixo) na posição 16-17', () => {
      const field = santanderCnab240.segmentoQ!.servico_codigo_movimento
      
      expect(field.pos).toEqual([16, 17])
      expect(field.type).toBe('num')
      expect(field.pattern).toBeNull() // Bug corrigido
    })

    test('deve ter tipo de inscrição do sacado na posição 18', () => {
      const field = santanderCnab240.segmentoQ!.sacado_inscricao_tipo
      
      expect(field.pos).toEqual([18, 18])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter número de inscrição (CPF/CNPJ) na posição 19-33', () => {
      const field = santanderCnab240.segmentoQ!.sacado_inscricao_numero
      
      expect(field.pos).toEqual([19, 33])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
    })

    test('deve ter nome do sacado na posição 34-73', () => {
      const field = santanderCnab240.segmentoQ!.sacado_nome
      
      expect(field.pos).toEqual([34, 73])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter campos de Beneficiário Final (renomeado de Sacador/Avalista) nas posições 154-209', () => {
      expect(santanderCnab240.segmentoQ!.beneficiario_final_inscricao_tipo).toBeDefined()
      expect(santanderCnab240.segmentoQ!.beneficiario_final_inscricao_tipo.pos).toEqual([154, 154])
      // Check for "Benefici" to avoid encoding issues
      expect(santanderCnab240.segmentoQ!.beneficiario_final_inscricao_tipo.description?.toLowerCase()).toContain('benefici')
      
      expect(santanderCnab240.segmentoQ!.beneficiario_final_inscricao_numero).toBeDefined()
      expect(santanderCnab240.segmentoQ!.beneficiario_final_inscricao_numero.pos).toEqual([155, 169])
      
      expect(santanderCnab240.segmentoQ!.beneficiario_final_nome).toBeDefined()
      expect(santanderCnab240.segmentoQ!.beneficiario_final_nome.pos).toEqual([170, 209])
    })

    test('posições 210-221 devem ser Reservado (não mais campos de carnê) - Manual 2023', () => {
      const field = santanderCnab240.segmentoQ!.cnab_reservado_1
      
      expect(field).toBeDefined()
      expect(field.pos).toEqual([210, 221])
      expect(field.required).toBe(false)
      expect(field.description).toContain('Reservado')
      expect(field.description).toContain('Manual 2023')
    })

    test('NÃO deve ter campos antigos de carnê/parcelamento', () => {
      expect(santanderCnab240.segmentoQ!.carne_identificador).toBeUndefined()
      expect(santanderCnab240.segmentoQ!.parcela_numero).toBeUndefined()
      expect(santanderCnab240.segmentoQ!.parcela_quantidade).toBeUndefined()
      expect(santanderCnab240.segmentoQ!.plano_numero).toBeUndefined()
    })

    test('deve ter 21 campos definidos no total', () => {
      const campos = Object.keys(santanderCnab240.segmentoQ!)
      expect(campos.length).toBe(21)
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      for (const field of Object.values(santanderCnab240.segmentoQ!)) {
        expect(field.pos).toBeDefined()
        expect(field.pos.length).toBe(2)
        expect(field.type).toBeDefined()
        expect(field.size).toBeGreaterThan(0)
      }
    })

    test('tamanhos declarados devem bater com as posições', () => {
      for (const field of Object.values(santanderCnab240.segmentoQ!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('não deve haver sobreposição de posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(santanderCnab240.segmentoQ!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('deve cobrir todas as 240 posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(santanderCnab240.segmentoQ!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          positions.add(i)
        }
      }
      
      expect(positions.size).toBe(240)
    })
  })
})

