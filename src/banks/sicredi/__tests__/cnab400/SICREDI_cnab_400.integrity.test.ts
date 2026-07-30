/**
 * Parsing das linhas brutas de SICREDI_cnab_400.CRM com os schemas TS reais
 * (HEADER, DETAIL, TRAILER) – valida que o schema realmente dá conta
 * do arquivo de produção, independente do que está escrito no metadata.json.
 *
 * Validação do conteúdo do metadata.json em si fica em `.test.ts`.
 * Pipeline público (`openCnab`) fica em `.e2e.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { extractLineFields } from '@parser/field-extractor'
import { getBankSchema } from '@schemas/index'
import type { FixtureMetadata } from '@tp-types/testing'
import { BANK_CODES, CNABFormatCode } from '@tp-types/index'

describe('Integridade TXT ? Schema: SICREDI_cnab_400.CRM', () => {
  const fixtureDir = path.join(__dirname, '../../__fixtures__/cnab400')
  const txtPath = path.join(fixtureDir, 'SICREDI_cnab_400.CRM')
  const jsonPath = path.join(fixtureDir, 'SICREDI_cnab_400.json')
  const txtContent = fs.readFileSync(txtPath, 'latin1')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  let metadata: FixtureMetadata

  beforeAll(() => {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8')
    metadata = JSON.parse(jsonContent) as FixtureMetadata
  })

  describe('Registros tipo 1 (Detail)', () => {
    test('deve ter exatamente 43 registros tipo 1 no arquivo', () => {
      const tipo1Lines = lines.filter((line) => line[0] === '1')
      expect(tipo1Lines.length).toBe(43)
      expect(metadata.structure.detailLines).toBe(43)
    })

    test('todos os registros tipo 1 devem ter 400 caracteres', () => {
      const tipo1Lines = lines.filter((line) => line[0] === '1')
      tipo1Lines.forEach((line) => {
        expect(line.length).toBe(400)
      })
    })

    test('não deve haver registros opcionais (tipo 2/5/6/7/8) neste arquivo', () => {
      const tiposOpcionais = lines.filter((line) => ['2', '5', '6', '7', '8'].includes(line[0]))
      expect(tiposOpcionais.length).toBe(0)
    })
  })

  describe('Integridade TXT ? JSON', () => {
    test('deve ter 400 caracteres em cada linha', () => {
      lines.forEach((line) => {
        expect(line.length).toBe(400)
      })
    })

    test('header deve ter código do banco correto (748)', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
      if (schema) {
        const headerParsed = extractLineFields(lines[0], schema.header || {})
        const bankCode = headerParsed.codigo_banco?.raw
        expect(bankCode).toBe(BANK_CODES.SICREDI)
      }
    })

    test('header deve ter data de geração em formato AAAAMMDD (8 dígitos)', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
      if (schema) {
        const headerParsed = extractLineFields(lines[0], schema.header || {})
        const dataGeracao = headerParsed.data_geracao?.raw
        expect(dataGeracao).toHaveLength(8)
        expect(dataGeracao).toBe('20260627')
      }
    })

    test('header deve usar código do cliente (5 dígitos)', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
      if (schema) {
        const headerParsed = extractLineFields(lines[0], schema.header || {})
        const codigoCliente = headerParsed.codigo_cliente?.raw
        expect(codigoCliente).toHaveLength(5)
        expect(codigoCliente).toBe('81234')
      }
    })

    test('todos os registros tipo 1 devem ser parseáveis sem erros', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '1')
        expect(detailLines.length).toBe(43)

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

          // Deve ter instrução válida
          expect(parsed.instrucao?.raw).toBeTruthy()
          expect(parsed.instrucao?.raw).toMatch(/^\d{2}$/)

          // Deve ter espécie
          expect(parsed.especie?.raw).toBeTruthy()
          expect(parsed.especie?.raw).toMatch(/^[A-Z]$/)

          // Deve ter postagem do título (S ou N)
          expect(parsed.postagem_titulo?.raw).toBeTruthy()
          expect(['S', 'N']).toContain(parsed.postagem_titulo?.raw)

          // Deve ter impressão do boleto (A ou B)
          expect(parsed.impressao_boleto?.raw).toBeTruthy()
          expect(['A', 'B']).toContain(parsed.impressao_boleto?.raw)
        })
      }
    })

    test('numero_sequencial deve ser 1-based e sequencial', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
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
          }
        })
      }
    })

    test('todos os valores de vencimento devem usar formato DDMMAA (6 dígitos)', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '1')

        detailLines.forEach((line) => {
          const parsed = extractLineFields(line, schema.detail || {})
          const vencimentoRaw = parsed.vencimento?.raw

          expect(vencimentoRaw).toHaveLength(6)
          expect(vencimentoRaw).toMatch(/^\d{6}$/)
        })
      }
    })

    test('trailer deve repetir código do banco e código do cliente', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
      if (schema) {
        const trailerParsed = extractLineFields(lines[lines.length - 1], schema.trailer || {})

        expect(trailerParsed.codigo_banco?.raw).toBe(BANK_CODES.SICREDI)
        expect(trailerParsed.codigo_cliente?.raw).toBe('81234')
      }
    })

    test('todas as instruções devem ser "01" neste arquivo', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '1')

        detailLines.forEach((line) => {
          const parsed = extractLineFields(line, schema.detail || {})
          expect(parsed.instrucao?.raw).toBe('01')
        })
      }
    })

    test('todas as espécies devem ser "A" neste arquivo', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '1')

        detailLines.forEach((line) => {
          const parsed = extractLineFields(line, schema.detail || {})
          expect(parsed.especie?.raw).toBe('A')
        })
      }
    })

    test('todas as postagens devem ser "N" neste arquivo', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '1')

        detailLines.forEach((line) => {
          const parsed = extractLineFields(line, schema.detail || {})
          expect(parsed.postagem_titulo?.raw).toBe('N')
        })
      }
    })

    test('todas as impressões devem ser "B" neste arquivo', () => {
      const schema = getBankSchema(BANK_CODES.SICREDI, CNABFormatCode.CNAB400)
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '1')

        detailLines.forEach((line) => {
          const parsed = extractLineFields(line, schema.detail || {})
          expect(parsed.impressao_boleto?.raw).toBe('B')
        })
      }
    })
  })
})

