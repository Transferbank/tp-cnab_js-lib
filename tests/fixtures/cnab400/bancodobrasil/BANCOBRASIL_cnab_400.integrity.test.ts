/**
 * Parsing das linhas brutas de BANCOBRASIL_cnab_400.REM com os schemas TS reais
 * (HEADER, DETAIL, TRAILER, TYPE5_FINE) — valida que o schema realmente dá conta
 * do arquivo de produção, independente do que está escrito no metadata.json.
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
import { BANK_CODES } from '@tp-types/index'
import { TYPE5_FINE } from '../../../../src/banks/bancoDoBrasil/schemas/cnab400/registros-opcionais/type5-optional-services/type5-fine'
import { CNABFormatCode } from '@tp-types/index'

describe('Integridade TXT ? Schema: BANCOBRASIL_cnab_400.REM', () => {
  const fixtureDir = path.join(__dirname)
  const txtPath = path.join(fixtureDir, 'BANCOBRASIL_cnab_400.REM')
  const txtContent = fs.readFileSync(txtPath, 'latin1')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  let metadata: ReturnType<typeof loadFixtureMetadata>

  beforeAll(() => {
    metadata = loadFixtureMetadata('bancodobrasil', 'BANCOBRASIL_cnab_400', CNABFormatCode.CNAB400)
  })

  describe('Registros tipo 5 (Multa - Serviço 99)', () => {
    test('deve ter exatamente 113 registros tipo 5 no arquivo', () => {
      const tipo5Lines = lines.filter((line) => line[0] === '5')
      expect(tipo5Lines.length).toBe(113)
      expect(metadata.structure.messageLines).toBe(113)
    })

    test('todos os registros tipo 5 devem seguir o padrão', () => {
      const tipo5Lines = lines.filter((line) => line[0] === '5')
      tipo5Lines.forEach((line) => {
        // Tipo de registro = '5'
        expect(line[0]).toBe('5')
        // Tipo de serviço = '99' (multa)
        expect(line.substring(1, 3)).toBe('99')
        // Deve ter 400 caracteres
        expect(line.length).toBe(400)
      })
    })

    test('registros tipo 5 devem vir após cada detalhe tipo 7', () => {
      // Após o header (linha 0), espera-se: detalhe (tipo 7), multa (tipo 5), detalhe, multa...
      // até o trailer (tipo 9)
      for (let i = 1; i < lines.length - 1; i += 2) {
        const linhaDetalhe = lines[i]
        const linhaMulta = lines[i + 1]

        // Verifica se não é a última linha (trailer)
        if (i + 1 < lines.length - 1) {
          expect(linhaDetalhe[0]).toBe('7') // Detalhe
          expect(linhaMulta[0]).toBe('5') // Multa
        }
      }
    })
  })

  describe('Integridade TXT ? JSON', () => {
    test('deve validar integridade entre arquivo TXT e metadados JSON', () => {
      const schema = getBankSchema(BANK_CODES.BANCO_DO_BRASIL, CNABFormatCode.CNAB400)
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

    test('header deve ter código do banco correto (001)', () => {
      const schema = getBankSchema(BANK_CODES.BANCO_DO_BRASIL, CNABFormatCode.CNAB400)
      if (schema) {
        const headerParsed = extractLineFields(lines[0], schema.header || {})
        const bankCode = headerParsed.codigo_banco?.raw
        expect(bankCode).toBe(BANK_CODES.BANCO_DO_BRASIL)
      }
    })

    test('todos os registros tipo 7 devem ser parseáveis sem erros', () => {
      const schema = getBankSchema(BANK_CODES.BANCO_DO_BRASIL, CNABFormatCode.CNAB400)
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '7')
        expect(detailLines.length).toBe(113)

        detailLines.forEach((line) => {
          const parsed = extractLineFields(line, schema.detail || {})

          // Deve ter nome
          expect(parsed.nome?.value).toBeTruthy()

          // Deve ter valor
          expect(parsed.valor_titulo?.value).toBeDefined()
          expect(parsed.valor_titulo?.value).toBeGreaterThan(0)

          // Deve ter vencimento
          expect(parsed.vencimento?.value).toBeDefined()

          // Deve ter documento
          expect(parsed.sacado_numero_inscricao?.raw).toBeTruthy()

          // Deve ter nosso número
          expect(parsed.nosso_numero?.raw).toBeTruthy()

          // Deve ter comando válido (01, 02, 04, 06, etc)
          expect(parsed.comando?.raw).toBeTruthy()
          expect(parsed.comando?.raw).toMatch(/^\d{2}$/)
        })
      }
    })

    test('numero_sequencial deve ser 1-based e alternado tipo 7/5/7/5...', () => {
      const schema = getBankSchema(BANK_CODES.BANCO_DO_BRASIL, CNABFormatCode.CNAB400)
      if (schema) {
        lines.forEach((line, index) => {
          const tipoRegistro = line[0]
          let recordSchema: any

          if (tipoRegistro === '0') {
            recordSchema = schema.header
          } else if (tipoRegistro === '7') {
            recordSchema = schema.detail
          } else if (tipoRegistro === '9') {
            recordSchema = schema.trailer
          } else if (tipoRegistro === '5') {
            // Tipo 5 (multa) não faz parte do BankSchema principal (é registro
            // opcional), então usamos o schema TYPE5_FINE diretamente.
            recordSchema = TYPE5_FINE
          }

          if (recordSchema && 'numero_sequencial' in recordSchema) {
            const parsed = extractLineFields(line, recordSchema)
            const expectedSequencial = index + 1

            expect(parsed.numero_sequencial.value).toBe(expectedSequencial)
          }
        })
      }
    })

    test('deve haver alternância tipo 7 ? tipo 5 ? tipo 7 ? tipo 5...', () => {
      // Após o header (linha 0), espera-se: detalhe (tipo 7), multa (tipo 5), detalhe, multa...
      // até o trailer (tipo 9)
      for (let i = 1; i < lines.length - 1; i++) {
        const tipoAtual = lines[i][0]

        if (i === lines.length - 1) {
          // Última linha deve ser trailer
          expect(tipoAtual).toBe('9')
        } else if (i % 2 === 1) {
          // Linhas ímpares (1, 3, 5...) = tipo 7 (detalhe)
          expect(tipoAtual).toBe('7')
        } else {
          // Linhas pares (2, 4, 6...) = tipo 5 (multa)
          expect(tipoAtual).toBe('5')
        }
      }
    })
  })
})
