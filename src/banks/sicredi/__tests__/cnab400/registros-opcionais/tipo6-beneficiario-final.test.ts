/**
 * Testes do Schema Sicredi CNAB 400 - Registro Tipo 6 (Beneficiário Final)
 *
 * Registro obrigatório quando houver Beneficiário Final para o título. Contém campos
 * de endereço completos (logradouro, cidade, CEP, UF), além de documento e nome.
 *
 * Fonte: Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.5, p.33
 */

import { TYPE6_ENDORSER } from '@banks/sicredi/schemas/cnab400/registros-opcionais/type6-endorser/type6-endorser'

describe('Schema Sicredi CNAB 400 - Registro Tipo 6 (Beneficiário Final)', () => {
  describe('Campos de controle', () => {
    test('deve ter tipo de registro "6" na posição 1', () => {
      expect(TYPE6_ENDORSER.tipo_registro).toBeDefined()
      expect(TYPE6_ENDORSER.tipo_registro.pos).toEqual([1, 1])
      expect(TYPE6_ENDORSER.tipo_registro.type).toBe('num')
      expect(TYPE6_ENDORSER.tipo_registro.size).toBe(1)
      expect(TYPE6_ENDORSER.tipo_registro.pattern).toBe('6')
      expect(TYPE6_ENDORSER.tipo_registro.required).toBe(true)
    })

    test('deve ter nosso número na posição 2-16', () => {
      expect(TYPE6_ENDORSER.nosso_numero).toBeDefined()
      expect(TYPE6_ENDORSER.nosso_numero.pos).toEqual([2, 16])
      expect(TYPE6_ENDORSER.nosso_numero.type).toBe('alfa')
      expect(TYPE6_ENDORSER.nosso_numero.size).toBe(15)
    })

    test('deve ter número do documento na posição 17-26', () => {
      expect(TYPE6_ENDORSER.numero_documento).toBeDefined()
      expect(TYPE6_ENDORSER.numero_documento.pos).toEqual([17, 26])
      expect(TYPE6_ENDORSER.numero_documento.type).toBe('alfa')
      expect(TYPE6_ENDORSER.numero_documento.size).toBe(10)
    })

    test('deve ter código do pagador junto ao cliente na posição 27-31', () => {
      expect(TYPE6_ENDORSER.codigo_pagador_cliente).toBeDefined()
      expect(TYPE6_ENDORSER.codigo_pagador_cliente.pos).toEqual([27, 31])
      expect(TYPE6_ENDORSER.codigo_pagador_cliente.type).toBe('alfa')
      expect(TYPE6_ENDORSER.codigo_pagador_cliente.size).toBe(5)
    })
  })

  describe('Campos do Beneficiário Final', () => {
    test('deve ter número de inscrição do Beneficiário Final na posição 32-45', () => {
      expect(TYPE6_ENDORSER.numero_inscricao_beneficiario_final).toBeDefined()
      expect(TYPE6_ENDORSER.numero_inscricao_beneficiario_final.pos).toEqual([32, 45])
      expect(TYPE6_ENDORSER.numero_inscricao_beneficiario_final.type).toBe('num')
      expect(TYPE6_ENDORSER.numero_inscricao_beneficiario_final.size).toBe(14)
      expect(TYPE6_ENDORSER.numero_inscricao_beneficiario_final.required).toBe(true)
    })

    test('deve ter nome do Beneficiário Final na posição 46-86', () => {
      expect(TYPE6_ENDORSER.nome_beneficiario_final).toBeDefined()
      expect(TYPE6_ENDORSER.nome_beneficiario_final.pos).toEqual([46, 86])
      expect(TYPE6_ENDORSER.nome_beneficiario_final.type).toBe('alfa')
      expect(TYPE6_ENDORSER.nome_beneficiario_final.size).toBe(41)
      expect(TYPE6_ENDORSER.nome_beneficiario_final.required).toBe(true)
    })

    test('deve ter endereço do Beneficiário Final na posição 87-131', () => {
      expect(TYPE6_ENDORSER.endereco).toBeDefined()
      expect(TYPE6_ENDORSER.endereco.pos).toEqual([87, 131])
      expect(TYPE6_ENDORSER.endereco.type).toBe('alfa')
      expect(TYPE6_ENDORSER.endereco.size).toBe(45)
      expect(TYPE6_ENDORSER.endereco.required).toBe(true)
    })

    test('deve ter cidade do Beneficiário Final na posição 132-151', () => {
      expect(TYPE6_ENDORSER.cidade).toBeDefined()
      expect(TYPE6_ENDORSER.cidade.pos).toEqual([132, 151])
      expect(TYPE6_ENDORSER.cidade.type).toBe('alfa')
      expect(TYPE6_ENDORSER.cidade.size).toBe(20)
    })

    test('deve ter CEP do Beneficiário Final na posição 152-159', () => {
      expect(TYPE6_ENDORSER.cep).toBeDefined()
      expect(TYPE6_ENDORSER.cep.pos).toEqual([152, 159])
      expect(TYPE6_ENDORSER.cep.type).toBe('num')
      expect(TYPE6_ENDORSER.cep.size).toBe(8)
    })

    test('deve ter UF do Beneficiário Final na posição 160-161', () => {
      expect(TYPE6_ENDORSER.uf).toBeDefined()
      expect(TYPE6_ENDORSER.uf.pos).toEqual([160, 161])
      expect(TYPE6_ENDORSER.uf.type).toBe('alfa')
      expect(TYPE6_ENDORSER.uf.size).toBe(2)
      expect(TYPE6_ENDORSER.uf.required).toBe(true)
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos na posição 162-394', () => {
      expect(TYPE6_ENDORSER.brancos).toBeDefined()
      expect(TYPE6_ENDORSER.brancos.pos).toEqual([162, 394])
      expect(TYPE6_ENDORSER.brancos.type).toBe('alfa')
      expect(TYPE6_ENDORSER.brancos.size).toBe(233)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE6_ENDORSER.numero_sequencial).toBeDefined()
      expect(TYPE6_ENDORSER.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE6_ENDORSER.numero_sequencial.type).toBe('num')
      expect(TYPE6_ENDORSER.numero_sequencial.size).toBe(6)
      expect(TYPE6_ENDORSER.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.keys(TYPE6_ENDORSER)
      const posicoes: { campo: string; inicio: number; fim: number }[] = []

      campos.forEach((campo) => {
        const fieldDef = TYPE6_ENDORSER[campo]
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
      const campos = Object.keys(TYPE6_ENDORSER)
      campos.forEach((campo) => {
        const fieldDef = TYPE6_ENDORSER[campo]
        if (fieldDef.pos && fieldDef.size !== undefined) {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(tamanhoCalculado).toBe(fieldDef.size)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE6_ENDORSER.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro deve ter padrão fixo "6"', () => {
      expect(TYPE6_ENDORSER.tipo_registro.pattern).toBe('6')
    })

    test('deve usar nomenclatura "Beneficiário Final" (BACEN 3598/3656/3956)', () => {
      expect(TYPE6_ENDORSER.numero_inscricao_beneficiario_final.description).toContain('Beneficiário Final')
      expect(TYPE6_ENDORSER.nome_beneficiario_final.description).toContain('Beneficiário Final')
    })

    test('campo brancos deve ser o maior campo do layout', () => {
      const campos = Object.values(TYPE6_ENDORSER)
      const tamanhos = campos.map((campo: any) => campo.size || 0)
      const maiorTamanho = Math.max(...tamanhos)

      expect(TYPE6_ENDORSER.brancos.size).toBe(maiorTamanho)
      expect(TYPE6_ENDORSER.brancos.size).toBe(233)
    })

    test('deve ter campos de endereço completos', () => {
      expect(TYPE6_ENDORSER.endereco).toBeDefined()
      expect(TYPE6_ENDORSER.cidade).toBeDefined()
      expect(TYPE6_ENDORSER.cep).toBeDefined()
      expect(TYPE6_ENDORSER.uf).toBeDefined()
    })
  })
})
