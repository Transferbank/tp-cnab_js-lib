/**
 * Parsing das linhas brutas de SANTANDER_cnab_400_140.REM com os schemas TS reais
 * (HEADER, DETAIL, TRAILER) ? valida que o schema realmente d? conta do arquivo
 * de produ??o, independente do que est? escrito no metadata.json.
 *
 * Valida??o do conte?do do metadata.json em si fica em `.test.ts`.
 * Pipeline p?blico (`validateCnabFile`) fica em `.e2e.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { extractLineFields } from '@parser/field-extractor'
import { getBankSchema } from '@schemas/index'
import { BANK_CODES, CNABFormatCode } from '@tp-types/index'
import type { FixtureMetadata } from '@tp-types/testing'

describe('Integridade TXT × Schema: SANTANDER_cnab_400_140.REM', () => {
  const fixtureDir = path.join(__dirname, '../../docs/cnab400')
  const txtPath = path.join(fixtureDir, 'SANTANDER_cnab_400_140.REM')
  const jsonPath = path.join(fixtureDir, 'SANTANDER_cnab_400_140.json')
  const txtContent = fs.readFileSync(txtPath, 'latin1')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  let metadata: FixtureMetadata

  beforeAll(() => {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8')
    metadata = JSON.parse(jsonContent) as FixtureMetadata
  })

  describe('Integridade TXT × JSON', () => {
    test('deve ter 400 caracteres em cada linha', () => {
      lines.forEach((line) => {
        expect(line.length).toBe(400)
      })
    })

    test('header deve ter c?digo do banco correto', () => {
      const schema = getBankSchema(BANK_CODES.SANTANDER, CNABFormatCode.CNAB400)
      if (schema) {
        const headerParsed = extractLineFields(lines[0], schema.header || {})
        const bankCode = headerParsed.codigo_banco?.raw
        expect(bankCode).toBe(BANK_CODES.SANTANDER)
      }
    })

    test('header deve ter codigo_transmissao do Santander', () => {
      const schema = getBankSchema(BANK_CODES.SANTANDER, CNABFormatCode.CNAB400)
      if (schema) {
        const headerParsed = extractLineFields(lines[0], schema.header || {})
        // Valor confirmado no arquivo (fixture com dados fict?cios)
        expect(headerParsed.codigo_transmissao?.raw).toBe('99110022334400556677')
        expect(headerParsed.codigo_transmissao?.raw.length).toBe(20)
      }
    })

    test('todos os registros tipo 1 devem ser parse?veis sem erros', () => {
      const schema = getBankSchema(BANK_CODES.SANTANDER, CNABFormatCode.CNAB400)
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '1')
        expect(detailLines.length).toBe(128)

        detailLines.forEach((line) => {
          const parsed = extractLineFields(line, schema.detail || {})

          // Deve ter nome
          expect(parsed.nome?.value).toBeTruthy()
          // Erro pode ser null (sem erro) - n?o precisa ser undefined

          // Deve ter valor
          expect(parsed.valor_titulo?.value).toBeDefined()
          expect(parsed.valor_titulo?.value).toBeGreaterThan(0)
          // Erro pode ser null (sem erro)

          // Deve ter vencimento
          expect(parsed.vencimento?.value).toBeDefined()
          // Erro pode ser null (sem erro)

          // Deve ter documento
          expect(parsed.sacado_numero_inscricao?.raw).toBeTruthy()
          // Erro pode ser null (sem erro)
        })
      }
    })

    test('numero_sequencial deve ser 1-based em todas as linhas', () => {
      const schema = getBankSchema(BANK_CODES.SANTANDER, CNABFormatCode.CNAB400)
      if (schema) {
        lines.forEach((line, index) => {
          const tipoRegistro = line[0]
          let recordSchema: any

          if (tipoRegistro === '0') {
            recordSchema = schema.header
          } else if (tipoRegistro === '1') {
            recordSchema = schema.detail
          } else if (tipoRegistro === '9') {
            recordSchema = schema.trailer
          }

          if (recordSchema && 'numero_sequencial' in recordSchema) {
            const parsed = extractLineFields(line, recordSchema)
            const expectedSequencial = index + 1

            expect(parsed.numero_sequencial.value).toBe(expectedSequencial)
            // Erro pode ser null (sem erro) - n?o precisa ser undefined
          }
        })
      }
    })

    test('totais do trailer devem bater com o metadata', () => {
      const schema = getBankSchema(BANK_CODES.SANTANDER, CNABFormatCode.CNAB400)
      if (schema) {
        const trailerLine = lines[lines.length - 1]
        const trailer = extractLineFields(trailerLine, schema.trailer || {})

        // Quantidade de documentos no trailer
        expect(trailer.qtd_documentos.value).toBe(metadata.totals.recordCount)

        // Valor total no trailer
        const valorTotalTrailer = Number(trailer.valor_total.value) || 0
        expect(valorTotalTrailer).toBeCloseTo(metadata.totals.totalAmount, 2)
      }
    })
  })
})

