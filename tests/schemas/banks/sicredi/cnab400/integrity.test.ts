/**
 * Testes de Integridade do Schema Sicredi CNAB 400
 *
 * Verifica que os schemas não têm sobreposição de posições e que os tamanhos
 * declarados batem com as posições efetivas.
 */

import { HEADER } from '../../../../../src/banks/sicredi/schemas/cnab400/header'
import { DETAIL } from '../../../../../src/banks/sicredi/schemas/cnab400/detail'
import { TRAILER } from '../../../../../src/banks/sicredi/schemas/cnab400/trailer'

function checkFieldIntegrity(schema: any, schemaName: string) {
  const campos = Object.keys(schema)
  const posicoes: { campo: string; inicio: number; fim: number }[] = []

  // Coletar todas as posições
  campos.forEach((campo) => {
    const fieldDef = schema[campo]
    if (fieldDef.pos) {
      posicoes.push({
        campo,
        inicio: fieldDef.pos[0],
        fim: fieldDef.pos[1],
      })
    }
  })

  // Ordenar por posição inicial
  posicoes.sort((a, b) => a.inicio - b.inicio)

  // Verificar sobreposições
  for (let i = 0; i < posicoes.length - 1; i++) {
    const atual = posicoes[i]
    const proximo = posicoes[i + 1]

    if (atual.fim >= proximo.inicio) {
      return {
        valid: false,
        message: `${schemaName}: Sobreposição detectada entre ${atual.campo} (${atual.inicio}-${atual.fim}) e ${proximo.campo} (${proximo.inicio}-${proximo.fim})`,
      }
    }
  }

  // Verificar tamanhos
  for (const campo of campos) {
    const fieldDef = schema[campo]
    if (fieldDef.pos && fieldDef.size !== undefined) {
      const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
      if (tamanhoCalculado !== fieldDef.size) {
        return {
          valid: false,
          message: `${schemaName}.${campo}: Tamanho declarado (${fieldDef.size}) não bate com posições ${fieldDef.pos[0]}-${fieldDef.pos[1]} (tamanho real: ${tamanhoCalculado})`,
        }
      }
    }
  }

  return { valid: true }
}

describe('Schema Sicredi CNAB 400 - Integridade', () => {
  describe('Header de Arquivo', () => {
    test('não deve ter sobreposição de posições', () => {
      const result = checkFieldIntegrity(HEADER, 'HEADER')
      expect(result.valid).toBe(true)
      if (!result.valid) {
        fail(result.message)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      const campos = Object.keys(HEADER)
      campos.forEach((campo) => {
        const fieldDef = HEADER[campo]
        if (fieldDef.pos && fieldDef.size !== undefined) {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(tamanhoCalculado).toBe(fieldDef.size)
        }
      })
    })
  })

  describe('Detail (Registro Tipo 1)', () => {
    test('não deve ter sobreposição de posições', () => {
      const result = checkFieldIntegrity(DETAIL, 'DETAIL')
      expect(result.valid).toBe(true)
      if (!result.valid) {
        fail(result.message)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      const campos = Object.keys(DETAIL)
      campos.forEach((campo) => {
        const fieldDef = DETAIL[campo]
        if (fieldDef.pos && fieldDef.size !== undefined) {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(tamanhoCalculado).toBe(fieldDef.size)
        }
      })
    })
  })

  describe('Trailer', () => {
    test('não deve ter sobreposição de posições', () => {
      const result = checkFieldIntegrity(TRAILER, 'TRAILER')
      expect(result.valid).toBe(true)
      if (!result.valid) {
        fail(result.message)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      const campos = Object.keys(TRAILER)
      campos.forEach((campo) => {
        const fieldDef = TRAILER[campo]
        if (fieldDef.pos && fieldDef.size !== undefined) {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(tamanhoCalculado).toBe(fieldDef.size)
        }
      })
    })
  })
})
