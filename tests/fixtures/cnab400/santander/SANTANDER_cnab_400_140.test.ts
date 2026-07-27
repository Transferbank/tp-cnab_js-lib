/**
 * Validação do conteúdo de SANTANDER_cnab_400_140.json: forma e valores do metadata.json
 * em si (autoconsistência + valores "golden" conferidos manualmente contra o .REM real).
 *
 * Parsing das linhas brutas com os schemas TS fica em `.integrity.test.ts`.
 * Pipeline público (`validateCnabFile`) fica em `.e2e.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { loadFixtureMetadata } from '../../../helpers/fixture-metadata'
import { BANK_CODES } from '../../../../src/types'

describe('Metadados: SANTANDER_cnab_400_140.json', () => {
  const fixtureDir = path.join(__dirname)
  const txtPath = path.join(fixtureDir, 'SANTANDER_cnab_400_140.REM')
  const txtContent = fs.readFileSync(txtPath, 'latin1')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  let metadata: ReturnType<typeof loadFixtureMetadata>

  beforeAll(() => {
    metadata = loadFixtureMetadata('santander', 'SANTANDER_cnab_400_140', 'cnab400')
  })

  describe('Campos principais', () => {
    test('deve ter descrição correta', () => {
      expect(metadata.description).toContain('Santander')
    })

    test('deve ter código do banco Santander (033)', () => {
      expect(metadata.bankCode).toBe(BANK_CODES.SANTANDER)
    })

    test('deve ter nome do banco correto', () => {
      expect(metadata.bankName).toBe('Santander')
    })

    test('deve ser formato CNAB400', () => {
      expect(metadata.format).toBe('CNAB400')
    })
  })

  describe('Estrutura do arquivo', () => {
    test('deve ter total de linhas consistente', () => {
      expect(metadata.structure.totalLines).toBe(lines.length)
      expect(metadata.structure.totalLines).toBe(130) // 1 header + 128 detalhes + 1 trailer
    })

    test('deve ter 1 linha de header', () => {
      expect(metadata.structure.headerLines).toBe(1)
    })

    test('deve ter 128 linhas de detalhe', () => {
      expect(metadata.structure.detailLines).toBe(128)
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount)
    })

    test('deve ter 1 linha de trailer', () => {
      expect(metadata.structure.trailerLines).toBe(1)
    })

    test('estrutura deve estar consistente (header + detalhe + trailer = total)', () => {
      const { headerLines, detailLines, trailerLines, totalLines, messageLines } = metadata.structure
      // Santander CNAB 400 não usa linhas tipo 2 (mensagens) neste fixture
      expect(messageLines).toBe(0)
      expect(headerLines + detailLines + trailerLines).toBe(totalLines)
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
      expect(metadata.header?.cedenteNome?.trim()).toBe('COMERCIO EXEMPLO LTDA')
    })

    test('deve ter data de geração formatada', () => {
      expect(metadata.header?.dataGeracao).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      // Valor confirmado: 25/05/2026
      expect(metadata.header?.dataGeracao).toBe('25/05/2026')
    })

    test('deve ter data de geração raw', () => {
      expect(metadata.header?.dataGeracaoRaw).toHaveLength(6)
      // Valor confirmado: 250526 (DDMMAA)
      expect(metadata.header?.dataGeracaoRaw).toBe('250526')
    })

    test('deve ser arquivo de remessa (código "1")', () => {
      expect(metadata.header?.tipoArquivo).toBe('1')
    })

    // Nota: codigoTransmissao não está no tipo FixtureHeader padrão (é específico do Santander)
    // mas pode ser validado diretamente contra o arquivo TXT na seção de integridade
  })

  describe('Registros/Títulos', () => {
    test('deve ter exatamente 128 títulos', () => {
      expect(metadata.records.length).toBe(128)
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
        expect(record.amountRaw?.length).toBe(13) // Santander: 13 posições com 2 decimais
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
        // Endereços podem estar vazios no Santander, então apenas verifica que o campo existe
      })
    })

    test('todos os títulos devem ter CEP formatado (se presente)', () => {
      metadata.records.forEach((record) => {
        if (record.zipCode && record.zipCode.trim().length > 0) {
          // Pode ter ou não hífen
          expect(record.zipCode).toMatch(/^\d{5}-?\d{3}$/)
        }
      })
    })
  })

  describe('Totalizadores', () => {
    test('deve ter quantidade de registros correto', () => {
      expect(metadata.totals.recordCount).toBe(128)
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
    test('detailLines deve ser igual ao recordCount (CNAB 400 = 1 linha por título)', () => {
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount)
    })

    test('todos os campos raw devem ter tamanho correto', () => {
      metadata.records.forEach((record) => {
        // Data de vencimento raw = 6 dígitos (DDMMAA)
        expect(record.dueDateRaw).toHaveLength(6)
        // Valor raw = 13 dígitos (Santander: posições 127-139)
        expect(record.amountRaw).toHaveLength(13)
        expect(record.amountRaw).toMatch(/^\d+$/)
        // Documento raw = 14 dígitos (Santander: posições 221-234)
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

    test('todos os documentos devem ter checksum CPF/CNPJ válido', () => {
      // Import do helper de validação
      const { isValidCpfCnpj } = require('../../../../src/utils/string-utils')

      metadata.records.forEach((record) => {
        // Validação externa - prova que os documentos estão corretos
        expect(isValidCpfCnpj(record.documentRaw)).toBe(true)
      })
    })
  })
})
