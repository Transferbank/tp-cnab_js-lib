/**
 * Testes para o validador estrutural de CNAB 240
 */

import { validateCnab240Structure } from '@validators/cnab240-structure-validator'
import { getBankSchema } from '@schemas/index'
import { readFileSync } from 'fs'
import { join } from 'path'
import { CNABFormatCode } from '@tp-types/index'

describe('validateCnab240Structure', () => {
  describe('Validação básica de tamanho', () => {
    test('deve rejeitar arquivo com menos de 4 linhas', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const lines = ['X'.repeat(240), 'Y'.repeat(240)]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].message).toContain('mínimo 4 registros')
    })

    test('deve rejeitar linha com tamanho incorreto', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const lines = [
        '0'.repeat(240), // Header Arquivo
        '1'.repeat(240), // Header Lote
        'X'.repeat(200), // LINHA INCORRETA - 200 chars
        '9'.repeat(240), // Trailer Arquivo
      ]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 3,
          field: 'Tamanho do registro',
          message: expect.stringContaining('240 caracteres'),
        })
      )
    })
  })

  describe('Identificação de tipo de registro', () => {
    test('deve rejeitar tipo de registro desconhecido', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      // Linha com tipo '7' na posição 8 (inexistente no CNAB 240)
      const invalidLine = '0'.repeat(7) + '7' + '0'.repeat(232)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)
      
      const lines = [
        headerArquivo,
        headerLote,
        invalidLine,
        trailerLote,
        trailerArquivo,
      ]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 3,
          field: 'Tipo de registro',
          message: expect.stringContaining('não reconhecido'),
        })
      )
    })

    test('deve identificar corretamente Header de Arquivo (tipo 0)', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
      const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

      const lines = [headerArquivo, headerLote, segP, segQ, trailerLote, trailerArquivo]

      const result = validateCnab240Structure(lines, bradesco)

      // Estrutura básica deve ser reconhecida
      expect(result.batchCount).toBe(1)
      expect(result.billCount).toBe(1)
    })
  })

  describe('Sequência de Header e Trailer de Arquivo', () => {
    test('deve exigir Header de Arquivo na primeira linha', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)

      const lines = [headerLote, headerArquivo, '0'.repeat(240), '0'.repeat(240)]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'Header de Arquivo',
          message: expect.stringContaining('primeira linha'),
        })
      )
    })

    test('deve rejeitar Header de Arquivo duplicado', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)

      const lines = [headerArquivo, headerArquivo, '0'.repeat(240), '0'.repeat(240)]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'Header de Arquivo',
          message: expect.stringContaining('duplicado'),
        })
      )
    })

    test('deve exigir Trailer de Arquivo na última linha', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)
      const extra = '0'.repeat(240)

      const lines = [headerArquivo, '0'.repeat(240), trailerArquivo, extra]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'Trailer de Arquivo',
          message: expect.stringContaining('última linha'),
        })
      )
    })

    test('deve detectar arquivo sem Trailer de Arquivo', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)

      const lines = [headerArquivo, headerLote, '0'.repeat(240), '0'.repeat(240)]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'Estrutura',
          message: expect.stringContaining('sem Trailer de Arquivo'),
        })
      )
    })
  })

  describe('Estrutura de Lotes', () => {
    test('deve contar lotes corretamente', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
      const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

      const lines = [
        headerArquivo,
        headerLote,
        segP,
        segQ,
        trailerLote,
        headerLote, // Segundo lote
        segP,
        segQ,
        trailerLote,
        trailerArquivo,
      ]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.batchCount).toBe(2)
      expect(result.billCount).toBe(2)
    })

    test('deve rejeitar Header de Lote sem Trailer de Lote anterior', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)

      const lines = [headerArquivo, headerLote, headerLote, '0'.repeat(240)]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 3,
          field: 'Header de Lote',
          message: expect.stringContaining('sem Trailer de Lote correspondente'),
        })
      )
      // 4i - Reforço: dois lotes foram abertos
      expect(result.batchCount).toBe(2)
    })

    test('deve rejeitar lote vazio (sem títulos)', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

      const lines = [headerArquivo, headerLote, trailerLote, trailerArquivo]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'Trailer de Lote',
          message: expect.stringContaining('sem nenhum título'),
        })
      )
    })
  })

  describe('Pares P+Q obrigatórios', () => {
    test('deve contar boletos corretamente', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
      const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

      const lines = [
        headerArquivo,
        headerLote,
        segP,
        segQ,
        segP, // Segundo boleto
        segQ,
        segP, // Terceiro boleto
        segQ,
        trailerLote,
        trailerArquivo,
      ]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.billCount).toBe(3)
      expect(result.batchCount).toBe(1)
    })

    test('deve rejeitar Segmento Q sem Segmento P', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

      const lines = [headerArquivo, headerLote, segQ, trailerLote, trailerArquivo]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'Segmento Q',
          message: expect.stringContaining('sem Segmento P correspondente'),
        })
      )
      // 4h - Reforço: boleto count deve ser zero
      expect(result.billCount).toBe(0)
    })

    test('deve rejeitar Segmento P sem Segmento Q (seguido por outro P)', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
      const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

      const lines = [
        headerArquivo,
        headerLote,
        segP, // Primeiro P
        segP, // Segundo P sem Q do primeiro
        segQ,
        trailerLote,
        trailerArquivo,
      ]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 4,
          field: 'Segmento P',
          message: expect.stringContaining('sem Segmento Q correspondente'),
        })
      )
    })

    test('deve rejeitar Trailer de Lote com Segmento P pendente', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

      const lines = [headerArquivo, headerLote, segP, trailerLote, trailerArquivo]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'Trailer de Lote',
          message: expect.stringContaining('Segmento P pendente'),
        })
      )
    })
  })

  describe('Segmentos opcionais (R, S, Y*)', () => {
    test('deve aceitar Segmento R após par P+Q completo', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
      const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
      const segR = '0'.repeat(7) + '3' + '0'.repeat(5) + 'R' + '0'.repeat(226)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

      const lines = [headerArquivo, headerLote, segP, segQ, segR, trailerLote, trailerArquivo]

      const result = validateCnab240Structure(lines, bradesco)

      // Deve aceitar sem erros estruturais
      const structuralErrors = result.errors.filter(e => !e.message.includes('não está definido'))
      expect(structuralErrors).toHaveLength(0)
    })

    test('deve rejeitar Segmento R sem par P+Q antes', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const segR = '0'.repeat(7) + '3' + '0'.repeat(5) + 'R' + '0'.repeat(226)
      const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
      const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

      const lines = [headerArquivo, headerLote, segR, segP, segQ, trailerLote, trailerArquivo]

      const result = validateCnab240Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 3,
          message: expect.stringContaining('sem par P+Q completo antes'),
        })
      )
    })

    test('deve aceitar múltiplos segmentos opcionais em sequência', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
      const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
      const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
      const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
      const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
      const segR = '0'.repeat(7) + '3' + '0'.repeat(5) + 'R' + '0'.repeat(226)
      const segS = '0'.repeat(7) + '3' + '0'.repeat(5) + 'S' + '0'.repeat(226)
      const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
      const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

      const lines = [headerArquivo, headerLote, segP, segQ, segR, segS, trailerLote, trailerArquivo]

      const result = validateCnab240Structure(lines, bradesco)

      // Múltiplos opcionais devem ser aceitos
      const structuralErrors = result.errors.filter(e => !e.message.includes('não está definido'))
      expect(structuralErrors).toHaveLength(0)
    })
  })

  describe('Validação com arquivo real', () => {
    test('deve validar arquivo CNAB 240 real do Bradesco', () => {
      const fixturePath = join(__dirname, '../../banks/bradesco/docs/cnab240/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const lines = fileContent.split(/\r?\n/).filter(l => l.length > 0)
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!

      const result = validateCnab240Structure(lines, bradesco)

      // Arquivo fixture deve ter estrutura válida
      expect(result.batchCount).toBeGreaterThan(0)
      expect(result.billCount).toBeGreaterThan(0)
      
      // Não deve ter erros estruturais graves
      const criticalErrors = result.errors.filter(e => 
        e.message.includes('sem Header') ||
        e.message.includes('sem Trailer') ||
        e.message.includes('Tamanho do registro')
      )
      expect(criticalErrors).toHaveLength(0)
    })
  })

  describe('Casos de borda e regressões', () => {
    describe('a) Segmento P/Q fora de qualquer lote (regressão bug)', () => {
      test('deve rejeitar Segmento P/Q antes do primeiro Header de Lote', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [
          headerArquivo,
          segP, // Fora de lote
          segQ, // Fora de lote
          headerLote,
          segP, // Dentro do lote
          segQ, // Dentro do lote
          trailerLote,
          trailerArquivo,
        ]

        const result = validateCnab240Structure(lines, bradesco)

        // Deve ter erro na linha 2 (segP fora de lote)
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 2,
            field: 'Segmento P',
            message: expect.stringContaining('fora de lote'),
          })
        )

        // Apenas o par dentro do lote deve contar como boleto válido
        expect(result.billCount).toBe(1)
      })
    })

    describe('2. Header de Arquivo fora de posição dessincroniza estado', () => {
      test('deve resetar loteAberto/boletoEmAberto quando Header de Arquivo aparece no meio', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [
          headerArquivo,
          headerLote,
          segP,
          headerArquivo, // Duplicado no meio do boleto
          segQ,
          trailerLote,
          trailerArquivo,
        ]

        const result = validateCnab240Structure(lines, bradesco)

        // Deve ter os 4 erros esperados
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 4,
            field: 'Header de Arquivo',
            message: expect.stringContaining('duplicado'),
          })
        )
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 4,
            field: 'Header de Arquivo',
            message: expect.stringContaining('primeira linha'),
          })
        )
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            field: 'Segmento Q',
            message: expect.stringContaining('sem Segmento P correspondente'),
          })
        )
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 6,
            field: 'Trailer de Lote',
            message: expect.stringContaining('sem Header de Lote correspondente'),
          })
        )

        expect(result.batchCount).toBe(1)
        expect(result.billCount).toBe(0)
      })
    })

    describe('3a. Segmento Q solto após Header de Arquivo', () => {
      test('deve rejeitar Segmento Q sem P e sem lote aberto', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, segQ, headerLote, segP, segQ, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 2,
            field: 'Segmento Q',
            message: expect.stringContaining('sem Segmento P correspondente'),
          })
        )
        expect(result.billCount).toBe(1)
      })
    })

    describe('3b. Segmento Q duplicado', () => {
      test('deve rejeitar segundo Q consecutivo', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, segQ, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            field: 'Segmento Q',
            message: expect.stringContaining('sem Segmento P correspondente'),
          })
        )
        expect(result.billCount).toBe(1)
      })
    })

    describe('3c. Segmento opcional após Header de Arquivo sem lote', () => {
      test('deve rejeitar Segmento R direto após Header de Arquivo', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const segR = '0'.repeat(7) + '3' + '0'.repeat(5) + 'R' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, segR, headerLote, segP, segQ, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 2,
            field: 'Segmento R',
            message: expect.stringContaining('sem par P+Q completo antes'),
          })
        )
      })
    })

    describe('3d. Letra de segmento desconhecida', () => {
      test('deve rejeitar segmento com letra desconhecida (tipo 3, segmento X)', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segX = '0'.repeat(7) + '3' + '0'.repeat(5) + 'X' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segX, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        // Tipo desconhecido
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 3,
            field: 'Tipo de registro',
            message: expect.stringContaining('não reconhecido'),
          })
        )

        // Lote sem título
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'Trailer de Lote',
            message: expect.stringContaining('sem nenhum título'),
          })
        )
      })
    })

    describe('3e. Trailer de Lote solto', () => {
      test('deve rejeitar segundo Trailer de Lote sem novo Header de Lote', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [
          headerArquivo,
          headerLote,
          segP,
          segQ,
          trailerLote,
          trailerLote, // Segundo trailer solto
          trailerArquivo,
        ]

        const result = validateCnab240Structure(lines, bradesco)

        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 6,
            field: 'Trailer de Lote',
            message: expect.stringContaining('sem Header de Lote correspondente'),
          })
        )
      })
    })

    describe('3f. Header de Lote após arquivo fechado', () => {
      test('deve rejeitar Header de Lote após Trailer de Arquivo', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, trailerArquivo, headerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 3,
            field: 'Header de Lote',
            message: expect.stringContaining('após Trailer de Arquivo'),
          })
        )
      })
    })

    describe('3g. Header de Arquivo após arquivo fechado (sem lote aberto)', () => {
      test('deve rejeitar Header de Arquivo após Trailer de Arquivo', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, trailerArquivo, headerArquivo, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        expect(result.errors.length).toBe(5)
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 3,
            field: 'Header de Arquivo',
            message: expect.stringContaining('após Trailer de Arquivo'),
          })
        )
      })
    })

    describe('b) Segmento opcional entre P e Q', () => {
      test('deve rejeitar Segmento S entre P e Q do mesmo título', () => {
        // MODO ESTRITO (mudança intencional de semântica):
        // Um S entre P e Q interrompe o pareamento. O Q seguinte NÃO conta como par válido.
        // Antes (modo leniente): billCount === 1 (S era ignorado, P?Q pareava).
        // Agora (modo estrito): billCount === 0 (S interrompe, Q fica órfão com mensagem enriquecida).
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segS = '0'.repeat(7) + '3' + '0'.repeat(5) + 'S' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segS, segQ, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        // Segmento S entre P e Q deve gerar erro (fora de ordem)
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 4,
            message: expect.stringContaining('sem par P+Q completo antes'),
          })
        )

        // Segmento Q deve gerar erro enriquecido indicando que o pareamento foi interrompido
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            field: 'Segmento Q',
            message: expect.stringContaining('pareamento interrompido'),
          })
        )
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            message: expect.stringContaining('linha 4'),
          })
        )
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            message: expect.stringContaining('segmento opcional S fora de ordem'),
          })
        )

        // Modo estrito: billCount NÃO incrementa quando há interrupção
        expect(result.billCount).toBe(0)
      })
    })

    describe('c) Modo estrito - 5 pontos de interrupção de pareamento', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!

      test('Ponto 1: linha com tamanho incorreto entre P e Q interrompe pareamento', () => {
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const linhaInvalida = '0'.repeat(100) // Tamanho incorreto
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, linhaInvalida, segQ, trailerLote, trailerArquivo]
        const result = validateCnab240Structure(lines, bradesco)

        // Q deve reportar interrupção
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            field: 'Segmento Q',
            message: expect.stringContaining('pareamento interrompido na linha 4'),
          })
        )
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            message: expect.stringContaining('tamanho de linha incorreto'),
          })
        )

        // billCount não incrementa
        expect(result.billCount).toBe(0)
      })

      test('Ponto 2: tipo de registro desconhecido entre P e Q interrompe pareamento', () => {
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const tipoDesconhecido = '0'.repeat(7) + 'X' + '0'.repeat(232) // Tipo 'X' desconhecido
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, tipoDesconhecido, segQ, trailerLote, trailerArquivo]
        const result = validateCnab240Structure(lines, bradesco)

        // Q deve reportar interrupção
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            field: 'Segmento Q',
            message: expect.stringContaining('pareamento interrompido na linha 4'),
          })
        )
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            message: expect.stringContaining('tipo de registro desconhecido'),
          })
        )

        expect(result.billCount).toBe(0)
      })

      test('Ponto 5: segmento opcional fora de ordem entre P e Q interrompe pareamento', () => {
        // Este é o teste que já foi reescrito acima - referenciado aqui para completude
        // P?S (fora de ordem)?Q: billCount === 0
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segS = '0'.repeat(7) + '3' + '0'.repeat(5) + 'S' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segS, segQ, trailerLote, trailerArquivo]
        const result = validateCnab240Structure(lines, bradesco)

        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            message: expect.stringContaining('pareamento interrompido na linha 4'),
          })
        )
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            message: expect.stringContaining('segmento opcional S fora de ordem'),
          })
        )

        expect(result.billCount).toBe(0)
      })
    })

    describe('d) Regressões do modo estrito', () => {
      const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!

      test('Caminho feliz: P?Q?R?S deve parear normalmente', () => {
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const segR = '0'.repeat(7) + '3' + '0'.repeat(5) + 'R' + '0'.repeat(226)
        const segS = '0'.repeat(7) + '3' + '0'.repeat(5) + 'S' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, segR, segS, trailerLote, trailerArquivo]
        const result = validateCnab240Structure(lines, bradesco)

        // Não deve ter erro de pareamento
        const pairingErrors = result.errors.filter(e => e.message.includes('pareamento'))
        expect(pairingErrors).toHaveLength(0)

        // billCount deve ser 1
        expect(result.billCount).toBe(1)
      })

      test('Lote com par válido antes de interrupção posterior: P1?Q1?P2?R?Q2', () => {
        // O primeiro par (P1?Q1) conta. O segundo par é interrompido por R fora de ordem.
        // Importante: não deve gerar falso positivo "Lote sem nenhum título"
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP1 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ1 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const segP2 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segR = '0'.repeat(7) + '3' + '0'.repeat(5) + 'R' + '0'.repeat(226) // Fora de ordem (sem Q2 antes)
        const segQ2 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP1, segQ1, segP2, segR, segQ2, trailerLote, trailerArquivo]
        const result = validateCnab240Structure(lines, bradesco)

        // Primeiro par conta
        expect(result.billCount).toBe(1)

        // Q2 deve reportar interrupção
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 7,
            message: expect.stringContaining('pareamento interrompido'),
          })
        )

        // NÃO deve ter erro "Lote sem nenhum título" (falso positivo que motivou estado separado)
        const loteVazioErrors = result.errors.filter(e => e.message.includes('Lote sem nenhum título'))
        expect(loteVazioErrors).toHaveLength(0)
      })

      test('Novo P após interrupção pareja normalmente: P1?X?Q1[erro]?P2?Q2', () => {
        // P1 é interrompido por X. P2 inicia novo pareamento limpo.
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP1 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const linhaInvalida = '0'.repeat(100) // X: tamanho incorreto
        const segQ1 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const segP2 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ2 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP1, linhaInvalida, segQ1, segP2, segQ2, trailerLote, trailerArquivo]
        const result = validateCnab240Structure(lines, bradesco)

        // Q1 deve ter erro de interrupção
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            message: expect.stringContaining('pareamento interrompido'),
          })
        )

        // P2?Q2 deve parear normalmente (sem contaminação de P1)
        const q2Errors = result.errors.filter(e => e.line === 7 && e.field === 'Segmento Q')
        expect(q2Errors).toHaveLength(0)

        // billCount deve ser 1 (apenas P2?Q2)
        expect(result.billCount).toBe(1)
      })
    })

    describe('e) Lote aberto nunca fechado', () => {
      test('deve rejeitar Trailer de Arquivo com lote ainda aberto', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        // Trailer de Arquivo com lote aberto deve gerar erro
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'Trailer de Arquivo',
            message: expect.stringContaining('lote ainda aberto'),
          })
        )
      })
    })

    describe('d) Arquivo sem Header de Arquivo', () => {
      test('deve detectar ausência de Header de Arquivo', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerLote, segP, segQ, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        // Deve detectar falta de Header de Arquivo
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'Estrutura',
            message: expect.stringContaining('sem Header de Arquivo'),
          })
        )
      })
    })

    describe('e) Trailer de Arquivo duplicado', () => {
      test('deve rejeitar Trailer de Arquivo duplicado', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [
          headerArquivo,
          headerLote,
          segP,
          segQ,
          trailerLote,
          trailerArquivo,
          trailerArquivo, // Duplicado
        ]

        const result = validateCnab240Structure(lines, bradesco)

        // Trailer duplicado deve gerar erro
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'Trailer de Arquivo',
            message: expect.stringContaining('duplicado'),
          })
        )
      })
    })

    describe('f) Segmento Y com subcódigo válido', () => {
      test('deve reconhecer Segmento Y01 corretamente', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        // Segmento Y01: tipo='3' pos 8, segmento='Y' pos 14, subcódigo='01' pos 18-19
        const segY01 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Y' + '000' + '01' + '0'.repeat(221)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, segY01, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        // Não deve ter erros estruturais (filtrar erros de schema não definido)
        const structuralErrors = result.errors.filter(
          e => !e.message.includes('não está definido')
        )
        expect(structuralErrors).toHaveLength(0)
      })
    })

    describe('g) Segmento Y com subcódigo desconhecido', () => {
      test('deve rejeitar Segmento Y com subcódigo inválido', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        // Segmento Y com subcódigo inválido '99'
        const segYInvalid = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Y' + '000' + '99' + '0'.repeat(221)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, segYInvalid, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        // Subcódigo desconhecido deve gerar erro (agora Y99 não está no schema)
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            field: 'Segmento Y99',
            message: expect.stringContaining('não está definido no schema do banco'),
          })
        )
      })
    })

    describe('h) Registro válido FEBRABAN mas não definido no schema do banco', () => {
      test('deve rejeitar Segmento R quando banco não o define', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        // Criar schema sem segmentoR removendo-o de optionalRecords
        const bradescoSemSegmentoR = {
          ...bradesco,
          optionalRecords: bradesco.optionalRecords?.filter(r => r.identifier !== 'R'),
        }

        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const segR = '0'.repeat(7) + '3' + '0'.repeat(5) + 'R' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, segR, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradescoSemSegmentoR)

        // Segmento R não definido no schema deve gerar erro
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            field: 'Segmento R',
            message: expect.stringContaining('não está definido no schema do banco'),
          })
        )
      })

      test('deve rejeitar headerLote quando banco não o define', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const bradescoSemHeaderLote = {
          ...bradesco,
          headerLote: undefined,
        }

        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradescoSemHeaderLote)

        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 2,
            field: 'Tipo de registro',
            message: expect.stringContaining('não está definido no schema do banco'),
          })
        )
      })

      test('deve rejeitar segmentoY01 quando banco não o define', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const bradescoSemY01 = {
          ...bradesco,
          optionalRecords: bradesco.optionalRecords?.filter(r => r.identifier !== 'Y01'),
        }

        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const segY01 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Y' + '000' + '01' + '0'.repeat(221)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, segY01, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradescoSemY01)

        expect(result.errors).toContainEqual(
          expect.objectContaining({
            line: 5,
            field: 'Segmento Y01',
            message: expect.stringContaining('não está definido no schema do banco'),
          })
        )
      })
    })
  })

  describe('Cobertura de variantes de Segmento Y', () => {
    describe('5j. Segmento Y03 e Y53 (Santander)', () => {
      test('deve reconhecer Segmento Y03 do Santander', () => {
        const santander = getBankSchema('033', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const segY03 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Y' + '000' + '03' + '0'.repeat(221)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, segY03, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, santander)

        const structuralErrors = result.errors.filter(
          e => !e.message.includes('não está definido')
        )
        expect(structuralErrors).toHaveLength(0)
      })

      test('deve reconhecer Segmento Y53 do Santander', () => {
        const santander = getBankSchema('033', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const segY53 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Y' + '000' + '53' + '0'.repeat(221)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, segY53, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, santander)

        const structuralErrors = result.errors.filter(
          e => !e.message.includes('não está definido')
        )
        expect(structuralErrors).toHaveLength(0)
      })
    })

    describe('5k. Segmento Y04 e Y50 (Bradesco)', () => {
      test('deve reconhecer Segmento Y04 do Bradesco', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const segY04 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Y' + '000' + '04' + '0'.repeat(221)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, segY04, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        const structuralErrors = result.errors.filter(
          e => !e.message.includes('não está definido')
        )
        expect(structuralErrors).toHaveLength(0)
      })

      test('deve reconhecer Segmento Y50 do Bradesco', () => {
        const bradesco = getBankSchema('237', CNABFormatCode.CNAB240)!
        const headerArquivo = '0'.repeat(7) + '0' + '0'.repeat(232)
        const headerLote = '0'.repeat(7) + '1' + '0'.repeat(232)
        const segP = '0'.repeat(7) + '3' + '0'.repeat(5) + 'P' + '0'.repeat(226)
        const segQ = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Q' + '0'.repeat(226)
        const segY50 = '0'.repeat(7) + '3' + '0'.repeat(5) + 'Y' + '000' + '50' + '0'.repeat(221)
        const trailerLote = '0'.repeat(7) + '5' + '0'.repeat(232)
        const trailerArquivo = '0'.repeat(7) + '9' + '0'.repeat(232)

        const lines = [headerArquivo, headerLote, segP, segQ, segY50, trailerLote, trailerArquivo]

        const result = validateCnab240Structure(lines, bradesco)

        const structuralErrors = result.errors.filter(
          e => !e.message.includes('não está definido')
        )
        expect(structuralErrors).toHaveLength(0)
      })
    })
  })
})

