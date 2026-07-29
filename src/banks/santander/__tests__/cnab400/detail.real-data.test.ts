/**
 * Testes do Schema Santander CNAB 400 - Detalhe (Dados Reais)
 *
 * Duas camadas de evidência:
 * 1. Verificação independente (checksum, consistências estruturais)
 * 2. Regressão via metadata.json
 *
 * O pipeline público de ponta a ponta (`openCnab`) é coberto em
 * `SANTANDER_cnab_400_140.e2e.test.ts` — não duplicado aqui.
 *
 * Fixture: SANTANDER_cnab_400_140.REM (130 linhas: 1 header + 128 detalhes + 1 trailer)
 */

import { santanderCnab400 } from '@banks/santander/schemas/cnab400'
import { extractLineFields } from '@parser/field-extractor'
import { readFixture, isValidCpfCnpj } from './shared'
import { UFS_VALIDAS } from '../../../../../tests/helpers/ufs-brasileiras'
import type { FixtureMetadata } from '@tp-types/testing'
import * as fs from 'fs'
import * as path from 'path'

describe('Schema Santander CNAB 400 - Detalhe (Dados Reais)', () => {
  const lines = readFixture('SANTANDER_cnab_400_140.REM')
  const headerLine = lines[0]
  const detailLines = lines.filter((line) => line[0] === '1')
  const trailerLine = lines[lines.length - 1]

  describe('Verificação independente (evidência dentro do próprio arquivo real)', () => {
    test('CPF/CNPJ do sacado deve ser válido em todas as 128 linhas (checksum)', () => {
      expect(detailLines.length).toBe(128)

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, santanderCnab400.detail!)
        const documento = detail.sacado_numero_inscricao.raw

        // Checksum externo - prova independente da posição
        expect(isValidCpfCnpj(documento)).toBe(true)
      })
    })

    test('codigo_transmissao do detalhe deve bater com o do header (consistência estrutural)', () => {
      const header = extractLineFields(headerLine, santanderCnab400.header!)
      const codigoTransmissaoHeader = header.codigo_transmissao.raw

      expect(detailLines.length).toBeGreaterThan(0)

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, santanderCnab400.detail!)
        
        // Posições diferentes (18-37 no detalhe, 27-46 no header), mas mesmo valor
        expect(detail.codigo_transmissao.raw).toBe(codigoTransmissaoHeader)
      })
    })

    test('numero_controle deve conter numero_documento (consistência interna)', () => {
      expect(detailLines.length).toBe(128)

      let linhasComCorrespondencia = 0

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, santanderCnab400.detail!)
        const numeroControle = String(detail.numero_controle.value || '').trim()
        const numeroDocumento = String(detail.numero_documento.value || '').trim()

        if (numeroDocumento.length > 0) {
          expect(numeroControle).toContain(numeroDocumento)
          linhasComCorrespondencia++
        }
      })

      // Verificar que encontrou pelo menos algumas linhas com correspondência
      expect(linhasComCorrespondencia).toBeGreaterThan(0)
    })

    test('estado (UF) deve ser válido quando preenchido', () => {
      expect(detailLines.length).toBeGreaterThan(0)

      let linhasComUF = 0

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, santanderCnab400.detail!)
        const uf = String(detail.estado.value || '').trim()

        if (uf.length > 0) {
          // Fato externo ao schema - lista fechada das UFs brasileiras
          expect(UFS_VALIDAS).toContain(uf)
          linhasComUF++
        }
      })

      // Confirmar que encontrou UFs preenchidas
      expect(linhasComUF).toBeGreaterThan(0)
    })

    test('numero_sequencial deve ser a posição 1-based da linha no arquivo (todas as 130 linhas)', () => {
      expect(lines.length).toBe(130)

      lines.forEach((line, index) => {
        const tipoRegistro = line[0]
        let schema: any

        if (tipoRegistro === '0') {
          schema = santanderCnab400.header
        } else if (tipoRegistro === '1') {
          schema = santanderCnab400.detail
        } else if (tipoRegistro === '9') {
          schema = santanderCnab400.trailer
        }

        if (schema && 'numero_sequencial' in schema) {
          const parsed = extractLineFields(line, schema)
          const sequencialEsperado = index + 1 // Posição 1-based

          expect(parsed.numero_sequencial.value).toBe(sequencialEsperado)
        }
      })
    })

    test('totais do trailer devem bater exato com o arquivo', () => {
      const trailer = extractLineFields(trailerLine, santanderCnab400.trailer!)

      // qtd_documentos deve ser 128
      expect(trailer.qtd_documentos.value).toBe(128)

      // numero_sequencial do trailer deve ser 130 (última linha)
      expect(trailer.numero_sequencial.value).toBe(130)

      // Calcular soma dos valores
      const somaValores = detailLines.reduce((sum, line) => {
        const detail = extractLineFields(line, santanderCnab400.detail!)
        return sum + (Number(detail.valor_titulo.value) || 0)
      }, 0)

      // valor_total do trailer deve bater (com tolerância de arredondamento)
      const valorTotalTrailer = Number(trailer.valor_total.value) || 0
      expect(Math.abs(valorTotalTrailer - somaValores)).toBeLessThan(0.01)
    })
  })

  describe('Comparação contra snapshot gerado (metadata.json) - testes de regressão', () => {
    // Nota: metadata.json é gerado pelo mesmo parser sendo testado
    // Estes testes provam regressão, não correção absoluta

    let metadata: any

    beforeAll(() => {
      const metadataPath = path.join(
        __dirname,
        '../../__fixtures__/cnab400/SANTANDER_cnab_400_140.json',
      )
      
      if (!fs.existsSync(metadataPath)) {
        throw new Error(
          `Arquivo de metadata não encontrado: ${metadataPath}\n` +
          'Execute: npm run generate-metadata -- --bank=033 --format=CNAB400 --fixture=SANTANDER_cnab_400_140'
        )
      }

      const metadataContent = fs.readFileSync(metadataPath, 'utf8')
      metadata = JSON.parse(metadataContent)
    })

    test('vencimento bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, santanderCnab400.detail!)
      const record = metadata.records[0]

      expect(detail.vencimento.raw).toBe(record.dueDateRaw)
    })

    test('sacado_codigo_inscricao bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, santanderCnab400.detail!)
      const record = metadata.records[0]

      expect(detail.sacado_codigo_inscricao.raw).toBe(record.documentTypeCode)
    })

    test('sacado_numero_inscricao bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, santanderCnab400.detail!)
      const record = metadata.records[0]

      expect(detail.sacado_numero_inscricao.raw).toBe(record.documentRaw)
    })

    test('nome bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, santanderCnab400.detail!)
      const record = metadata.records[0]

      if (record.name) {
        expect(String(detail.nome.value).trim()).toBe(record.name)
      }
    })

    test('logradouro bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, santanderCnab400.detail!)
      const record = metadata.records[0]

      if (record.address) {
        expect(String(detail.logradouro.value).trim()).toBe(record.address)
      }
    })

    test('todos os campos principais de todos os títulos batem com metadata.json (regressão em loop)', () => {
      metadata.records.forEach((expected: any, index: number) => {
        const detail = extractLineFields(detailLines[index], santanderCnab400.detail!)

        // Verificar campos principais
        expect(detail.sacado_numero_inscricao.raw).toBe(expected.documentRaw)
        expect(String(detail.nome.value).trim()).toBe(expected.name)
        expect(Number(detail.valor_titulo.value)).toBeCloseTo(expected.amount, 2)
        expect(detail.vencimento.raw).toBe(expected.dueDateRaw)
      })
    })
  })
})
