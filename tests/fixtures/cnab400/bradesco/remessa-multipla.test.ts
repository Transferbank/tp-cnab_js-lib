import * as fs from 'fs'
import * as path from 'path'
import { extractLineFields } from '../../../../src/parser/field-extractor'
import { getBankSchema } from '../../../../src/schemas'
import { validateCnabFile } from '../../../../src'
import { loadFixtureMetadata } from '../../../helpers/fixture-metadata'
import { validateFixtureIntegrity } from '../../../helpers/fixture-validator'
import { BANK_CODES } from '@tp-types/index'
import { CNABFormatCode } from '@tp-types/index'

describe('Metadados: remessa-multipla.json', () => {
  const fixtureDir = path.join(__dirname)
  const txtPath = path.join(fixtureDir, 'remessa-multipla.txt')
  const txtContent = fs.readFileSync(txtPath, 'utf-8')
  const lines = txtContent.split(/\r?\n/).filter((line) => line.trim().length > 0)

  let metadata: ReturnType<typeof loadFixtureMetadata>

  beforeAll(() => {
    metadata = loadFixtureMetadata('bradesco', 'remessa-multipla', CNABFormatCode.CNAB400)
  })

  describe('Campos principais', () => {
    test('deve ter descrição correta', () => {
      expect(metadata.description).toContain('remessa')
    })

    test('deve ter código do banco Bradesco (237)', () => {
      expect(metadata.bankCode).toBe(BANK_CODES.BRADESCO)
    })

    test('deve ter nome do banco correto', () => {
      expect(metadata.bankName).toBe('Bradesco')
    })

    test('deve ser formato CNAB400', () => {
      expect(metadata.format).toBe(CNABFormatCode.CNAB400)
    })
  })

  describe('Estrutura do arquivo', () => {
    test('deve ter total de linhas consistente', () => {
      expect(metadata.structure.totalLines).toBe(lines.length)
    })

    test('deve ter 1 linha de header', () => {
      expect(metadata.structure.headerLines).toBe(1)
    })

    test('deve ter linhas de detalhe corretas', () => {
      expect(metadata.structure.detailLines).toBe(metadata.totals.recordCount)
    })

    test('deve ter 1 linha de trailer', () => {
      expect(metadata.structure.trailerLines).toBe(1)
    })

    test('estrutura deve estar consistente (header + detalhe + trailer = total)', () => {
      const { headerLines, detailLines, trailerLines, totalLines } = metadata.structure
      // CNAB 400 pode ter linhas tipo 2 (mensagens), então soma pode ser menor que total
      expect(headerLines + detailLines + trailerLines).toBeLessThanOrEqual(totalLines)
    })

    test('header + detalhe + mensagem + trailer deve bater exatamente com o total (todas as linhas contabilizadas)', () => {
      const { headerLines, detailLines, trailerLines, totalLines, messageLines } = metadata.structure
      expect(headerLines + detailLines + (messageLines ?? 0) + trailerLines).toBe(totalLines)
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

    test('deve ter data de geração raw', () => {
      expect(metadata.header?.dataGeracaoRaw).toHaveLength(6)
    })

    test('deve ser arquivo de remessa (código "1")', () => {
      expect(metadata.header?.tipoArquivo).toBe('1')
    })
  })

  describe('Registros/Títulos', () => {
    test('deve ter pelo menos um título', () => {
      expect(metadata.records.length).toBeGreaterThan(0)
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
  })

  describe('Totalizadores', () => {
    test('deve ter quantidade de registros correto', () => {
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

  describe('Integridade TXT ? JSON', () => {
    test('deve validar integridade entre arquivo TXT e metadados JSON', () => {
      // Linhas tipo 2 (mensagens) não entram em `result.records` — o parser de detalhe do
      // CNAB 400 só processa linhas tipo 1, então não afetam esta comparação registro a registro.
      const schema = getBankSchema(BANK_CODES.BRADESCO, CNABFormatCode.CNAB400)
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

    test('header deve ter código do banco correto', () => {
      const schema = getBankSchema(BANK_CODES.BRADESCO, CNABFormatCode.CNAB400)
      if (schema) {
        const headerParsed = extractLineFields(lines[0], schema.header || {})
        const bankCode = headerParsed.codigo_banco?.value
        expect(String(bankCode)).toBe(BANK_CODES.BRADESCO)
      }
    })

    test('todos os registros tipo 1 devem ser parseáveis', () => {
      const schema = getBankSchema(BANK_CODES.BRADESCO, CNABFormatCode.CNAB400)
      if (schema) {
        const detailLines = lines.filter((line) => line[0] === '1')

        detailLines.forEach((line) => {
          const parsed = extractLineFields(line, schema.detail || {})

          // Deve ter nome
          expect(parsed.nome?.value).toBeTruthy()
          // Deve ter valor
          expect(parsed.valor_titulo?.value).toBeDefined()
          // Deve ter vencimento
          expect(parsed.vencimento?.value).toBeDefined()
        })
      }
    })
  })

  describe('validateCnabFile — pipeline público de ponta a ponta', () => {
    // Usa o caminho que um consumidor real da lib usa: conteúdo bruto do arquivo,
    // sem pré-separar linhas nem escolher schema manualmente (detecção de formato/banco
    // incluída). Diferente dos blocos acima, que testam parsing campo a campo isolado.
    const result = validateCnabFile(txtContent)

    test('deve detectar formato CNAB 400 e banco Bradesco (237)', () => {
      expect(result.format).toBe('CNAB 400')
      expect(result.bank).toEqual({ code: '237', name: 'Bradesco' })
    })

    test('deve extrair um registro por título (37)', () => {
      expect(result.totalRecords).toBe(metadata.totals.recordCount)
    })

    test('não deve ter erros de parsing/schema (vencimento no passado é regra de negócio, não é validado aqui)', () => {
      // Este arquivo real tem títulos com vencimento anterior à data atual — isso é
      // esperado e não é responsabilidade do schema/parser (é tratado em outra camada).
      // Qualquer outro erro (posição errada, campo obrigatório vazio, tipo inválido etc.)
      // ainda deve zerar aqui.
      const errosDeParsing = result.errors.filter(
        (error) => !(error.field === 'Data de vencimento' && error.message.includes('anterior à data atual'))
      )

      expect(errosDeParsing).toEqual([])
    })

    test('deve extrair os dados do primeiro título batendo com os metadados', () => {
      const primeiro = result.records[0]
      const esperado = metadata.records[0]

      expect(primeiro.name).toContain(esperado.name)
      expect(primeiro.amount).toBe(esperado.amount)
      expect(primeiro.dueDate).toBe(esperado.dueDate)
    })
  })
})
