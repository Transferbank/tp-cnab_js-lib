/**
 * Valida??o do conte?do de SANTANDER_cnab_400_140.json: forma e valores do metadata.json
 * em si (autoconsist?ncia + valores "golden" conferidos manualmente contra o .REM real).
 *
 * Parsing das linhas brutas com os schemas TS fica em `.integrity.test.ts`.
 * Pipeline p?blico (`validateCnabFile`) fica em `.e2e.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { BANK_CODES, CNABFormatCode } from '@tp-types/index'
import type { FixtureMetadata } from '@tp-types/testing'
import { isValidCpfCnpj } from '@utils/string-utils'

describe('Metadados: SANTANDER_cnab_400_140.json', () => {
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

  describe('Campos principais', () => {
    test('deve ter descri??o correta', () => {
      expect(metadata.description).toContain('Santander')
    })

    test('deve ter c?digo do banco Santander (033)', () => {
      expect(metadata.bankCode).toBe(BANK_CODES.SANTANDER)
    })

    test('deve ter nome do banco correto', () => {
      expect(metadata.bankName).toBe('Santander')
    })

    test('deve ser formato CNAB400', () => {
      expect(metadata.format).toBe(CNABFormatCode.CNAB400)
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
      // Santander CNAB 400 n?o usa linhas tipo 2 (mensagens) neste fixture
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
      // Valor confirmado no arquivo (fixture com dados fict?cios)
      expect(metadata.header?.cedenteNome?.trim()).toBe('COMERCIO EXEMPLO LTDA')
    })

    test('deve ter data de gera??o formatada', () => {
      expect(metadata.header?.dataGeracao).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      // Valor confirmado: 25/05/2026
      expect(metadata.header?.dataGeracao).toBe('25/05/2026')
    })

    test('deve ter data de gera??o raw', () => {
      expect(metadata.header?.dataGeracaoRaw).toHaveLength(6)
      // Valor confirmado: 250526 (DDMMAA)
      expect(metadata.header?.dataGeracaoRaw).toBe('250526')
    })

    test('deve ser arquivo de remessa (c?digo "1")', () => {
      expect(metadata.header?.tipoArquivo).toBe('1')
    })

    // Nota: codigoTransmissao n?o est? no tipo FixtureHeader padr?o (? espec?fico do Santander)
    // mas pode ser validado diretamente contra o arquivo TXT na se??o de integridade
  })

  describe('Registros/T?tulos', () => {
    test('deve ter exatamente 128 t?tulos', () => {
      expect(metadata.records.length).toBe(128)
    })

    test('cada t?tulo deve ter ?ndice sequencial', () => {
      metadata.records.forEach((record, idx) => {
        expect(record.index).toBe(idx + 1)
      })
    })

    test('todos os t?tulos devem ter nome preenchido', () => {
      metadata.records.forEach((record) => {
        expect(record.name).toBeTruthy()
        expect(record.name.length).toBeGreaterThan(0)
      })
    })

    test('todos os t?tulos devem ter documento v?lido', () => {
      metadata.records.forEach((record) => {
        expect(record.document).toBeTruthy()
        expect(record.document).toMatch(/^\d+$/)
      })
    })

    test('todos os t?tulos devem ter documento raw', () => {
      metadata.records.forEach((record) => {
        expect(record.documentRaw).toBeTruthy()
        expect(record.documentRaw).toMatch(/^\d{14}$/) // 14 d?gitos com padding
      })
    })

    test('todos os t?tulos devem ter tipo de documento v?lido', () => {
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

    test('todos os t?tulos devem ter valor maior que zero', () => {
      metadata.records.forEach((record) => {
        expect(record.amount).toBeGreaterThan(0)
      })
    })

    test('todos os t?tulos devem ter valor raw com formato num?rico', () => {
      metadata.records.forEach((record) => {
        expect(record.amountRaw).toMatch(/^\d+$/)
        expect(record.amountRaw?.length).toBe(13) // Santander: 13 posi??es com 2 decimais
      })
    })

    test('todos os t?tulos devem ter vencimento no formato DD/MM/YYYY', () => {
      metadata.records.forEach((record) => {
        expect(record.dueDate).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      })
    })

    test('todos os t?tulos devem ter vencimento raw com 6 d?gitos', () => {
      metadata.records.forEach((record) => {
        expect(record.dueDateRaw).toHaveLength(6)
        expect(record.dueDateRaw).toMatch(/^\d{6}$/)
      })
    })

    test('todos os t?tulos devem ter endere?o', () => {
      metadata.records.forEach((record) => {
        expect(record.address).toBeDefined()
        // Endere?os podem estar vazios no Santander, ent?o apenas verifica que o campo existe
      })
    })

    test('todos os t?tulos devem ter CEP formatado (se presente)', () => {
      metadata.records.forEach((record) => {
        if (record.zipCode && record.zipCode.trim().length > 0) {
          // Pode ter ou n?o h?fen
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

  describe('Valida??es cruzadas', () => {
    test('detailLines deve ser igual ao recordCount (CNAB 400 = 1 linha por t?tulo)', () => {
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount)
    })

    test('todos os campos raw devem ter tamanho correto', () => {
      metadata.records.forEach((record) => {
        // Data de vencimento raw = 6 d?gitos (DDMMAA)
        expect(record.dueDateRaw).toHaveLength(6)
        // Valor raw = 13 d?gitos (Santander: posi??es 127-139)
        expect(record.amountRaw).toHaveLength(13)
        expect(record.amountRaw).toMatch(/^\d+$/)
        // Documento raw = 14 d?gitos (Santander: posi??es 221-234)
        expect(record.documentRaw).toHaveLength(14)
        expect(record.documentRaw).toMatch(/^\d+$/)
      })
    })

    test('todos os documentos devem ter tamanho v?lido', () => {
      metadata.records.forEach((record) => {
        if (record.documentType === 'CPF') {
          // CPF sem formata??o = 11 d?gitos
          expect(record.document.length).toBe(11)
        } else {
          // CNPJ sem formata??o = 14 d?gitos
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
      metadata.records.forEach((record) => {
        // Validação externa - prova que os documentos estão corretos
        expect(isValidCpfCnpj(record.documentRaw!)).toBe(true)
      })
    })
  })
})

