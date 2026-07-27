/**
 * Testes do Schema Sicredi CNAB 400 - Registro Tipo 5 (Informativo)
 *
 * Registro opcional para incluir dados/texto adicional ao boleto (até 4 linhas por registro,
 * máximo 5 registros tipo 5 encadeados = 20 linhas no total).
 *
 * Fonte: Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.4, p.32
 */

import { TYPE5_INFORMATIVE } from '../../../../../../src/banks/sicredi/schemas/cnab400/registros-opcionais/type5-informative/type5-informative'

describe('Schema Sicredi CNAB 400 - Registro Tipo 5 (Informativo)', () => {
  describe('Campos de controle', () => {
    test('deve ter tipo de registro "5" na posição 1', () => {
      expect(TYPE5_INFORMATIVE.tipo_registro).toBeDefined()
      expect(TYPE5_INFORMATIVE.tipo_registro.pos).toEqual([1, 1])
      expect(TYPE5_INFORMATIVE.tipo_registro.type).toBe('num')
      expect(TYPE5_INFORMATIVE.tipo_registro.size).toBe(1)
      expect(TYPE5_INFORMATIVE.tipo_registro.pattern).toBe('5')
      expect(TYPE5_INFORMATIVE.tipo_registro.required).toBe(true)
    })

    test('deve ter tipo de informativo "E" na posição 2', () => {
      expect(TYPE5_INFORMATIVE.tipo_informativo).toBeDefined()
      expect(TYPE5_INFORMATIVE.tipo_informativo.pos).toEqual([2, 2])
      expect(TYPE5_INFORMATIVE.tipo_informativo.type).toBe('alfa')
      expect(TYPE5_INFORMATIVE.tipo_informativo.size).toBe(1)
      expect(TYPE5_INFORMATIVE.tipo_informativo.pattern).toBe('E')
      expect(TYPE5_INFORMATIVE.tipo_informativo.required).toBe(true)
    })

    test('deve ter código do beneficiário/cedente na posição 3-7', () => {
      expect(TYPE5_INFORMATIVE.codigo_beneficiario_cedente).toBeDefined()
      expect(TYPE5_INFORMATIVE.codigo_beneficiario_cedente.pos).toEqual([3, 7])
      expect(TYPE5_INFORMATIVE.codigo_beneficiario_cedente.type).toBe('num')
      expect(TYPE5_INFORMATIVE.codigo_beneficiario_cedente.size).toBe(5)
      expect(TYPE5_INFORMATIVE.codigo_beneficiario_cedente.required).toBe(true)
    })

    test('deve ter identificação do título (seu número) na posição 8-17', () => {
      expect(TYPE5_INFORMATIVE.identificacao_titulo_seu_numero).toBeDefined()
      expect(TYPE5_INFORMATIVE.identificacao_titulo_seu_numero.pos).toEqual([8, 17])
      expect(TYPE5_INFORMATIVE.identificacao_titulo_seu_numero.type).toBe('alfa')
      expect(TYPE5_INFORMATIVE.identificacao_titulo_seu_numero.size).toBe(10)
    })

    test('deve ter tipo de cobrança na posição 19', () => {
      expect(TYPE5_INFORMATIVE.tipo_cobranca).toBeDefined()
      expect(TYPE5_INFORMATIVE.tipo_cobranca.pos).toEqual([19, 19])
      expect(TYPE5_INFORMATIVE.tipo_cobranca.type).toBe('alfa')
      expect(TYPE5_INFORMATIVE.tipo_cobranca.size).toBe(1)
      expect(TYPE5_INFORMATIVE.tipo_cobranca.pattern).toBe('A')
      expect(TYPE5_INFORMATIVE.tipo_cobranca.required).toBe(true)
    })
  })

  describe('Campos de linhas informativas', () => {
    test('deve ter número da linha informativo 1 na posição 20-21', () => {
      expect(TYPE5_INFORMATIVE.numero_linha_informativo_1).toBeDefined()
      expect(TYPE5_INFORMATIVE.numero_linha_informativo_1.pos).toEqual([20, 21])
      expect(TYPE5_INFORMATIVE.numero_linha_informativo_1.type).toBe('num')
      expect(TYPE5_INFORMATIVE.numero_linha_informativo_1.size).toBe(2)
    })

    test('deve ter texto da linha informativo 1 na posição 22-101 (80 caracteres)', () => {
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_1).toBeDefined()
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_1.pos).toEqual([22, 101])
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_1.type).toBe('alfa')
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_1.size).toBe(80)
    })

    test('deve ter 4 pares de número+texto de linha informativa', () => {
      expect(TYPE5_INFORMATIVE.numero_linha_informativo_1).toBeDefined()
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_1).toBeDefined()
      expect(TYPE5_INFORMATIVE.numero_linha_informativo_2).toBeDefined()
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_2).toBeDefined()
      expect(TYPE5_INFORMATIVE.numero_linha_informativo_3).toBeDefined()
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_3).toBeDefined()
      expect(TYPE5_INFORMATIVE.numero_linha_informativo_4).toBeDefined()
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_4).toBeDefined()
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos na posição 348-394', () => {
      expect(TYPE5_INFORMATIVE.brancos_2).toBeDefined()
      expect(TYPE5_INFORMATIVE.brancos_2.pos).toEqual([348, 394])
      expect(TYPE5_INFORMATIVE.brancos_2.type).toBe('alfa')
      expect(TYPE5_INFORMATIVE.brancos_2.size).toBe(47)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE5_INFORMATIVE.numero_sequencial).toBeDefined()
      expect(TYPE5_INFORMATIVE.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE5_INFORMATIVE.numero_sequencial.type).toBe('num')
      expect(TYPE5_INFORMATIVE.numero_sequencial.size).toBe(6)
      expect(TYPE5_INFORMATIVE.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.keys(TYPE5_INFORMATIVE)
      const posicoes: { campo: string; inicio: number; fim: number }[] = []

      campos.forEach((campo) => {
        const fieldDef = TYPE5_INFORMATIVE[campo]
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
      const campos = Object.keys(TYPE5_INFORMATIVE)
      campos.forEach((campo) => {
        const fieldDef = TYPE5_INFORMATIVE[campo]
        if (fieldDef.pos && fieldDef.size !== undefined) {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(tamanhoCalculado).toBe(fieldDef.size)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE5_INFORMATIVE.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro e tipo_informativo devem ter padrões fixos', () => {
      expect(TYPE5_INFORMATIVE.tipo_registro.pattern).toBe('5')
      expect(TYPE5_INFORMATIVE.tipo_informativo.pattern).toBe('E')
    })

    test('deve suportar 4 linhas de 80 caracteres cada', () => {
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_1.size).toBe(80)
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_2.size).toBe(80)
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_3.size).toBe(80)
      expect(TYPE5_INFORMATIVE.texto_linha_informativo_4.size).toBe(80)
    })

    test('número de linha deve permitir 1-99', () => {
      expect(TYPE5_INFORMATIVE.numero_linha_informativo_1.description).toContain('1-99')
    })
  })
})
