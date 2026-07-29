/**
 * Testes do Schema Itaú CNAB 400 - Registro Tipo 4 (Rateio de Crédito)
 *
 * Registro opcional que permite ratear o crédito do título entre até 14 contas por registro.
 * Até 3 registros tipo 4 por título (total: até 42 contas).
 *
 * Schema baseado no manual oficial Itaú, p.10-11.
 */

import { TYPE4_CREDIT_ALLOCATION } from '../../../../../../../src/banks/itau/schemas/cnab400/registros-opcionais/type4-credit-allocation/type4-credit-allocation'

describe('Schema Itaú CNAB 400 - Registro Tipo 4 (Rateio de Crédito)', () => {
  describe('Campos de controle (posições 1-43)', () => {
    test('deve ter tipo de registro "4" na posição 1', () => {
      const field = TYPE4_CREDIT_ALLOCATION.tipo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('4')
    })

    test('deve ter código de inscrição na posição 2-3', () => {
      const field = TYPE4_CREDIT_ALLOCATION.codigo_inscricao

      expect(field.pos).toEqual([2, 3])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter número de inscrição (CPF/CNPJ) na posição 4-17', () => {
      const field = TYPE4_CREDIT_ALLOCATION.numero_inscricao

      expect(field.pos).toEqual([4, 17])
      expect(field.type).toBe('num')
      expect(field.size).toBe(14)
      expect(field.required).toBe(false)
    })

    test('deve ter agência na posição 18-21', () => {
      const field = TYPE4_CREDIT_ALLOCATION.agencia

      expect(field.pos).toEqual([18, 21])
      expect(field.type).toBe('num')
      expect(field.size).toBe(4)
      expect(field.required).toBe(false)
    })

    test('deve ter zeros na posição 22-23 com padrão "00"', () => {
      const field = TYPE4_CREDIT_ALLOCATION.zeros

      expect(field.pos).toEqual([22, 23])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
      expect(field.pattern).toBe('00')
    })

    test('deve ter conta na posição 24-28', () => {
      const field = TYPE4_CREDIT_ALLOCATION.conta

      expect(field.pos).toEqual([24, 28])
      expect(field.type).toBe('num')
      expect(field.size).toBe(5)
      expect(field.required).toBe(false)
    })

    test('deve ter DAC na posição 29', () => {
      const field = TYPE4_CREDIT_ALLOCATION.dac

      expect(field.pos).toEqual([29, 29])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter número da carteira na posição 30-32', () => {
      const field = TYPE4_CREDIT_ALLOCATION.numero_carteira

      expect(field.pos).toEqual([30, 32])
      expect(field.type).toBe('num')
      expect(field.size).toBe(3)
      expect(field.required).toBe(false)
    })

    test('deve ter nosso número na posição 33-40', () => {
      const field = TYPE4_CREDIT_ALLOCATION.nosso_numero

      expect(field.pos).toEqual([33, 40])
      expect(field.type).toBe('num')
      expect(field.size).toBe(8)
      expect(field.required).toBe(false)
    })

    test('deve ter DAC do nosso número na posição 41', () => {
      const field = TYPE4_CREDIT_ALLOCATION.dac_nosso_numero

      expect(field.pos).toEqual([41, 41])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter sequência do registro tipo 4 na posição 42-43', () => {
      const field = TYPE4_CREDIT_ALLOCATION.sequencia_registro

      expect(field.pos).toEqual([42, 43])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
      expect(field.description).toContain('1 a 3')
    })
  })

  describe('Blocos de rateio (14 contas, posições 44-393)', () => {
    test('deve ter 14 blocos de rateio completos', () => {
      // Verificar que existem campos para as 14 contas
      for (let i = 1; i <= 14; i++) {
        const num = i.toString().padStart(2, '0')

        expect(TYPE4_CREDIT_ALLOCATION[`agencia_credito_${num}`]).toBeDefined()
        expect(TYPE4_CREDIT_ALLOCATION[`conta_credito_${num}`]).toBeDefined()
        expect(TYPE4_CREDIT_ALLOCATION[`dac_credito_${num}`]).toBeDefined()
        expect(TYPE4_CREDIT_ALLOCATION[`valor_credito_${num}`]).toBeDefined()
      }
    })

    test('cada bloco deve ter estrutura consistente (agencia 4 + conta 7 + dac 1 + valor 13)', () => {
      for (let i = 1; i <= 14; i++) {
        const num = i.toString().padStart(2, '0')

        const agencia = TYPE4_CREDIT_ALLOCATION[`agencia_credito_${num}`]
        const conta = TYPE4_CREDIT_ALLOCATION[`conta_credito_${num}`]
        const dac = TYPE4_CREDIT_ALLOCATION[`dac_credito_${num}`]
        const valor = TYPE4_CREDIT_ALLOCATION[`valor_credito_${num}`]

        expect(agencia.type).toBe('num')
        expect(agencia.size).toBe(4)

        expect(conta.type).toBe('num')
        expect(conta.size).toBe(7)

        expect(dac.type).toBe('num')
        expect(dac.size).toBe(1)

        expect(valor.type).toBe('num')
        expect(valor.size).toBe(13)
        expect(valor.decimals).toBe(2)
      }
    })

    test('primeiro bloco deve começar na posição 44', () => {
      const agencia01 = TYPE4_CREDIT_ALLOCATION.agencia_credito_01

      expect(agencia01.pos).toEqual([44, 47])
    })

    test('último bloco (14) deve terminar na posição 393', () => {
      const valor14 = TYPE4_CREDIT_ALLOCATION.valor_credito_14

      expect(valor14.pos[1]).toBe(393)
    })

    test('blocos devem ser contíguos sem gaps (cada bloco tem 25 bytes)', () => {
      for (let i = 1; i <= 14; i++) {
        const num = i.toString().padStart(2, '0')

        const agencia = TYPE4_CREDIT_ALLOCATION[`agencia_credito_${num}`]
        const conta = TYPE4_CREDIT_ALLOCATION[`conta_credito_${num}`]
        const dac = TYPE4_CREDIT_ALLOCATION[`dac_credito_${num}`]
        const valor = TYPE4_CREDIT_ALLOCATION[`valor_credito_${num}`]

        // Verificar que os campos são contíguos dentro do bloco
        expect(conta.pos[0]).toBe(agencia.pos[1] + 1)
        expect(dac.pos[0]).toBe(conta.pos[1] + 1)
        expect(valor.pos[0]).toBe(dac.pos[1] + 1)

        // Cada bloco tem 25 bytes (4 + 7 + 1 + 13)
        const tamanhoBloco = valor.pos[1] - agencia.pos[0] + 1
        expect(tamanhoBloco).toBe(25)

        // Verificar que o próximo bloco começa onde este termina (exceto no último)
        if (i < 14) {
          const nextNum = (i + 1).toString().padStart(2, '0')
          const nextAgencia = TYPE4_CREDIT_ALLOCATION[`agencia_credito_${nextNum}`]
          expect(nextAgencia.pos[0]).toBe(valor.pos[1] + 1)
        }
      }
    })
  })

  describe('Campos finais (posições 394-400)', () => {
    test('deve ter tipo_valor (num) na posição 394', () => {
      const field = TYPE4_CREDIT_ALLOCATION.tipo_valor

      expect(field.pos).toEqual([394, 394])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
      expect(field.description).toContain('valor ou percentual')
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = TYPE4_CREDIT_ALLOCATION.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })

    test('não deve ter campo brancos (tipo_valor vai direto para numero_sequencial)', () => {
      expect(TYPE4_CREDIT_ALLOCATION.brancos).toBeUndefined()
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const fields = Object.entries(TYPE4_CREDIT_ALLOCATION).sort((a, b) => a[1].pos[0] - b[1].pos[0])

      for (let i = 0; i < fields.length - 1; i++) {
        const [, fieldA] = fields[i]
        const [, fieldB] = fields[i + 1]

        const endA = fieldA.pos[1]
        const startB = fieldB.pos[0]

        expect(endA).toBeLessThan(startB)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      Object.entries(TYPE4_CREDIT_ALLOCATION).forEach(([, field]) => {
        const tamanhoCalculado = field.pos[1] - field.pos[0] + 1
        expect(field.size).toBe(tamanhoCalculado)
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE4_CREDIT_ALLOCATION.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas', () => {
    test('cada valor de crédito deve suportar até 99.999.999.999,99', () => {
      const valor01 = TYPE4_CREDIT_ALLOCATION.valor_credito_01

      // 13 posições com 2 decimais = 11 dígitos inteiros + 2 decimais
      expect(valor01.size).toBe(13)
      expect(valor01.decimals).toBe(2)
    })

    test('todos os campos de valor devem ter mesma estrutura', () => {
      for (let i = 1; i <= 14; i++) {
        const num = i.toString().padStart(2, '0')
        const valor = TYPE4_CREDIT_ALLOCATION[`valor_credito_${num}`]

        expect(valor.size).toBe(13)
        expect(valor.decimals).toBe(2)
        expect(valor.type).toBe('num')
      }
    })

    test('tipo_registro deve ter padrão "4" fixo', () => {
      const field = TYPE4_CREDIT_ALLOCATION.tipo_registro

      expect(field.pattern).toBe('4')
      expect(field.required).toBe(true)
    })

    test('deve ter 69 campos no total (11 controle + 14*4 blocos + 2 finais)', () => {
      const totalCampos = Object.keys(TYPE4_CREDIT_ALLOCATION).length

      // 11 campos de controle (tipo_registro até sequencia_registro)
      // + 14 blocos * 4 campos (agencia, conta, dac, valor)
      // + 2 campos finais (tipo_valor, numero_sequencial)
      expect(totalCampos).toBe(11 + 14 * 4 + 2)
    })

    test('campos de controle devem incluir identificação completa do título', () => {
      // Campos necessários para vincular ao tipo 1 correspondente
      expect(TYPE4_CREDIT_ALLOCATION.agencia).toBeDefined()
      expect(TYPE4_CREDIT_ALLOCATION.conta).toBeDefined()
      expect(TYPE4_CREDIT_ALLOCATION.dac).toBeDefined()
      expect(TYPE4_CREDIT_ALLOCATION.numero_carteira).toBeDefined()
      expect(TYPE4_CREDIT_ALLOCATION.nosso_numero).toBeDefined()
      expect(TYPE4_CREDIT_ALLOCATION.dac_nosso_numero).toBeDefined()
    })

    test('sequencia_registro indica qual dos 3 registros tipo 4 possíveis este é', () => {
      const field = TYPE4_CREDIT_ALLOCATION.sequencia_registro

      expect(field.size).toBe(2)
      expect(field.description).toContain('1 a 3')
    })
  })
})

