/**
 * Testes de Integridade do Schema - Bradesco CNAB 240
 * 
 * Valida a consistência interna do schema:
 * - Não há sobreposição de posições entre campos
 * - Tamanhos declarados batem com as posições
 */

import { bradescoCnab240 } from '../../../../../src/banks/bradesco/schemas/cnab240'

describe('Schema Bradesco CNAB 240 - Integridade', () => {
  describe('Sobreposição de posições', () => {
    test('não deve ter sobreposição de posições no Header', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(bradescoCnab240.headerArquivo!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('não deve ter sobreposição de posições no Segmento P', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(bradescoCnab240.segmentoP!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('não deve ter sobreposição de posições no Segmento Q', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(bradescoCnab240.segmentoQ!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('não deve ter sobreposição de posições no Header do Lote', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(bradescoCnab240.headerLote!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('não deve ter sobreposição de posições no Segmento R', () => {
      const positions = new Set<number>()
      const segmentoR = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'R')?.schema
      expect(segmentoR).toBeDefined()
      
      for (const field of Object.values(segmentoR!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('não deve ter sobreposição de posições no Trailer do Lote', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(bradescoCnab240.trailerLote!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('não deve ter sobreposição de posições no Trailer do Arquivo', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(bradescoCnab240.trailerArquivo!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('não deve ter sobreposição de posições no Segmento Y01', () => {
      const positions = new Set<number>()
      const segmentoY01 = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'Y01')?.schema
      expect(segmentoY01).toBeDefined()
      
      for (const field of Object.values(segmentoY01!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('não deve ter sobreposição de posições no Segmento Y04', () => {
      const positions = new Set<number>()
      const segmentoY04 = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'Y04')?.schema
      expect(segmentoY04).toBeDefined()
      
      for (const field of Object.values(segmentoY04!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('não deve ter sobreposição de posições no Segmento Y50', () => {
      const positions = new Set<number>()
      const segmentoY50 = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'Y50')?.schema
      expect(segmentoY50).toBeDefined()
      
      for (const field of Object.values(segmentoY50!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })
  })

  describe('Consistência de tamanhos', () => {
    test('tamanho declarado deve bater com posições no Header', () => {
      for (const field of Object.values(bradescoCnab240.headerArquivo!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('tamanho declarado deve bater com posições no Segmento P', () => {
      for (const field of Object.values(bradescoCnab240.segmentoP!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('tamanho declarado deve bater com posições no Segmento Q', () => {
      for (const field of Object.values(bradescoCnab240.segmentoQ!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('tamanho declarado deve bater com posições no Header do Lote', () => {
      for (const field of Object.values(bradescoCnab240.headerLote!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('tamanho declarado deve bater com posições no Segmento R', () => {
      const segmentoR = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'R')?.schema
      expect(segmentoR).toBeDefined()
      
      for (const field of Object.values(segmentoR!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('tamanho declarado deve bater com posições no Trailer do Lote', () => {
      for (const field of Object.values(bradescoCnab240.trailerLote!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('tamanho declarado deve bater com posições no Trailer do Arquivo', () => {
      for (const field of Object.values(bradescoCnab240.trailerArquivo!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('tamanho declarado deve bater com posições no Segmento Y01', () => {
      const segmentoY01 = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'Y01')?.schema
      expect(segmentoY01).toBeDefined()
      
      for (const field of Object.values(segmentoY01!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('tamanho declarado deve bater com posições no Segmento Y04', () => {
      const segmentoY04 = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'Y04')?.schema
      expect(segmentoY04).toBeDefined()
      
      for (const field of Object.values(segmentoY04!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('tamanho declarado deve bater com posições no Segmento Y50', () => {
      const segmentoY50 = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'Y50')?.schema
      expect(segmentoY50).toBeDefined()
      
      for (const field of Object.values(segmentoY50!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })
  })
})
