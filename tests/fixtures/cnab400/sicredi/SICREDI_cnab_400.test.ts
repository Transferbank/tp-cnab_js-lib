/**
 * Validação do conteúdo de SICREDI_cnab_400.json: forma e valores do metadata.json
 * em si (autoconsistência + valores "golden" conferidos manualmente contra o .CRM real).
 *
 * Parsing das linhas brutas com os schemas TS fica em `.integrity.test.ts`.
 * Pipeline público (`validateCnabFile`) fica em `.e2e.test.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { loadFixtureMetadata } from '../../../helpers/fixture-metadata'
import { BANK_CODES } from '../../../../src/types'

describe('Metadados: SICREDI_cnab_400.json', () => {
  const fixtureDir = path.join(__dirname)
  const txtPath = path.join(fixtureDir, 'SICREDI_cnab_400.CRM')
  const txtContent = fs.readFileSync(txtPath, 'latin1')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  let metadata: ReturnType<typeof loadFixtureMetadata>

  beforeAll(() => {
    metadata = loadFixtureMetadata('sicredi', 'SICREDI_cnab_400', 'cnab400')
  })

  describe('Campos principais', () => {
    test('deve ter descrição correta', () => {
      expect(metadata.description).toContain('Sicredi')
    })

    test('deve ter código do banco Sicredi (748)', () => {
      expect(metadata.bankCode).toBe(BANK_CODES.SICREDI)
    })

    test('deve ter nome do banco correto', () => {
      expect(metadata.bankName).toBe('Sicredi')
    })

    test('deve ser formato CNAB400', () => {
      expect(metadata.format).toBe('CNAB400')
    })
  })

  describe('Estrutura do arquivo', () => {
    test('deve ter total de linhas consistente', () => {
      expect(metadata.structure.totalLines).toBe(lines.length)
      expect(metadata.structure.totalLines).toBe(45) // 1 header + 43 tipo 1 + 1 trailer
    })

    test('deve ter 1 linha de header', () => {
      expect(metadata.structure.headerLines).toBe(1)
    })

    test('deve ter 43 linhas de detalhe (tipo 1)', () => {
      expect(metadata.structure.detailLines).toBe(43)
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount)
    })

    test('deve ter 1 linha de trailer', () => {
      expect(metadata.structure.trailerLines).toBe(1)
    })

    test('não deve ter registros opcionais neste arquivo', () => {
      // Esta fixture não tem registros tipo 2/5/6/7/8
      expect(metadata.structure.messageLines).toBeUndefined()
    })

    test('estrutura deve estar completa: header + detalhe + trailer = total', () => {
      const { headerLines, detailLines, trailerLines, totalLines } = metadata.structure
      expect(headerLines + detailLines + trailerLines).toBe(totalLines)
      expect(1 + 43 + 1).toBe(45)
    })
  })

  describe('Header do arquivo', () => {
    test('deve ter dados do header', () => {
      expect(metadata.header).toBeDefined()
    })

    test('deve ter código do cliente (5 dígitos)', () => {
      // Sicredi usa "código do cliente" em vez de agência+conta separados
      expect(metadata.header?.codigoCliente).toHaveLength(5)
      // Valor confirmado no arquivo (fixture com dados fictícios)
      expect(metadata.header?.codigoCliente).toBe('81234')
    })

    test('deve ter número de inscrição do cedente', () => {
      expect(metadata.header?.numeroInscricaoCedente).toHaveLength(14)
      // Valor confirmado no arquivo (fixture com dados fictícios)
      expect(metadata.header?.numeroInscricaoCedente).toBe('50008976697350')
    })

    test('deve ter data de geração formatada', () => {
      expect(metadata.header?.dataGeracao).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      // Valor confirmado: 27/06/2026
      expect(metadata.header?.dataGeracao).toBe('27/06/2026')
    })

    test('deve ter data de geração raw em formato AAAAMMDD (8 dígitos)', () => {
      expect(metadata.header?.dataGeracaoRaw).toHaveLength(8)
      // Valor confirmado: 20260627 (AAAAMMDD)
      expect(metadata.header?.dataGeracaoRaw).toBe('20260627')
    })

    test('deve ter sequencial de remessa', () => {
      expect(metadata.header?.sequencialRemessa).toHaveLength(7)
      // Valor confirmado no arquivo real
      expect(metadata.header?.sequencialRemessa).toBe('0000196')
    })

    test('deve ter versão do sistema', () => {
      // Valor confirmado no arquivo real
      expect(metadata.header?.versaoSistema).toBe('2.00')
    })

    test('deve ser arquivo de remessa (código "1")', () => {
      expect(metadata.header?.tipoArquivo).toBe('1')
    })
  })

  describe('Registros/Títulos', () => {
    test('deve ter exatamente 43 títulos', () => {
      expect(metadata.records.length).toBe(43)
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

    test('todos os títulos devem ter tipo de documento CNPJ', () => {
      // Esta fixture só tem CNPJs
      metadata.records.forEach((record) => {
        expect(record.documentType).toBe('CNPJ')
        expect(record.documentTypeCode).toBe('2')
        expect(record.document.length).toBe(14)
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
        expect(record.amountRaw?.length).toBe(13) // Sicredi: 13 posições com 2 decimais
      })
    })

    test('todos os títulos devem ter vencimento no formato DD/MM/YYYY', () => {
      metadata.records.forEach((record) => {
        expect(record.dueDate).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      })
    })

    test('todos os títulos devem ter vencimento raw com 6 dígitos (DDMMAA)', () => {
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

    test('todos os títulos devem ter nosso número', () => {
      metadata.records.forEach((record) => {
        expect(record.nossoNumero).toBeTruthy()
        expect(record.nossoNumero?.length).toBeGreaterThan(0)
      })
    })

    test('todos os títulos devem ter número do documento', () => {
      metadata.records.forEach((record) => {
        expect(record.numeroDocumento).toBeTruthy()
        expect(record.numeroDocumento?.length).toBeGreaterThan(0)
      })
    })

    test('todos os títulos devem ter instrução', () => {
      metadata.records.forEach((record) => {
        expect(record.instrucao).toBeTruthy()
        expect(record.instrucao).toMatch(/^\d{2}$/)
      })
    })

    test('todos os títulos devem ter espécie', () => {
      metadata.records.forEach((record) => {
        expect(record.especie).toBeTruthy()
        expect(record.especie).toMatch(/^[A-Z]$/)
      })
    })
  })

  describe('Totalizadores', () => {
    test('deve ter quantidade de registros correto', () => {
      expect(metadata.totals.recordCount).toBe(43)
      expect(metadata.totals.recordCount).toBe(metadata.records.length)
    })

    test('deve ter soma total dos valores', () => {
      expect(metadata.totals.totalAmount).toBeGreaterThan(0)
      // Valor confirmado manualmente
      expect(metadata.totals.totalAmount).toBeCloseTo(28480.38, 2)
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

    test('todos os campos raw devem ter tamanho correto', () => {
      metadata.records.forEach((record) => {
        // Data de vencimento raw = 6 dígitos (DDMMAA)
        expect(record.dueDateRaw).toHaveLength(6)
        // Valor raw = 13 dígitos (Sicredi: posições 127-139)
        expect(record.amountRaw).toHaveLength(13)
        expect(record.amountRaw).toMatch(/^\d+$/)
        // Documento raw = 14 dígitos
        expect(record.documentRaw).toHaveLength(14)
        expect(record.documentRaw).toMatch(/^\d+$/)
      })
    })

    test('todos os documentos devem ter tamanho de CNPJ', () => {
      metadata.records.forEach((record) => {
        // Todos são CNPJs nesta fixture
        expect(record.document.length).toBe(14)
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

    test('todas as instruções devem ser "01"', () => {
      // Valor confirmado no arquivo real
      metadata.records.forEach((record) => {
        expect(record.instrucao).toBe('01')
      })
    })

    test('todas as espécies devem ser "A"', () => {
      // Valor confirmado no arquivo real
      metadata.records.forEach((record) => {
        expect(record.especie).toBe('A')
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
      expect(primeiro.document).toBe('50000997300038')
      expect(primeiro.amount).toBeCloseTo(660.14, 2)
      expect(primeiro.dueDate).toBe('29/03/2026')
      // Campos nossoNumero, numeroDocumento, instrucao, especie não estão no tipo padrão
    })

    test('segundo registro: COMERCIAL ALFA LTDA', () => {
      const segundo = metadata.records[1]
      expect(segundo.name).toBe('COMERCIAL ALFA LTDA')
      expect(segundo.document).toBe('50000997300038')
      expect(segundo.amount).toBeCloseTo(659.93, 2)
      expect(segundo.dueDate).toBe('28/04/2026')
      // Campos nossoNumero, numeroDocumento não estão no tipo padrão
    })

    test('terceiro registro: COMERCIAL ALFA LTDA', () => {
      const terceiro = metadata.records[2]
      expect(terceiro.name).toBe('COMERCIAL ALFA LTDA')
      expect(terceiro.document).toBe('50000997300038')
      expect(terceiro.amount).toBeCloseTo(659.93, 2)
      expect(terceiro.dueDate).toBe('28/05/2026')
      // Campos nossoNumero, numeroDocumento não estão no tipo padrão
    })

    test('quarto registro: DISTRIBUIDORA ALFA LTDA', () => {
      const quarto = metadata.records[3]
      expect(quarto.name).toBe('DISTRIBUIDORA ALFA LTDA')
      expect(quarto.document).toBe('50000998297359')
      expect(quarto.amount).toBeCloseTo(232.47, 2)
      expect(quarto.dueDate).toBe('29/03/2026')
      // Campos nossoNumero, numeroDocumento não estão no tipo padrão
    })
  })
})
