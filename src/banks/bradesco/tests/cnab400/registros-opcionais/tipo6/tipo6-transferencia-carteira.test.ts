/**
 * Testes do registro Tipo 6 (Múltiplas Transferências / Débito Automático) — Bradesco CNAB 400
 *
 * Valida:
 * - Definição de todos os campos
 * - Posições corretas conforme manual oficial 2022
 * - Integridade do schema (sem sobreposição, tamanhos corretos)
 * - Características específicas do registro
 */

import { TYPE6_PORTFOLIO_TRANSFER } from '@banks/bradesco/schemas/cnab400/registros-opcionais/type6-portfolio-transfer/type6-portfolio-transfer'

describe('Schema Bradesco CNAB 400 - Registro Tipo 6 (Múltiplas Transferências / Débito Automático)', () => {
  describe('Campos de controle e identificação', () => {
    test('deve ter tipo de registro "6" na posição 1', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_registro.pos).toEqual([1, 1])
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_registro.type).toBe('num')
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_registro.size).toBe(1)
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_registro.pattern).toBe('6')
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_registro.required).toBe(true)
    })

    test('deve ter carteira na posição 2-4', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.carteira.pos).toEqual([2, 4])
      expect(TYPE6_PORTFOLIO_TRANSFER.carteira.type).toBe('num')
      expect(TYPE6_PORTFOLIO_TRANSFER.carteira.size).toBe(3)
      expect(TYPE6_PORTFOLIO_TRANSFER.carteira.required).toBe(true)
    })

    test('deve ter agência na posição 5-9', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.agencia.pos).toEqual([5, 9])
      expect(TYPE6_PORTFOLIO_TRANSFER.agencia.type).toBe('num')
      expect(TYPE6_PORTFOLIO_TRANSFER.agencia.size).toBe(5)
      expect(TYPE6_PORTFOLIO_TRANSFER.agencia.required).toBe(true)
    })

    test('deve ter conta na posição 10-16 sem dígito verificador', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.conta.pos).toEqual([10, 16])
      expect(TYPE6_PORTFOLIO_TRANSFER.conta.type).toBe('num')
      expect(TYPE6_PORTFOLIO_TRANSFER.conta.size).toBe(7)
      expect(TYPE6_PORTFOLIO_TRANSFER.conta.required).toBe(true)
      expect(TYPE6_PORTFOLIO_TRANSFER.conta.description).toContain('sem dígito verificador')
    })

    test('deve ter nosso número na posição 17-27', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.nosso_numero.pos).toEqual([17, 27])
      expect(TYPE6_PORTFOLIO_TRANSFER.nosso_numero.type).toBe('num')
      expect(TYPE6_PORTFOLIO_TRANSFER.nosso_numero.size).toBe(11)
      expect(TYPE6_PORTFOLIO_TRANSFER.nosso_numero.required).toBe(true)
    })

    test('deve ter DAC do nosso número na posição 28', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.dac_nosso_numero.pos).toEqual([28, 28])
      expect(TYPE6_PORTFOLIO_TRANSFER.dac_nosso_numero.type).toBe('alfa')
      expect(TYPE6_PORTFOLIO_TRANSFER.dac_nosso_numero.size).toBe(1)
      expect(TYPE6_PORTFOLIO_TRANSFER.dac_nosso_numero.required).toBe(false)
    })
  })

  describe('Campos de operação (posições 29-64 - revelados no manual 2022)', () => {
    test('deve ter tipo de operação na posição 29', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.pos).toEqual([29, 29])
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.type).toBe('num')
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.size).toBe(1)
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.required).toBe(false)
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.description).toContain('Crédito')
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.description).toContain('Arrendamento')
    })

    test('deve ter utilização de cheque especial na posição 30', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.utilizacao_cheque_especial.pos).toEqual([30, 30])
      expect(TYPE6_PORTFOLIO_TRANSFER.utilizacao_cheque_especial.type).toBe('alfa')
      expect(TYPE6_PORTFOLIO_TRANSFER.utilizacao_cheque_especial.size).toBe(1)
      expect(TYPE6_PORTFOLIO_TRANSFER.utilizacao_cheque_especial.required).toBe(false)
      expect(TYPE6_PORTFOLIO_TRANSFER.utilizacao_cheque_especial.description).toContain('S')
      expect(TYPE6_PORTFOLIO_TRANSFER.utilizacao_cheque_especial.description).toContain('N')
    })

    test('deve ter consulta saldo após vencimento na posição 31', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.consulta_saldo_apos_vencimento.pos).toEqual([31, 31])
      expect(TYPE6_PORTFOLIO_TRANSFER.consulta_saldo_apos_vencimento.type).toBe('alfa')
      expect(TYPE6_PORTFOLIO_TRANSFER.consulta_saldo_apos_vencimento.size).toBe(1)
      expect(TYPE6_PORTFOLIO_TRANSFER.consulta_saldo_apos_vencimento.required).toBe(false)
    })

    test('deve ter código de identificação/contrato na posição 32-56', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.codigo_identificacao_contrato.pos).toEqual([32, 56])
      expect(TYPE6_PORTFOLIO_TRANSFER.codigo_identificacao_contrato.type).toBe('alfa')
      expect(TYPE6_PORTFOLIO_TRANSFER.codigo_identificacao_contrato.size).toBe(25)
      expect(TYPE6_PORTFOLIO_TRANSFER.codigo_identificacao_contrato.required).toBe(false)
    })

    test('deve ter prazo de validade do contrato na posição 57-64 com formato DDMMAAAA', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.pos).toEqual([57, 64])
      expect(TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.type).toBe('data')
      expect(TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.size).toBe(8)
      expect(TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.dateFormat).toBe('DDMMAAAA')
      expect(TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.required).toBe(false)
      expect(TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.description).toContain(
        '99999999',
      )
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos (filler) na posição 65-394', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.brancos.pos).toEqual([65, 394])
      expect(TYPE6_PORTFOLIO_TRANSFER.brancos.type).toBe('alfa')
      expect(TYPE6_PORTFOLIO_TRANSFER.brancos.size).toBe(330)
      expect(TYPE6_PORTFOLIO_TRANSFER.brancos.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE6_PORTFOLIO_TRANSFER.numero_sequencial.type).toBe('num')
      expect(TYPE6_PORTFOLIO_TRANSFER.numero_sequencial.size).toBe(6)
      expect(TYPE6_PORTFOLIO_TRANSFER.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.entries(TYPE6_PORTFOLIO_TRANSFER)
      const positions: Array<{ field: string; start: number; end: number }> = []

      campos.forEach(([fieldName, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          positions.push({
            field: fieldName,
            start: fieldDef.pos[0],
            end: fieldDef.pos[1],
          })
        }
      })

      // Ordenar por posição inicial
      positions.sort((a, b) => a.start - b.start)

      // Verificar sobreposições
      for (let i = 0; i < positions.length - 1; i++) {
        const current = positions[i]
        const next = positions[i + 1]
        expect(current.end).toBeLessThan(next.start)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      Object.entries(TYPE6_PORTFOLIO_TRANSFER).forEach(([_, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          const [start, end] = fieldDef.pos
          const calculatedSize = end - start + 1
          expect(fieldDef.size).toBe(calculatedSize)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const lastField = TYPE6_PORTFOLIO_TRANSFER.numero_sequencial
      expect(lastField.pos[1]).toBe(400)
    })

    test('deve ter 13 campos no total', () => {
      const fieldCount = Object.keys(TYPE6_PORTFOLIO_TRANSFER).length
      expect(fieldCount).toBe(13)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro deve ter padrão fixo "6"', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_registro.pattern).toBe('6')
    })

    test('conta não deve ter campo dac_conta (diferente dos tipos 2/3/7)', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER).not.toHaveProperty('dac_conta')
      expect(TYPE6_PORTFOLIO_TRANSFER.conta.description).toContain('sem dígito')
    })

    test('nosso_numero deve mencionar que precisa coincidir com o registro tipo 1', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.nosso_numero.description).toContain('coincidir')
    })

    test('campos de operação (29-64) devem ser todos opcionais', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.required).toBe(false)
      expect(TYPE6_PORTFOLIO_TRANSFER.utilizacao_cheque_especial.required).toBe(false)
      expect(TYPE6_PORTFOLIO_TRANSFER.consulta_saldo_apos_vencimento.required).toBe(false)
      expect(TYPE6_PORTFOLIO_TRANSFER.codigo_identificacao_contrato.required).toBe(false)
      expect(TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.required).toBe(false)
    })

    test('campos obrigatórios devem ser apenas os de identificação e controle', () => {
      // Obrigatórios
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_registro.required).toBe(true)
      expect(TYPE6_PORTFOLIO_TRANSFER.carteira.required).toBe(true)
      expect(TYPE6_PORTFOLIO_TRANSFER.agencia.required).toBe(true)
      expect(TYPE6_PORTFOLIO_TRANSFER.conta.required).toBe(true)
      expect(TYPE6_PORTFOLIO_TRANSFER.nosso_numero.required).toBe(true)
      expect(TYPE6_PORTFOLIO_TRANSFER.numero_sequencial.required).toBe(true)

      // Opcionais
      expect(TYPE6_PORTFOLIO_TRANSFER.dac_nosso_numero.required).toBe(false)
      expect(TYPE6_PORTFOLIO_TRANSFER.brancos.required).toBe(false)
    })

    test('campo brancos deve ocupar maior parte do registro', () => {
      const allSizes = Object.values(TYPE6_PORTFOLIO_TRANSFER).map(
        (field: any) => field.size || 0,
      )
      const maxSize = Math.max(...allSizes)

      expect(TYPE6_PORTFOLIO_TRANSFER.brancos.size).toBe(maxSize)
      expect(TYPE6_PORTFOLIO_TRANSFER.brancos.size).toBe(330)
    })

    test('código de identificação/contrato deve ser o segundo maior campo', () => {
      const sizes = Object.values(TYPE6_PORTFOLIO_TRANSFER)
        .map((field: any) => field.size || 0)
        .sort((a, b) => b - a)

      // Maior é brancos (330), segundo maior deve ser codigo_identificacao_contrato (25)
      expect(sizes[0]).toBe(330) // brancos
      expect(sizes[1]).toBe(25) // codigo_identificacao_contrato
      expect(TYPE6_PORTFOLIO_TRANSFER.codigo_identificacao_contrato.size).toBe(25)
    })

    test('prazo_validade_contrato deve aceitar valor especial 99999999 para indeterminado', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.description).toContain(
        '99999999',
      )
      expect(TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.description).toContain(
        'indeterminado',
      )
    })

    test('campos S/N devem ter descrição indicando valores aceitos', () => {
      const camposSN = [
        TYPE6_PORTFOLIO_TRANSFER.utilizacao_cheque_especial,
        TYPE6_PORTFOLIO_TRANSFER.consulta_saldo_apos_vencimento,
      ]

      camposSN.forEach((campo) => {
        expect(campo.description).toMatch(/['"]S['"]/)
        expect(campo.description).toMatch(/['"]N['"]/)
      })
    })

    test('tipo_operacao deve ter 3 valores possíveis documentados', () => {
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.description).toContain('1')
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.description).toContain('2')
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.description).toContain('3')
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.description).toContain('Crédito')
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.description).toContain('Arrendamento')
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.description).toContain('Outros')
    })

    test('campos 29-64 devem cobrir exatamente 36 posições', () => {
      const totalCampos29a64 =
        TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.size +
        TYPE6_PORTFOLIO_TRANSFER.utilizacao_cheque_especial.size +
        TYPE6_PORTFOLIO_TRANSFER.consulta_saldo_apos_vencimento.size +
        TYPE6_PORTFOLIO_TRANSFER.codigo_identificacao_contrato.size +
        TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.size

      expect(totalCampos29a64).toBe(36) // 1 + 1 + 1 + 25 + 8 = 36
      expect(TYPE6_PORTFOLIO_TRANSFER.tipo_operacao.pos[0]).toBe(29)
      expect(TYPE6_PORTFOLIO_TRANSFER.prazo_validade_contrato.pos[1]).toBe(64)
    })
  })
})

