/**
 * Teste de validação do arquivo JSON de metadados
 * 
 * Garante que o arquivo remessa-multipla.json é válido e pode ser carregado
 */

import { loadFixtureMetadata } from '../../../helpers/fixture-metadata'
import { BANK_CODES } from '@tp-types/index'
import { CNABFormatCode } from '@tp-types/index'

describe('Metadados: remessa-multipla.json', () => {
  let metadata: ReturnType<typeof loadFixtureMetadata>

  beforeAll(() => {
    // Carregar metadados usando o helper
    metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')
  })

  describe('Campos principais', () => {
    test('deve ter descrição correta', () => {
      expect(metadata.description).toContain('Bradesco')
      expect(metadata.description).toContain('CNAB 240')
    })

    test('deve ter código do banco Bradesco (237)', () => {
      expect(metadata.bankCode).toBe(BANK_CODES.BRADESCO)
    })

    test('deve ter nome do banco correto', () => {
      expect(metadata.bankName).toBe('Bradesco')
    })

    test('deve ser formato CNAB240', () => {
      expect(metadata.format).toBe(CNABFormatCode.CNAB240)
    })
  })

  describe('Estrutura do arquivo', () => {
    test('deve ter total de linhas consistente', () => {
      expect(metadata.structure.totalLines).toBeGreaterThan(0)
      expect(metadata.structure.totalLines).toBe(
        metadata.structure.headerLines + 
        metadata.structure.detailLines + 
        metadata.structure.trailerLines
      )
    })

    test('deve ter 2 linhas de header (Header de Arquivo + Header de Lote)', () => {
      expect(metadata.structure.headerLines).toBe(2)
    })

    test('deve ter linhas de detalhe corretas (recordCount × 4 segmentos: P+Q+R+S)', () => {
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount * 4)
    })

    test('deve ter 2 linhas de trailer (Trailer de Lote + Trailer de Arquivo)', () => {
      expect(metadata.structure.trailerLines).toBe(2)
    })

    test('deve ter 1 lote', () => {
      expect(metadata.structure.batchCount).toBe(1)
    })

    test('estrutura deve estar consistente (header + detalhe + trailer = total)', () => {
      const { headerLines, detailLines, trailerLines, totalLines } = metadata.structure
      expect(headerLines + detailLines + trailerLines).toBe(totalLines)
    })
  })

  describe('Header do arquivo', () => {
    test('deve ter dados do header', () => {
      expect(metadata.header).toBeDefined()
    })

    test('deve ter nome do cedente', () => {
      expect(metadata.header!.cedenteNome).toBe('EMPRESA EXEMPLO LTDA')
    })

    test('deve ter data de geração formatada', () => {
      expect(metadata.header!.dataGeracao).toBe('01/07/2026')
    })

    test('deve ter data de geração raw', () => {
      expect(metadata.header!.dataGeracaoRaw).toBe('01072026')
    })

    test('deve ser arquivo de remessa (código "1")', () => {
      expect(metadata.header!.tipoArquivo).toBe('1')
    })
  })

  describe('Registros/Títulos', () => {
    test('deve ter pelo menos um título', () => {
      expect(metadata.records.length).toBeGreaterThan(0)
    })

    test('cada título deve ter índice sequencial', () => {
      expect(metadata.records[0].index).toBe(0)
      expect(metadata.records[1].index).toBe(1)
      expect(metadata.records[2].index).toBe(2)
    })

    describe('Título 1 - JOAO EXEMPLO SILVA', () => {
      test('deve ter nome correto', () => {
        expect(metadata.records[0].name).toBe('JOAO EXEMPLO SILVA')
      })

      test('deve ter CPF sem formatação', () => {
        expect(metadata.records[0].document).toBe('10000791989')
        expect(metadata.records[0].documentType).toBe('CPF')
        expect(metadata.records[0].documentTypeCode).toBe('1')
      })

      test('deve ter CPF em formato raw com padding', () => {
        expect(metadata.records[0].documentRaw).toBe('000010000791989')
      })

      test('deve ter valor R$ 100,00', () => {
        expect(metadata.records[0].amount).toBe(100.00)
      })

      test('deve ter valor raw com padding de zeros', () => {
        expect(metadata.records[0].amountRaw).toBe('000000000010000')
      })

      test('deve ter vencimento 15/12/2026', () => {
        expect(metadata.records[0].dueDate).toBe('15/12/2026')
      })

      test('deve ter vencimento raw', () => {
        expect(metadata.records[0].dueDateRaw).toBe('15122026')
      })

      test('deve ter endereço completo', () => {
        expect(metadata.records[0].address).toBe('RUA EXEMPLO 123')
        expect(metadata.records[0].city).toBe('SAO PAULO')
        expect(metadata.records[0].state).toBe('SP')
        expect(metadata.records[0].zipCode).toBe('01234-567')
      })
    })

    describe('Título 2 - MARIA EXEMPLO SILVA', () => {
      test('deve ter nome correto', () => {
        expect(metadata.records[1].name).toBe('MARIA EXEMPLO SILVA')
      })

      test('deve ter CPF correto', () => {
        expect(metadata.records[1].document).toBe('10001583816')
        expect(metadata.records[1].documentRaw).toBe('000010001583816')
        expect(metadata.records[1].documentType).toBe('CPF')
      })

      test('deve ter valor R$ 250,00', () => {
        expect(metadata.records[1].amount).toBe(250.00)
        expect(metadata.records[1].amountRaw).toBe('000000000025000')
      })

      test('deve ter vencimento 20/12/2026', () => {
        expect(metadata.records[1].dueDate).toBe('20/12/2026')
        expect(metadata.records[1].dueDateRaw).toBe('20122026')
      })

      test('deve ter endereço correto', () => {
        expect(metadata.records[1].address).toBe('AV PAULISTA 1000')
        expect(metadata.records[1].zipCode).toBe('01311-000')
      })
    })

    describe('Título 3 - COMERCIAL EXEMPLO LTDA', () => {
      test('deve ter nome correto', () => {
        expect(metadata.records[2].name).toBe('COMERCIAL EXEMPLO LTDA')
      })

      test('deve ter CNPJ correto', () => {
        expect(metadata.records[2].document).toBe('60000001994627')
        expect(metadata.records[2].documentRaw).toBe('060000001994627')
        expect(metadata.records[2].documentType).toBe('CNPJ')
        expect(metadata.records[2].documentTypeCode).toBe('2')
      })

      test('deve ter valor R$ 500,00', () => {
        expect(metadata.records[2].amount).toBe(500.00)
        expect(metadata.records[2].amountRaw).toBe('000000000050000')
      })

      test('deve ter vencimento 31/12/2026', () => {
        expect(metadata.records[2].dueDate).toBe('31/12/2026')
        expect(metadata.records[2].dueDateRaw).toBe('31122026')
      })

      test('deve ter endereço correto', () => {
        expect(metadata.records[2].address).toBe('RUA COMERCIAL EXEMPLO 500')
        expect(metadata.records[2].zipCode).toBe('04567-890')
      })
    })
  })

  describe('Totalizadores', () => {
    test('deve ter quantidade de registros correto', () => {
      expect(metadata.totals.recordCount).toBe(metadata.records.length)
    })

    test('deve ter soma total dos valores', () => {
      const expectedTotal = metadata.records.reduce((sum, r) => sum + r.amount, 0)
      expect(metadata.totals.totalAmount).toBe(expectedTotal)
    })

    test('recordCount deve bater com tamanho do array records', () => {
      expect(metadata.totals.recordCount).toBe(metadata.records.length)
    })

    test('totalAmount deve bater com soma dos amounts', () => {
      const sum = metadata.records.reduce((acc, rec) => acc + rec.amount, 0)
      expect(metadata.totals.totalAmount).toBe(sum)
    })
  })

  describe('Validações cruzadas', () => {
    test('detailLines deve ser 4x recordCount (P+Q+R+S por título)', () => {
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount * 4)
    })

    test('todos os campos raw devem ter tamanho correto', () => {
      metadata.records.forEach((record) => {
        // CPF raw = 15 caracteres
        if (record.documentType === 'CPF') {
          expect(record.documentRaw?.length).toBe(15)
        }
        // CNPJ raw = 15 caracteres (com padding)
        if (record.documentType === 'CNPJ') {
          expect(record.documentRaw?.length).toBe(15)
        }
        // Amount raw = 15 caracteres
        expect(record.amountRaw?.length).toBe(15)
        // Date raw = 8 caracteres
        expect(record.dueDateRaw?.length).toBe(8)
      })
    })

    test('todos os documentos devem ser válidos', () => {
      // Verificar que documentos têm apenas números
      metadata.records.forEach(record => {
        expect(record.document).toMatch(/^\d+$/)
        expect(record.documentRaw).toMatch(/^\d+$/)
      })
    })
  })
})
