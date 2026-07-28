/**
 * Parsing das linhas brutas de ITAU_cnab_400.REM com os schemas TS reais
 * (HEADER, DETAIL, TRAILER, TYPE2_FINE) — valida que o schema realmente dá conta
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
import { CNABFormatCode } from '@tp-types/index'

describe('Integridade TXT ? Schema: ITAU_cnab_400.REM', () => {
  const fixtureDir = path.join(__dirname)
  const txtPath = path.join(fixtureDir, 'ITAU_cnab_400.REM')
  const txtContent = fs.readFileSync(txtPath, 'utf-8')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  let metadata: ReturnType<typeof loadFixtureMetadata>

  beforeAll(() => {
    metadata = loadFixtureMetadata('itau', 'ITAU_cnab_400', CNABFormatCode.CNAB400)
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

  describe('Integridade TXT ? JSON', () => {
    test('deve validar integridade entre arquivo TXT e metadados JSON', () => {
      // Linhas tipo 2 (multa) não entram em `result.records` — o parser de detalhe do
      // CNAB 400 só processa linhas tipo 1, então não afetam esta comparação registro a registro.
      const schema = getBankSchema(BANK_CODES.ITAU, CNABFormatCode.CNAB400)
      expect(schema).toBeDefined()

      if (schema) {
        const errors = validateFixtureIntegrity(lines, metadata, schema)
        
        if (errors.length > 0) {
          console.log('Erros de integridade encontrados:')
          errors.forEach((error) => {
            const record = error.recordIndex ? ` (Registro ${error.recordIndex})` : ''
            const field = error.field ? ` - ${error.field}` : ''
            console.log(`  [${error.type}]${record}${field}: ${error.message}`)
          })
        }

        expect(errors).toHaveLength(0)
      }
    })

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

    test('deve haver alternância tipo 1 ? tipo 2 ? tipo 1 ? tipo 2...', () => {
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
  })
})
