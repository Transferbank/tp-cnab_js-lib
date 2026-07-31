/**
 * Testes do Schema Sicredi CNAB 400 - Registro Tipo 2 (Mensagem)
 *
 * Registro opcional de texto livre para impressão no boleto (até 4 linhas de 80 caracteres).
 *
 * Fonte: Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.3, p.31
 */

import { TYPE2_MESSAGE } from '@banks/sicredi/schemas/cnab400/registros-opcionais/type2-message/type2-message'

describe('Schema Sicredi CNAB 400 - Registro Tipo 2 (Mensagem)', () => {
  describe('Campos de controle', () => {
    test('deve ter tipo de registro "2" na posição 1', () => {
      expect(TYPE2_MESSAGE.tipo_registro).toBeDefined()
      expect(TYPE2_MESSAGE.tipo_registro.pos).toEqual([1, 1])
      expect(TYPE2_MESSAGE.tipo_registro.type).toBe('num')
      expect(TYPE2_MESSAGE.tipo_registro.size).toBe(1)
      expect(TYPE2_MESSAGE.tipo_registro.pattern).toBe('2')
      expect(TYPE2_MESSAGE.tipo_registro.required).toBe(true)
    })

    test('deve ter nosso número na posição 13-21', () => {
      expect(TYPE2_MESSAGE.nosso_numero).toBeDefined()
      expect(TYPE2_MESSAGE.nosso_numero.pos).toEqual([13, 21])
      expect(TYPE2_MESSAGE.nosso_numero.type).toBe('num')
      expect(TYPE2_MESSAGE.nosso_numero.size).toBe(9)
    })

    test('deve ter número do documento na posição 342-351', () => {
      expect(TYPE2_MESSAGE.numero_documento).toBeDefined()
      expect(TYPE2_MESSAGE.numero_documento.pos).toEqual([342, 351])
      expect(TYPE2_MESSAGE.numero_documento.type).toBe('alfa')
      expect(TYPE2_MESSAGE.numero_documento.size).toBe(10)
    })
  })

  describe('Campos de mensagem', () => {
    test('deve ter instrução linha 1 na posição 22-101 (80 caracteres)', () => {
      expect(TYPE2_MESSAGE.instrucao_linha_1).toBeDefined()
      expect(TYPE2_MESSAGE.instrucao_linha_1.pos).toEqual([22, 101])
      expect(TYPE2_MESSAGE.instrucao_linha_1.type).toBe('alfa')
      expect(TYPE2_MESSAGE.instrucao_linha_1.size).toBe(80)
    })

    test('deve ter instrução linha 2 na posição 102-181 (80 caracteres)', () => {
      expect(TYPE2_MESSAGE.instrucao_linha_2).toBeDefined()
      expect(TYPE2_MESSAGE.instrucao_linha_2.pos).toEqual([102, 181])
      expect(TYPE2_MESSAGE.instrucao_linha_2.type).toBe('alfa')
      expect(TYPE2_MESSAGE.instrucao_linha_2.size).toBe(80)
    })

    test('deve ter instrução linha 3 na posição 182-261 (80 caracteres)', () => {
      expect(TYPE2_MESSAGE.instrucao_linha_3).toBeDefined()
      expect(TYPE2_MESSAGE.instrucao_linha_3.pos).toEqual([182, 261])
      expect(TYPE2_MESSAGE.instrucao_linha_3.type).toBe('alfa')
      expect(TYPE2_MESSAGE.instrucao_linha_3.size).toBe(80)
    })

    test('deve ter instrução linha 4 na posição 262-341 (80 caracteres)', () => {
      expect(TYPE2_MESSAGE.instrucao_linha_4).toBeDefined()
      expect(TYPE2_MESSAGE.instrucao_linha_4.pos).toEqual([262, 341])
      expect(TYPE2_MESSAGE.instrucao_linha_4.type).toBe('alfa')
      expect(TYPE2_MESSAGE.instrucao_linha_4.size).toBe(80)
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos na posição 352-394', () => {
      expect(TYPE2_MESSAGE.brancos_2).toBeDefined()
      expect(TYPE2_MESSAGE.brancos_2.pos).toEqual([352, 394])
      expect(TYPE2_MESSAGE.brancos_2.type).toBe('alfa')
      expect(TYPE2_MESSAGE.brancos_2.size).toBe(43)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE2_MESSAGE.numero_sequencial).toBeDefined()
      expect(TYPE2_MESSAGE.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE2_MESSAGE.numero_sequencial.type).toBe('num')
      expect(TYPE2_MESSAGE.numero_sequencial.size).toBe(6)
      expect(TYPE2_MESSAGE.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.keys(TYPE2_MESSAGE)
      const posicoes: { campo: string; inicio: number; fim: number }[] = []

      campos.forEach((campo) => {
        const fieldDef = TYPE2_MESSAGE[campo]
        if (fieldDef.pos) {
          posicoes.push({
            campo,
            inicio: fieldDef.pos[0],
            fim: fieldDef.pos[1],
          })
        }
      })

      posicoes.sort((a, b) => a.inicio - b.inicio)

      for (let i = 0; i < posicoes.length - 1; i++) {
        const atual = posicoes[i]
        const proximo = posicoes[i + 1]
        expect(atual.fim).toBeLessThan(proximo.inicio)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      const campos = Object.keys(TYPE2_MESSAGE)
      campos.forEach((campo) => {
        const fieldDef = TYPE2_MESSAGE[campo]
        if (fieldDef.pos && fieldDef.size !== undefined) {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(tamanhoCalculado).toBe(fieldDef.size)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE2_MESSAGE.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })

    test('deve ter 10 campos no total', () => {
      const campos = Object.keys(TYPE2_MESSAGE)
      expect(campos.length).toBe(10)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro deve ter padrão fixo "2"', () => {
      expect(TYPE2_MESSAGE.tipo_registro.pattern).toBe('2')
    })

    test('deve suportar 4 linhas de 80 caracteres cada', () => {
      expect(TYPE2_MESSAGE.instrucao_linha_1.size).toBe(80)
      expect(TYPE2_MESSAGE.instrucao_linha_2.size).toBe(80)
      expect(TYPE2_MESSAGE.instrucao_linha_3.size).toBe(80)
      expect(TYPE2_MESSAGE.instrucao_linha_4.size).toBe(80)
    })

    test('campo numero_documento deve bater com posições 111-120 do detalhe', () => {
      expect(TYPE2_MESSAGE.numero_documento.description).toContain('111-120')
    })
  })
})

