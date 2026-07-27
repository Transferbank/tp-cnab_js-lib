/**
 * Parsing das linhas brutas de SANTANDER_cnab_400_140.REM com os schemas TS reais
 * (HEADER, DETAIL, TRAILER) — valida que o schema realmente dá conta do arquivo
 * de produção, independente do que está escrito no metadata.json.
 *
 * Validação do conteúdo do metadata.json em si fica em `.test.ts`.
 * Pipeline público (`validateCnabFile`) fica em `.e2e.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { extractLineFields } from '../../../../src/parser/field-extractor'
import { getBankSchema } from '../../../../src/schemas'
import { loadFixtureMetadata } from '../../../helpers/fixture-metadata'
import { validateFixtureIntegrity } from '../../../helpers/fixture-validator'
import { BANK_CODES } from '../../../../src/types'

describe('Integridade TXT ↔ Schema: SANTANDER_cnab_400_140.REM', () => {
  const fixtureDir = path.join(__dirname)
  const txtPath = path.join(fixtureDir, 'SANTANDER_cnab_400_140.REM')
  const txtContent = fs.readFileSync(txtPath, 'latin1')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  let metadata: ReturnType<typeof loadFixtureMetadata>

  beforeAll(() => {
    metadata = loadFixtureMetadata('santander', 'SANTANDER_cnab_400_140', 'cnab400')
  })

  describe('Integridade TXT ↔ JSON', () => {
    test('deve validar integridade entre arquivo TXT e metadados JSON', () => {
      const schema = getBankSchema(BANK_CODES.SANTANDER, 'cnab400')
      expect(schema).toBeDefined()

      if (schema) {
        const errors = validateFixtureIntegrity(lines, metadata, schema)

        // Filtrar erros de zeros à esquerda nos documentos - o parser remove,
        // mas o JSON pode ter (comportamento esperado e documentado)
        const realErrors = errors.filter(
          (error) => !(error.type === 'field-mismatch' && error.field === 'document'),
        )

        if (realErrors.length > 0) {
          console.log('Erros de integridade encontrados:')
          realErrors.forEach((error) => {
            const record = error.recordIndex ? ` (Registro ${error.recordIndex})` : ''
            const field = error.field ? ` - ${error.field}` : ''
            console.log(`  [${error.type}]${record}${field}: ${error.message}`)
          })
        }

        expect(realErrors).toHaveLength(0)
      }
    })

    test('deve ter 400 caracteres em cada linha', () => {
      lines.forEach((line) => {
        expect(line.length).toBe(400)
      })
    })

    test('header deve ter código do banco correto', () => {
      const schema = getBankSchema(BANK_CODES.SANTANDER, 'cnab400')
      if (schema) {
        const headerParsed = extractLineFields(lines[0], schema.header || {})
        const bankCode = headerParsed.codigo_banco?.raw
        expect(bankCode).toBe(BANK_CODES.SANTANDER)
      }
    })

    test('header deve ter codigo_transmissao do Santander', () => {
      const schema = getBankSchema(BANK_CODES.SANTANDER, 'cnab400')
      if (schema) {
        const headerParsed = extractLineFields(lines[0], schema.header || {})
        // Valor confirmado no arquivo (fixture com dados fictícios)
        expect(headerParsed.codigo_transmissao?.raw).toBe('99110022334400556677')
        expect(headerParsed.codigo_transmissao?.raw.length).toBe(20)
      }
    })

    test('todos os registros tipo 1 devem ser parseáveis sem erros', () => {
      const schema = getBankSchema(BANK_CODES.SANTANDER, 'cnab400')
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '1')
        expect(detailLines.length).toBe(128)

        detailLines.forEach((line) => {
          const parsed = extractLineFields(line, schema.detail || {})

          // Deve ter nome
          expect(parsed.nome?.value).toBeTruthy()
          // Erro pode ser null (sem erro) - não precisa ser undefined

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
      const schema = getBankSchema(BANK_CODES.SANTANDER, 'cnab400')
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
            // Erro pode ser null (sem erro) - não precisa ser undefined
          }
        })
      }
    })

    test('totais do trailer devem bater com o metadata', () => {
      const schema = getBankSchema(BANK_CODES.SANTANDER, 'cnab400')
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
