/**
 * Validação do conteúdo de ITAU_cnab_400.json: forma e valores do metadata.json
 * em si (autoconsistência + valores "golden" conferidos manualmente contra o .REM real).
 *
 * Parsing das linhas brutas com os schemas TS fica em `.integrity.test.ts`.
 * Pipeline público (`validateCnabFile`) fica em `.e2e.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { loadFixtureMetadata } from '../../../helpers/fixture-metadata'
import { BANK_CODES } from '../../../../src/types'

describe('Metadados: ITAU_cnab_400.json', () => {
  const fixtureDir = path.join(__dirname)
  const txtPath = path.join(fixtureDir, 'ITAU_cnab_400.REM')
  const txtContent = fs.readFileSync(txtPath, 'utf-8')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  let metadata: ReturnType<typeof loadFixtureMetadata>

  beforeAll(() => {
    metadata = loadFixtureMetadata('itau', 'ITAU_cnab_400', 'cnab400')
  })

  describe('Campos principais', () => {
    test('deve ter descrição correta', () => {
      expect(metadata.description).toBeTruthy()
    })

    test('deve ter código do banco Itaú (341)', () => {
      expect(metadata.bankCode).toBe(BANK_CODES.ITAU)
    })

    test('deve ter nome do banco correto', () => {
      expect(metadata.bankName).toBe('Itaú')
    })

    test('deve ser formato CNAB400', () => {
      expect(metadata.format).toBe('CNAB400')
    })
  })

  describe('Estrutura do arquivo', () => {
    test('deve ter total de linhas consistente', () => {
      expect(metadata.structure.totalLines).toBe(lines.length)
      expect(metadata.structure.totalLines).toBe(640) // 1 header + 319 tipo 1 + 319 tipo 2 + 1 trailer
    })

    test('deve ter 1 linha de header', () => {
      expect(metadata.structure.headerLines).toBe(1)
    })

    test('deve ter 319 linhas de detalhe (tipo 1)', () => {
      expect(metadata.structure.detailLines).toBe(319)
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount)
    })

    test('deve ter 1 linha de trailer', () => {
      expect(metadata.structure.trailerLines).toBe(1)
    })

    test('deve ter 319 linhas de mensagem/multa (tipo 2)', () => {
      // Itaú: cada título tem um registro tipo 2 (complemento de multa)
      expect(metadata.structure.messageLines).toBe(319)
    })

    test('estrutura deve estar completa: header + detalhe + mensagem + trailer = total', () => {
      const { headerLines, detailLines, messageLines = 0, trailerLines, totalLines } = metadata.structure
      expect(headerLines + detailLines + messageLines + trailerLines).toBe(totalLines)
      expect(1 + 319 + 319 + 1).toBe(640)
    })
  })

  describe('Header do arquivo', () => {
    test('deve ter dados do header', () => {
      expect(metadata.header).toBeDefined()
    })

    test('deve ter nome do cedente', () => {
      expect(metadata.header?.cedenteNome).toBeTruthy()
      expect(metadata.header?.cedenteNome?.length).toBeGreaterThan(0)
    })

    test('deve ter data de geração formatada', () => {
      expect(metadata.header?.dataGeracao).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    test('deve ter data de geração raw com 6 dígitos', () => {
      expect(metadata.header?.dataGeracaoRaw).toHaveLength(6)
      expect(metadata.header?.dataGeracaoRaw).toMatch(/^\d{6}$/)
    })

    test('deve ser arquivo de remessa (código "1")', () => {
      expect(metadata.header?.tipoArquivo).toBe('1')
    })
  })

  describe('Registros/Títulos', () => {
    test('deve ter exatamente 319 títulos', () => {
      expect(metadata.records.length).toBe(319)
      expect(metadata.totals.recordCount).toBe(319)
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
        expect(record.documentRaw).toMatch(/^\d+$/)
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
          // CNPJ pode ter 13 ou 14 dígitos após remover zeros à esquerda
          expect(record.document.length).toBeGreaterThanOrEqual(13)
          expect(record.document.length).toBeLessThanOrEqual(14)
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
        expect(record.amountRaw?.length).toBeGreaterThan(0)
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

    test('todos os títulos devem ter CEP formatado (se presente)', () => {
      metadata.records.forEach((record) => {
        if (record.zipCode) {
          // Pode ter ou não hífen
          expect(record.zipCode).toMatch(/^\d{5}-?\d{3}$/)
        }
      })
    })

    test('deve ter títulos de diversos estados brasileiros', () => {
      // Metadados mencionam 14 estados diferentes
      const estados = new Set(metadata.records.map((r) => r.state).filter(Boolean))
      expect(estados.size).toBeGreaterThanOrEqual(10) // Pelo menos 10 estados diferentes
    })
  })

  describe('Totalizadores', () => {
    test('deve ter quantidade de registros correto', () => {
      expect(metadata.totals.recordCount).toBe(metadata.records.length)
      expect(metadata.totals.recordCount).toBe(319)
    })

    test('deve ter soma total dos valores igual a R$ 1.237.856,15', () => {
      expect(metadata.totals.totalAmount).toBeCloseTo(1237856.15, 2)
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
    test('detailLines deve ser igual ao recordCount (CNAB 400 = 1 linha tipo 1 por título)', () => {
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount)
    })

    test('messageLines deve ser igual ao recordCount (cada título tem 1 registro tipo 2 de multa)', () => {
      expect(metadata.structure.messageLines).toBe(metadata.totals.recordCount)
    })

    test('todos os campos raw devem ter tamanho correto', () => {
      metadata.records.forEach((record) => {
        // Data de vencimento raw = 6 dígitos (DDMMAA)
        expect(record.dueDateRaw).toHaveLength(6)
        // Valor raw = string numérica
        expect(record.amountRaw).toMatch(/^\d+$/)
        // Documento raw = string numérica
        expect(record.documentRaw).toMatch(/^\d+$/)
      })
    })

    test('todos os documentos devem ter tamanho válido', () => {
      metadata.records.forEach((record) => {
        if (record.documentType === 'CPF') {
          // CPF sem formatação = 11 dígitos
          expect(record.document.length).toBe(11)
        } else {
          // CNPJ sem formatação = 13 ou 14 dígitos (após remover zeros à esquerda)
          expect(record.document.length).toBeGreaterThanOrEqual(13)
          expect(record.document.length).toBeLessThanOrEqual(14)
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
  })
})
