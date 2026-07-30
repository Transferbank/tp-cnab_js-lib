/**
 * Testes do Schema Itaú CNAB 400 - Registro Tipo 5 (E-mail / Sacador-Avalista)
 *
 * Registro opcional que informa e-mail do pagador e/ou complementa dados do sacador/avalista.
 */

import { TYPE5_EMAIL_ENDORSER } from '@banks/itau/schemas/cnab400/registros-opcionais/type5-email-endorser/type5-email-endorser'

describe('Schema Itaú CNAB 400 - Registro Tipo 5 (E-mail / Sacador-Avalista)', () => {
  describe('Campo de controle', () => {
    test('deve ter tipo de registro "5" na posição 1', () => {
      const field = TYPE5_EMAIL_ENDORSER.tipo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('5')
    })
  })

  describe('E-mail do pagador', () => {
    test('deve ter e-mail do pagador na posição 2-121', () => {
      const field = TYPE5_EMAIL_ENDORSER.email_pagador

      expect(field.pos).toEqual([2, 121])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(120)
      expect(field.required).toBe(false)
    })

    test('e-mail do pagador deve ser o maior campo de conteúdo do layout (120 caracteres)', () => {
      // Filtrar apenas campos de conteúdo (excluir brancos/filler)
      const camposPorTamanho = Object.entries(TYPE5_EMAIL_ENDORSER)
        .filter(([name, field]) => field.type === 'alfa' && name !== 'brancos')
        .map(([name, field]) => ({ name, size: field.size }))
        .sort((a, b) => b.size - a.size)

      expect(camposPorTamanho[0].name).toBe('email_pagador')
      expect(camposPorTamanho[0].size).toBe(120)
    })
  })

  describe('Dados do sacador/avalista', () => {
    test('deve ter tipo de inscrição do sacador na posição 122-123', () => {
      const field = TYPE5_EMAIL_ENDORSER.sacador_codigo_inscricao

      expect(field.pos).toEqual([122, 123])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter número de inscrição (CPF/CNPJ) do sacador na posição 124-137', () => {
      const field = TYPE5_EMAIL_ENDORSER.sacador_numero_inscricao

      expect(field.pos).toEqual([124, 137])
      expect(field.type).toBe('num')
      expect(field.size).toBe(14)
      expect(field.required).toBe(false)
    })

    test('deve ter logradouro do sacador na posição 138-177', () => {
      const field = TYPE5_EMAIL_ENDORSER.sacador_logradouro

      expect(field.pos).toEqual([138, 177])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
    })

    test('deve ter bairro do sacador na posição 178-189', () => {
      const field = TYPE5_EMAIL_ENDORSER.sacador_bairro

      expect(field.pos).toEqual([178, 189])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(12)
      expect(field.required).toBe(false)
    })

    test('deve ter CEP do sacador na posição 190-197', () => {
      const field = TYPE5_EMAIL_ENDORSER.sacador_cep

      expect(field.pos).toEqual([190, 197])
      expect(field.type).toBe('num')
      expect(field.size).toBe(8)
      expect(field.required).toBe(false)
    })

    test('deve ter cidade do sacador na posição 198-212', () => {
      const field = TYPE5_EMAIL_ENDORSER.sacador_cidade

      expect(field.pos).toEqual([198, 212])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(15)
      expect(field.required).toBe(false)
    })

    test('deve ter estado (UF) do sacador na posição 213-214', () => {
      const field = TYPE5_EMAIL_ENDORSER.sacador_estado

      expect(field.pos).toEqual([213, 214])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos na posição 215-394', () => {
      const field = TYPE5_EMAIL_ENDORSER.brancos

      expect(field.pos).toEqual([215, 394])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(180)
      expect(field.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = TYPE5_EMAIL_ENDORSER.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const fields = Object.entries(TYPE5_EMAIL_ENDORSER).sort(
        (a, b) => a[1].pos[0] - b[1].pos[0],
      )

      for (let i = 0; i < fields.length - 1; i++) {
        const [, fieldA] = fields[i]
        const [, fieldB] = fields[i + 1]

        const endA = fieldA.pos[1]
        const startB = fieldB.pos[0]

        expect(endA).toBeLessThan(startB)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      Object.entries(TYPE5_EMAIL_ENDORSER).forEach(([, field]) => {
        const tamanhoCalculado = field.pos[1] - field.pos[0] + 1
        expect(field.size).toBe(tamanhoCalculado)
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE5_EMAIL_ENDORSER.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro deve ter padrão "5" fixo', () => {
      const field = TYPE5_EMAIL_ENDORSER.tipo_registro

      expect(field.pattern).toBe('5')
      expect(field.required).toBe(true)
    })

    test('todos os campos de endereço do sacador devem estar presentes', () => {
      // Verificar que todos os campos de endereço completo estão definidos
      expect(TYPE5_EMAIL_ENDORSER.sacador_logradouro).toBeDefined()
      expect(TYPE5_EMAIL_ENDORSER.sacador_bairro).toBeDefined()
      expect(TYPE5_EMAIL_ENDORSER.sacador_cep).toBeDefined()
      expect(TYPE5_EMAIL_ENDORSER.sacador_cidade).toBeDefined()
      expect(TYPE5_EMAIL_ENDORSER.sacador_estado).toBeDefined()
    })

    test('campos de identificação do sacador devem estar completos (tipo e número)', () => {
      expect(TYPE5_EMAIL_ENDORSER.sacador_codigo_inscricao).toBeDefined()
      expect(TYPE5_EMAIL_ENDORSER.sacador_numero_inscricao).toBeDefined()

      // Tamanho 14 suporta tanto CPF (11) quanto CNPJ (14)
      expect(TYPE5_EMAIL_ENDORSER.sacador_numero_inscricao.size).toBe(14)
    })

    test('não deve ter campo sacador_nome (não existe no schema)', () => {
      expect(TYPE5_EMAIL_ENDORSER.sacador_nome).toBeUndefined()
    })

    test('deve ter 11 campos no total', () => {
      const totalCampos = Object.keys(TYPE5_EMAIL_ENDORSER).length

      // 1 tipo_registro + 1 email_pagador + 2 sacador_identificacao + 5 sacador_endereco + 1 brancos + 1 numero_sequencial
      expect(totalCampos).toBe(11)
    })
  })
})


