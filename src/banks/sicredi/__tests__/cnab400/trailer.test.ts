/**
 * Testes do Schema Sicredi CNAB 400 - Trailer
 *
 * Verifica a definição do schema do trailer conforme o manual oficial Sicredi
 * (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.8, p.36
 */

import { TRAILER } from '@banks/sicredi/schemas/cnab400/trailer'

describe('Schema Sicredi CNAB 400 - Trailer', () => {
  describe('Definição dos campos', () => {
    test('deve ter tipo de registro "9" (trailer) na posição 1', () => {
      expect(TRAILER.tipo_registro).toBeDefined()
      expect(TRAILER.tipo_registro.pos).toEqual([1, 1])
      expect(TRAILER.tipo_registro.type).toBe('num')
      expect(TRAILER.tipo_registro.size).toBe(1)
      expect(TRAILER.tipo_registro.pattern).toBe('9')
      expect(TRAILER.tipo_registro.required).toBe(true)
    })

    test('deve ter tipo de identificação de arquivo na posição 2', () => {
      expect(TRAILER.tipo_identificacao_arquivo).toBeDefined()
      expect(TRAILER.tipo_identificacao_arquivo.pos).toEqual([2, 2])
      expect(TRAILER.tipo_identificacao_arquivo.type).toBe('num')
      expect(TRAILER.tipo_identificacao_arquivo.size).toBe(1)
      expect(TRAILER.tipo_identificacao_arquivo.pattern).toBe('1')
      expect(TRAILER.tipo_identificacao_arquivo.required).toBe(true)
    })

    test('deve ter código do banco na posição 3-5 com padrão "748"', () => {
      expect(TRAILER.codigo_banco).toBeDefined()
      expect(TRAILER.codigo_banco.pos).toEqual([3, 5])
      expect(TRAILER.codigo_banco.type).toBe('num')
      expect(TRAILER.codigo_banco.size).toBe(3)
      expect(TRAILER.codigo_banco.pattern).toBe('748')
      expect(TRAILER.codigo_banco.required).toBe(true)
    })

    test('deve ter código do cliente na posição 6-10', () => {
      expect(TRAILER.codigo_cliente).toBeDefined()
      expect(TRAILER.codigo_cliente.pos).toEqual([6, 10])
      expect(TRAILER.codigo_cliente.type).toBe('num')
      expect(TRAILER.codigo_cliente.size).toBe(5)
      expect(TRAILER.codigo_cliente.required).toBe(true)
    })

    test('deve ter brancos na posição 11-394', () => {
      expect(TRAILER.brancos).toBeDefined()
      expect(TRAILER.brancos.pos).toEqual([11, 394])
      expect(TRAILER.brancos.type).toBe('alfa')
      expect(TRAILER.brancos.size).toBe(384)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TRAILER.numero_sequencial).toBeDefined()
      expect(TRAILER.numero_sequencial.pos).toEqual([395, 400])
      expect(TRAILER.numero_sequencial.type).toBe('num')
      expect(TRAILER.numero_sequencial.size).toBe(6)
      expect(TRAILER.numero_sequencial.required).toBe(true)
    })
  })

  describe('Particularidades do Sicredi', () => {
    test('trailer repete código do banco e código do cliente do header', () => {
      expect(TRAILER.codigo_banco).toBeDefined()
      expect(TRAILER.codigo_cliente).toBeDefined()
    })

    test('não deve ter totalizadores (diferente de alguns bancos)', () => {
      expect(TRAILER.qtd_documentos).toBeUndefined()
      expect(TRAILER.valor_total).toBeUndefined()
    })

    test('campo brancos deve ser o maior campo do layout', () => {
      const campos = Object.values(TRAILER)
      const tamanhos = campos.map((campo: any) => campo.size || 0)
      const maiorTamanho = Math.max(...tamanhos)

      expect(TRAILER.brancos.size).toBe(maiorTamanho)
      expect(TRAILER.brancos.size).toBe(384)
    })
  })
})
