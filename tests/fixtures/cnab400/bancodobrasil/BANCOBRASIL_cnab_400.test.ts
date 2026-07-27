/**
 * Validação do conteúdo de BANCOBRASIL_cnab_400.json: forma e valores do metadata.json
 * em si (autoconsistência + valores "golden" conferidos manualmente contra o .REM real).
 *
 * Parsing das linhas brutas com os schemas TS fica em `.integrity.test.ts`.
 * Pipeline público (`validateCnabFile`) fica em `.e2e.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { loadFixtureMetadata } from '../../../helpers/fixture-metadata'
import { BANK_CODES } from '../../../../src/types'

describe('Metadados: BANCOBRASIL_cnab_400.json', () => {
  const fixtureDir = path.join(__dirname)
  const txtPath = path.join(fixtureDir, 'BANCOBRASIL_cnab_400.REM')
  const txtContent = fs.readFileSync(txtPath, 'latin1')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  let metadata: ReturnType<typeof loadFixtureMetadata>

  beforeAll(() => {
    metadata = loadFixtureMetadata('bancodobrasil', 'BANCOBRASIL_cnab_400', 'cnab400')
  })

  describe('Campos principais', () => {
    test('deve ter descrição correta', () => {
      expect(metadata.description).toContain('Banco do Brasil')
    })

    test('deve ter código do banco Banco do Brasil (001)', () => {
      expect(metadata.bankCode).toBe(BANK_CODES.BANCO_DO_BRASIL)
    })

    test('deve ter nome do banco correto', () => {
      expect(metadata.bankName).toBe('Banco do Brasil')
    })

    test('deve ser formato CNAB400', () => {
      expect(metadata.format).toBe('CNAB400')
    })
  })

  describe('Estrutura do arquivo', () => {
    test('deve ter total de linhas consistente', () => {
      expect(metadata.structure.totalLines).toBe(lines.length)
      expect(metadata.structure.totalLines).toBe(228) // 1 header + 113 tipo 7 + 113 tipo 5/99 + 1 trailer
    })

    test('deve ter 1 linha de header', () => {
      expect(metadata.structure.headerLines).toBe(1)
    })

    test('deve ter 113 linhas de detalhe (tipo 7)', () => {
      expect(metadata.structure.detailLines).toBe(113)
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount)
    })

    test('deve ter 1 linha de trailer', () => {
      expect(metadata.structure.trailerLines).toBe(1)
    })

    test('deve ter 113 linhas de multa (tipo 5/99)', () => {
      // BB: cada título tem um registro tipo 5 (multa, serviço 99)
      expect(metadata.structure.messageLines).toBe(113)
    })

    test('estrutura deve estar completa: header + detalhe + multa + trailer = total', () => {
      const { headerLines, detailLines, messageLines = 0, trailerLines, totalLines } = metadata.structure
      expect(headerLines + detailLines + messageLines + trailerLines).toBe(totalLines)
      expect(1 + 113 + 113 + 1).toBe(228)
    })
  })

  describe('Header do arquivo', () => {
    test('deve ter dados do header', () => {
      expect(metadata.header).toBeDefined()
    })

    test('deve ter nome do cedente', () => {
      expect(metadata.header?.cedenteNome).toBeTruthy()
      expect(metadata.header?.cedenteNome?.length).toBeGreaterThan(0)
      // Valor confirmado no arquivo (fixture com dados fictícios)
      expect(metadata.header?.cedenteNome?.trim()).toBe('EMPRESA EXEMPLO IMPORT LTDA')
    })

    // Campos agencia, conta, contaDv, sequencialRemessa e convenioLider estão
    // presentes no JSON mas não são parte do tipo FixtureHeader padrão.
    // Validação específica fica em ".integrity.test.ts"

    test('deve ter data de geração formatada', () => {
      expect(metadata.header?.dataGeracao).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      // Valor confirmado: 26/05/2026
      expect(metadata.header?.dataGeracao).toBe('26/05/2026')
    })

    test('deve ter data de geração raw', () => {
      expect(metadata.header?.dataGeracaoRaw).toHaveLength(6)
      // Valor confirmado: 260526 (DDMMAA)
      expect(metadata.header?.dataGeracaoRaw).toBe('260526')
    })

    test('deve ser arquivo de remessa (código "1")', () => {
      expect(metadata.header?.tipoArquivo).toBe('1')
    })
  })

  describe('Registros/Títulos', () => {
    test('deve ter exatamente 113 títulos', () => {
      expect(metadata.records.length).toBe(113)
    })

    test('cada título deve ter índice sequencial', () => {
      metadata.records.forEach((record, idx) => {
        expect(record.index).toBe(idx + 1)
      })
    })

    test('todos os títulos devem ter nome preenchido', () => {
      metadata.records.forEach((record) => {
        expect(record.name).toBeTruthy()
        expect(record.name.length).toBeGreaterThan(0)
      })
    })

    test('todos os títulos devem ter documento válido', () => {
      metadata.records.forEach((record) => {
        expect(record.document).toBeTruthy()
        expect(record.document).toMatch(/^\d+$/)
      })
    })

    test('todos os títulos devem ter documento raw', () => {
      metadata.records.forEach((record) => {
        expect(record.documentRaw).toBeTruthy()
        expect(record.documentRaw).toMatch(/^\d{14}$/) // 14 dígitos com padding
      })
    })

    test('todos os títulos devem ter tipo de documento válido', () => {
      metadata.records.forEach((record) => {
        expect(['CPF', 'CNPJ']).toContain(record.documentType)
        if (record.documentType === 'CPF') {
          expect(record.documentTypeCode).toBe('01')
          expect(record.document.length).toBe(11)
        } else {
          expect(record.documentTypeCode).toBe('02')
          expect(record.document.length).toBe(14)
        }
      })
    })

    test('todos os títulos devem ter valor maior que zero', () => {
      metadata.records.forEach((record) => {
        expect(record.amount).toBeGreaterThan(0)
      })
    })

    test('todos os títulos devem ter valor raw com formato numérico', () => {
      metadata.records.forEach((record) => {
        expect(record.amountRaw).toMatch(/^\d+$/)
        expect(record.amountRaw?.length).toBe(13) // BB: 13 posições com 2 decimais
      })
    })

    test('todos os títulos devem ter vencimento no formato DD/MM/YYYY', () => {
      metadata.records.forEach((record) => {
        expect(record.dueDate).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      })
    })

    test('todos os títulos devem ter vencimento raw com 6 dígitos', () => {
      metadata.records.forEach((record) => {
        expect(record.dueDateRaw).toHaveLength(6)
        expect(record.dueDateRaw).toMatch(/^\d{6}$/)
      })
    })

    test('todos os títulos devem ter endereço', () => {
      metadata.records.forEach((record) => {
        expect(record.address).toBeDefined()
      })
    })

    test('todos os títulos devem ter CEP formatado', () => {
      metadata.records.forEach((record) => {
        if (record.zipCode && record.zipCode.trim().length > 0) {
          // Pode ter ou não hífen
          expect(record.zipCode).toMatch(/^\d{5}-?\d{3}$/)
        }
      })
    })

    test('todos os títulos devem ter cidade e estado', () => {
      metadata.records.forEach((record) => {
        expect(record.city).toBeDefined()
        expect(record.state).toBeDefined()
        if (record.state) {
          expect(record.state.length).toBe(2)
        }
      })
    })

    // Campos nossoNumero, numeroDocumento e comando estão presentes no JSON
    // mas não são parte do tipo FixtureRecord padrão.
    // Validação específica fica em ".integrity.test.ts"
  })

  describe('Totalizadores', () => {
    test('deve ter quantidade de registros correto', () => {
      expect(metadata.totals.recordCount).toBe(113)
      expect(metadata.totals.recordCount).toBe(metadata.records.length)
    })

    test('deve ter soma total dos valores', () => {
      expect(metadata.totals.totalAmount).toBeGreaterThan(0)
    })

    test('recordCount deve bater com tamanho do array records', () => {
      expect(metadata.totals.recordCount).toBe(metadata.records.length)
    })

    test('totalAmount deve bater com soma dos amounts', () => {
      const sumFromRecords = metadata.records.reduce((sum, r) => sum + r.amount, 0)
      expect(metadata.totals.totalAmount).toBeCloseTo(sumFromRecords, 2)
    })
  })

  describe('Validações cruzadas', () => {
    test('detailLines deve ser igual ao recordCount (CNAB 400 = 1 linha tipo 7 por título)', () => {
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount)
    })

    test('messageLines deve ser igual ao recordCount (cada título tem 1 registro tipo 5/99 de multa)', () => {
      expect(metadata.structure.messageLines).toBe(metadata.totals.recordCount)
    })

    test('todos os campos raw devem ter tamanho correto', () => {
      metadata.records.forEach((record) => {
        // Data de vencimento raw = 6 dígitos (DDMMAA)
        expect(record.dueDateRaw).toHaveLength(6)
        // Valor raw = 13 dígitos (BB: posições 127-139)
        expect(record.amountRaw).toHaveLength(13)
        expect(record.amountRaw).toMatch(/^\d+$/)
        // Documento raw = 14 dígitos (BB: posições 221-234)
        expect(record.documentRaw).toHaveLength(14)
        expect(record.documentRaw).toMatch(/^\d+$/)
      })
    })

    test('todos os documentos devem ter tamanho válido', () => {
      metadata.records.forEach((record) => {
        if (record.documentType === 'CPF') {
          // CPF sem formatação = 11 dígitos
          expect(record.document.length).toBe(11)
        } else {
          // CNPJ sem formatação = 14 dígitos
          expect(record.document.length).toBe(14)
        }
      })
    })

    test('todos os valores devem ser positivos', () => {
      metadata.records.forEach((record) => {
        expect(record.amount).toBeGreaterThan(0)
      })
    })

    test('todos os nomes devem estar preenchidos', () => {
      metadata.records.forEach((record) => {
        expect(record.name.trim().length).toBeGreaterThan(0)
      })
    })
  })

  describe('Amostra de registros', () => {
    test('primeiros 3 registros devem estar acessíveis', () => {
      expect(metadata.records.length).toBeGreaterThanOrEqual(3)

      // Verificar que os primeiros 3 registros têm dados válidos
      const primeiros3 = metadata.records.slice(0, 3)
      primeiros3.forEach((record) => {
        expect(record.name).toBeTruthy()
        expect(record.amount).toBeGreaterThan(0)
        expect(record.dueDate).toMatch(/\d{2}\/\d{2}\/\d{4}/)
        expect(record.document).toBeTruthy()
      })
    })

    test('primeiro registro: COMERCIAL ALFA LTDA', () => {
      const primeiro = metadata.records[0]
      expect(primeiro.name).toBe('COMERCIAL ALFA LTDA')
      expect(primeiro.document).toBe('01000000997396')
      expect(primeiro.amount).toBe(3390.2)
      expect(primeiro.dueDate).toBe('20/07/2026')
      // Campos nossoNumero e numeroDocumento não estão no tipo padrão
    })

    test('segundo registro: DISTRIBUIDORA ALFA LTDA', () => {
      const segundo = metadata.records[1]
      expect(segundo.name).toBe('DISTRIBUIDORA ALFA LTDA')
      expect(segundo.document).toBe('01000001994668')
      expect(segundo.amount).toBe(2300.3)
      expect(segundo.dueDate).toBe('24/08/2026')
      // Campos nossoNumero e numeroDocumento não estão no tipo padrão
    })

    test('terceiro registro: ATACADISTA ALFA LTDA', () => {
      const terceiro = metadata.records[2]
      expect(terceiro.name).toBe('ATACADISTA ALFA LTDA')
      expect(terceiro.document).toBe('01000002991930')
      expect(terceiro.amount).toBe(937.3)
      expect(terceiro.dueDate).toBe('22/06/2026')
      // Campos nossoNumero e numeroDocumento não estão no tipo padrão
    })
  })
})
