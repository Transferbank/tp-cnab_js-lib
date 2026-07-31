/**
 * Testes do Schema Sicredi CNAB 400 - Registro Tipo 8 (Híbrido / QR Code)
 *
 * Registro opcional "obrigatório quando emissão de boleto híbrido" — condicional ao campo
 * tipo_boleto do detalhe (posição 6 = 'H'). Carrega o TXID do QR Code, mas o campo deve ser
 * enviado em branco — o Sicredi gera e vincula automaticamente.
 *
 * Fonte: Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.7, p.36
 */

import { TYPE8_HYBRID } from '@banks/sicredi/schemas/cnab400/registros-opcionais/type8-hybrid/type8-hybrid'

describe('Schema Sicredi CNAB 400 - Registro Tipo 8 (Híbrido / QR Code)', () => {
  describe('Campos de controle', () => {
    test('deve ter tipo de registro "8" na posição 1', () => {
      expect(TYPE8_HYBRID.tipo_registro).toBeDefined()
      expect(TYPE8_HYBRID.tipo_registro.pos).toEqual([1, 1])
      expect(TYPE8_HYBRID.tipo_registro.type).toBe('num')
      expect(TYPE8_HYBRID.tipo_registro.size).toBe(1)
      expect(TYPE8_HYBRID.tipo_registro.pattern).toBe('8')
      expect(TYPE8_HYBRID.tipo_registro.required).toBe(true)
    })

    test('deve ter nosso número na posição 2-16', () => {
      expect(TYPE8_HYBRID.nosso_numero_sicredi_sem_edicao).toBeDefined()
      expect(TYPE8_HYBRID.nosso_numero_sicredi_sem_edicao.pos).toEqual([2, 16])
      expect(TYPE8_HYBRID.nosso_numero_sicredi_sem_edicao.type).toBe('alfa')
      expect(TYPE8_HYBRID.nosso_numero_sicredi_sem_edicao.size).toBe(15)
    })

    test('deve ter brancos na posição 17', () => {
      expect(TYPE8_HYBRID.brancos_1).toBeDefined()
      expect(TYPE8_HYBRID.brancos_1.pos).toEqual([17, 17])
      expect(TYPE8_HYBRID.brancos_1.type).toBe('alfa')
      expect(TYPE8_HYBRID.brancos_1.size).toBe(1)
    })

    test('deve ter identificação de boleto híbrido na posição 18', () => {
      expect(TYPE8_HYBRID.hibrido).toBeDefined()
      expect(TYPE8_HYBRID.hibrido.pos).toEqual([18, 18])
      expect(TYPE8_HYBRID.hibrido.type).toBe('alfa')
      expect(TYPE8_HYBRID.hibrido.size).toBe(1)
      expect(TYPE8_HYBRID.hibrido.pattern).toBe('H')
      expect(TYPE8_HYBRID.hibrido.required).toBe(true)
    })

    test('deve ter brancos na posição 19-30', () => {
      expect(TYPE8_HYBRID.brancos_2).toBeDefined()
      expect(TYPE8_HYBRID.brancos_2.pos).toEqual([19, 30])
      expect(TYPE8_HYBRID.brancos_2.type).toBe('alfa')
      expect(TYPE8_HYBRID.brancos_2.size).toBe(12)
    })
  })

  describe('Campos do boleto híbrido', () => {
    test('deve ter número do documento na posição 31-40', () => {
      expect(TYPE8_HYBRID.numero_documento).toBeDefined()
      expect(TYPE8_HYBRID.numero_documento.pos).toEqual([31, 40])
      expect(TYPE8_HYBRID.numero_documento.type).toBe('alfa')
      expect(TYPE8_HYBRID.numero_documento.size).toBe(10)
      expect(TYPE8_HYBRID.numero_documento.description).toContain('deve bater com posições 111-120 do detalhe')
    })

    test('deve ter TXID do QR Code na posição 41-75', () => {
      expect(TYPE8_HYBRID.txid).toBeDefined()
      expect(TYPE8_HYBRID.txid.pos).toEqual([41, 75])
      expect(TYPE8_HYBRID.txid.type).toBe('alfa')
      expect(TYPE8_HYBRID.txid.size).toBe(35)
      expect(TYPE8_HYBRID.txid.description).toContain('enviar em branco')
      expect(TYPE8_HYBRID.txid.description).toContain('Sicredi gera e vincula')
    })

    test('deve ter brancos na posição 76-394', () => {
      expect(TYPE8_HYBRID.brancos_3).toBeDefined()
      expect(TYPE8_HYBRID.brancos_3.pos).toEqual([76, 394])
      expect(TYPE8_HYBRID.brancos_3.type).toBe('alfa')
      expect(TYPE8_HYBRID.brancos_3.size).toBe(319)
    })
  })

  describe('Campos finais', () => {
    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE8_HYBRID.numero_sequencial).toBeDefined()
      expect(TYPE8_HYBRID.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE8_HYBRID.numero_sequencial.type).toBe('num')
      expect(TYPE8_HYBRID.numero_sequencial.size).toBe(6)
      expect(TYPE8_HYBRID.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.keys(TYPE8_HYBRID)
      const posicoes: { campo: string; inicio: number; fim: number }[] = []

      campos.forEach((campo) => {
        const fieldDef = TYPE8_HYBRID[campo]
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
      const campos = Object.keys(TYPE8_HYBRID)
      campos.forEach((campo) => {
        const fieldDef = TYPE8_HYBRID[campo]
        if (fieldDef.pos && fieldDef.size !== undefined) {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(tamanhoCalculado).toBe(fieldDef.size)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE8_HYBRID.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro deve ter padrão fixo "8"', () => {
      expect(TYPE8_HYBRID.tipo_registro.pattern).toBe('8')
    })

    test('identificação híbrida deve ter padrão fixo "H"', () => {
      expect(TYPE8_HYBRID.hibrido.pattern).toBe('H')
      expect(TYPE8_HYBRID.hibrido.required).toBe(true)
    })

    test('campo brancos_3 deve ser o maior campo do layout', () => {
      const campos = Object.values(TYPE8_HYBRID)
      const tamanhos = campos.map((campo: any) => campo.size || 0)
      const maiorTamanho = Math.max(...tamanhos)

      expect(TYPE8_HYBRID.brancos_3.size).toBe(maiorTamanho)
      expect(TYPE8_HYBRID.brancos_3.size).toBe(319)
    })

    test('TXID deve ser enviado em branco conforme documentação', () => {
      // Campo opcional (não obrigatório) pois deve ser enviado em branco
      expect(TYPE8_HYBRID.txid.required).toBeFalsy()
      expect(TYPE8_HYBRID.txid.size).toBe(35)
    })

    test('numero_documento deve referenciar posições do detalhe', () => {
      expect(TYPE8_HYBRID.numero_documento.size).toBe(10)
      expect(TYPE8_HYBRID.numero_documento.description).toContain('111-120')
    })

    test('registro é condicional ao tipo_boleto = H no detalhe', () => {
      // Verificação indireta: campo hibrido obrigatório com padrão 'H'
      expect(TYPE8_HYBRID.hibrido.pattern).toBe('H')
      expect(TYPE8_HYBRID.hibrido.required).toBe(true)
      expect(TYPE8_HYBRID.hibrido.description).toContain('híbrido')
    })
  })
})

