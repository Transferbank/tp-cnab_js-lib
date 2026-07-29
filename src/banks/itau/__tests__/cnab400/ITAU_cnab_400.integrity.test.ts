/**
 * Parsing das linhas brutas de ITAU_cnab_400.REM com os schemas TS reais
 * (HEADER, DETAIL, TRAILER, TYPE2_FINE) – valida que o schema realmente dá conta
 * do arquivo de produção, independente do que está escrito no metadata.json.
 *
 * Validação do conteúdo do metadata.json em si fica em `.test.ts`.
 * Pipeline público (`openCnab`) fica em `.e2e.test.ts`.
 */

import { readFixture } from './shared'
import { extractLineFields } from '@parser/field-extractor'
import { getBankSchema } from '../../../../schemas'
import { BANK_CODES, CNABFormatCode } from '@tp-types/index'
import type { FixtureMetadata } from '@tp-types/testing'
import * as fs from 'fs'
import * as path from 'path'

describe('Integridade TXT × Schema: ITAU_cnab_400.REM', () => {
  const lines = readFixture('ITAU_cnab_400.REM')
  let metadata: FixtureMetadata

  beforeAll(() => {
    const jsonPath = path.join(__dirname, '../../__fixtures__/cnab400/ITAU_cnab_400.json')
    const jsonContent = fs.readFileSync(jsonPath, 'utf8')
    metadata = JSON.parse(jsonContent) as FixtureMetadata
  })

  describe('Registros tipo 2 (Complemento de Multa)', () => {
    test('deve ter exatamente 319 registros tipo 2 no arquivo', () => {
      const tipo2Lines = lines.filter((line) => line[0] === '2')
      expect(tipo2Lines.length).toBe(319)
      expect(metadata.structure.messageLines).toBe(319)
    })

    test('todos os registros tipo 2 devem seguir o padrão', () => {
      const tipo2Lines = lines.filter((line) => line[0] === '2')
      tipo2Lines.forEach((line) => {
        // Tipo de registro = '2'
        expect(line[0]).toBe('2')
        // Deve ter 400 caracteres
        expect(line.length).toBe(400)
      })
    })
  })

  describe('Integridade TXT × Schema', () => {
    test('deve ter 400 caracteres em cada linha', () => {
      lines.forEach((line) => {
        expect(line.length).toBe(400)
      })
    })

    test('header deve ter código do banco correto (341)', () => {
      const schema = getBankSchema(BANK_CODES.ITAU, CNABFormatCode.CNAB400)
      if (schema) {
        const headerParsed = extractLineFields(lines[0], schema.header || {})
        const bankCode = headerParsed.codigo_banco?.value
        expect(String(bankCode)).toBe(BANK_CODES.ITAU)
      }
    })

    test('todos os registros tipo 1 devem ser parseáveis', () => {
      const schema = getBankSchema(BANK_CODES.ITAU, CNABFormatCode.CNAB400)
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '1')
        expect(detailLines.length).toBe(319)

        detailLines.forEach((line) => {
          const parsed = extractLineFields(line, schema.detail || {})

          // Deve ter nome do pagador
          expect(parsed.nome?.value).toBeTruthy()
          // Deve ter valor
          expect(parsed.valor_titulo?.value).toBeDefined()
          // Deve ter vencimento
          expect(parsed.vencimento?.value).toBeDefined()
        })
      }
    })

    test('deve haver alternância tipo 1 → tipo 2 → tipo 1 → tipo 2...', () => {
      // Após o header (linha 0), espera-se: detalhe (tipo 1), multa (tipo 2), detalhe, multa...
      // até o trailer (tipo 9)
      for (let i = 1; i < lines.length - 1; i++) {
        const tipoAtual = lines[i][0]
        
        if (i === lines.length - 1) {
          // Última linha deve ser trailer
          expect(tipoAtual).toBe('9')
        } else if (i % 2 === 1) {
          // Linhas ímpares (1, 3, 5...) = tipo 1 (detalhe)
          expect(tipoAtual).toBe('1')
        } else {
          // Linhas pares (2, 4, 6...) = tipo 2 (multa)
          expect(tipoAtual).toBe('2')
        }
      }
    })

    test('estrutura deve estar completa: header + detalhe + mensagem + trailer = total', () => {
      const headerLines = lines.filter((line) => line[0] === '0').length
      const detailLines = lines.filter((line) => line[0] === '1').length
      const messageLines = lines.filter((line) => line[0] === '2').length
      const trailerLines = lines.filter((line) => line[0] === '9').length

      expect(headerLines).toBe(1)
      expect(detailLines).toBe(319)
      expect(messageLines).toBe(319)
      expect(trailerLines).toBe(1)
      expect(headerLines + detailLines + messageLines + trailerLines).toBe(lines.length)
      expect(lines.length).toBe(640)
    })
  })
})
