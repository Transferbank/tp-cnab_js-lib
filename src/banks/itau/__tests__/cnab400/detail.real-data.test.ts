/**
 * Testes do Schema Itaú CNAB 400 - Detalhe (Dados Reais)
 *
 * Duas camadas de evidência:
 * 1. Verificação independente (checksum, consistências estruturais)
 * 2. Regressão via metadata.json
 *
 * O pipeline público de ponta a ponta (`openCnab`) é coberto em
 * `ITAU_cnab_400.e2e.test.ts` — não duplicado aqui.
 *
 * Fixture: ITAU_cnab_400.REM (640 linhas: 1 header + 638 detalhes (319 tipo 1 + 319 tipo 2) + 1 trailer)
 */

import { itauCnab400 } from '@banks/itau/schemas/cnab400'
import { TYPE2_FINE } from '@banks/itau/schemas/cnab400/registros-opcionais/type2-fine/type2-fine'
import { extractLineFields } from '@parser/field-extractor'
import { readFixture, isValidCpfCnpj } from './shared'
import { UFS_VALIDAS } from '@/__tests__/helpers/ufs-brasileiras'
import type { FixtureMetadata } from '@tp-types/testing'
import * as fs from 'fs'
import * as path from 'path'

describe('Schema Itaú CNAB 400 - Detalhe (Dados Reais)', () => {
  const lines = readFixture('ITAU_cnab_400.REM')
  const detailType1Lines = lines.filter((line) => line[0] === '1')
  const detailType2Lines = lines.filter((line) => line[0] === '2')
  const trailerLine = lines[lines.length - 1]

  describe('Verificação independente (evidência dentro do próprio arquivo real)', () => {
    test('CPF/CNPJ do sacado deve ser válido em todas as 319 linhas tipo 1 (checksum)', () => {
      expect(detailType1Lines.length).toBe(319)

      detailType1Lines.forEach((line) => {
        const detail = extractLineFields(line, itauCnab400.detail!)
        const documento = detail.sacado_numero_inscricao.raw

        // Checksum externo - prova independente da posição
        expect(isValidCpfCnpj(documento)).toBe(true)
      })
    })

    test('sufixo de numero_controle deve bater com sufixo de numero_documento em todas as 319 linhas', () => {
      expect(detailType1Lines.length).toBe(319)

      detailType1Lines.forEach((line) => {
        const detail = extractLineFields(line, itauCnab400.detail!)
        const numeroDocumento = String(detail.numero_documento.value || '').trim()
        const numeroControle = String(detail.numero_controle.value || '').trim()

        const sufixoDocumento = numeroDocumento.split('-').pop()
        const sufixoControle = numeroControle.split('.').pop()

        expect(sufixoControle).toBe(sufixoDocumento)
      })
    })

    test('agencia, conta e dac de cada linha tipo 1 devem bater com os do header', () => {
      expect(detailType1Lines.length).toBeGreaterThan(0)

      const headerLine = lines[0]
      const header = extractLineFields(headerLine, itauCnab400.header!)

      detailType1Lines.forEach((line) => {
        const detail = extractLineFields(line, itauCnab400.detail!)

        expect(detail.agencia.raw).toBe(header.agencia.raw)
        expect(detail.conta.raw).toBe(header.conta.raw)
        expect(detail.dac.raw).toBe(header.dac.raw)
      })
    })

    test('estado (UF) deve ser válido quando preenchido', () => {
      expect(detailType1Lines.length).toBeGreaterThan(0)

      let linhasComUF = 0

      detailType1Lines.forEach((line) => {
        const detail = extractLineFields(line, itauCnab400.detail!)
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

    test('numero_sequencial deve ser a posição 1-based da linha no arquivo (todas as 640 linhas)', () => {
      expect(lines.length).toBe(640)

      lines.forEach((line, index) => {
        const tipoRegistro = line[0]
        let schema: any

        if (tipoRegistro === '0') {
          schema = itauCnab400.header
        } else if (tipoRegistro === '1') {
          schema = itauCnab400.detail
        } else if (tipoRegistro === '2') {
          schema = TYPE2_FINE
        } else if (tipoRegistro === '9') {
          schema = itauCnab400.trailer
        }

        if (schema && 'numero_sequencial' in schema) {
          const parsed = extractLineFields(line, schema)
          const sequencialEsperado = index + 1 // Posição 1-based

          expect(parsed.numero_sequencial.value).toBe(sequencialEsperado)
        }
      })
    })

    test('codigo_banco_cobrador deve ser 341 (Itaú) em todas as linhas tipo 1', () => {
      expect(detailType1Lines.length).toBe(319)

      detailType1Lines.forEach((line) => {
        const detail = extractLineFields(line, itauCnab400.detail!)

        expect(detail.codigo_banco_cobrador.raw).toBe('341')
      })
    })

    test('agencia_cobradora deve ser 00000 em todas as linhas tipo 1', () => {
      expect(detailType1Lines.length).toBe(319)

      detailType1Lines.forEach((line) => {
        const detail = extractLineFields(line, itauCnab400.detail!)

        // Campo padrão para Itaú (não usado)
        expect(detail.agencia_cobradora.raw).toBe('00000')
      })
    })

    test('totais calculados devem bater exato com o arquivo', () => {
      const trailer = extractLineFields(trailerLine, itauCnab400.trailer!)

      // numero_sequencial do trailer deve ser 640 (última linha)
      expect(trailer.numero_sequencial.value).toBe(640)

      // Calcular soma dos valores dos 319 títulos (tipo 1)
      const somaValores = detailType1Lines.reduce((sum, line) => {
        const detail = extractLineFields(line, itauCnab400.detail!)
        return sum + (Number(detail.valor_titulo.value) || 0)
      }, 0)

      // Valor conhecido do fixture: R$ 1.237.856,15
      // Nota: O trailer do Itaú CNAB 400 não contém campo de valor total,
      // mas podemos verificar a soma calculada contra o valor esperado
      expect(somaValores).toBeCloseTo(1237856.15, 2)
    })

    test('deve haver exatamente 319 registros tipo 2 (um para cada tipo 1)', () => {
      expect(detailType2Lines.length).toBe(319)
      expect(detailType1Lines.length).toBe(319)
    })

    test('registros tipo 2 devem ter tipo_registro = "2"', () => {
      expect(detailType2Lines.length).toBe(319)

      detailType2Lines.forEach((line) => {
        const tipo2 = extractLineFields(line, TYPE2_FINE)

        expect(tipo2.tipo_registro.raw).toBe('2')
        expect(tipo2.tipo_registro.value).toBe(2)
      })
    })
  })

  describe('Comparação contra snapshot gerado (metadata.json) - testes de regressão', () => {
    // Nota: metadata.json é gerado pelo mesmo parser sendo testado
    // Estes testes provam regressão, não correção absoluta

    let metadata: FixtureMetadata

    beforeAll(() => {
      const metadataPath = path.join(__dirname, '../../__fixtures__/cnab400/ITAU_cnab_400.json')

      if (!fs.existsSync(metadataPath)) {
        throw new Error(
          `Arquivo de metadata não encontrado: ${metadataPath}\n` +
            'Execute o script parse-itau-fixture.ts para gerar o arquivo',
        )
      }

      const metadataContent = fs.readFileSync(metadataPath, 'utf8')
      metadata = JSON.parse(metadataContent) as FixtureMetadata
    })

    test('metadata deve ter 319 registros', () => {
      expect(metadata.records).toBeDefined()
      expect(metadata.records.length).toBe(319)
    })

    test('vencimento bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailType1Lines[0]
      const detail = extractLineFields(primeiroDetalhe, itauCnab400.detail!)
      const record = metadata.records[0]

      expect(detail.vencimento.raw).toBe(record.dueDateRaw)
    })

    test('sacado_codigo_inscricao bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailType1Lines[0]
      const detail = extractLineFields(primeiroDetalhe, itauCnab400.detail!)
      const record = metadata.records[0]

      expect(detail.sacado_codigo_inscricao.raw).toBe(record.documentTypeCode)
    })

    test('sacado_numero_inscricao bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailType1Lines[0]
      const detail = extractLineFields(primeiroDetalhe, itauCnab400.detail!)
      const record = metadata.records[0]

      expect(detail.sacado_numero_inscricao.raw).toBe(record.documentRaw)
    })

    test('nome bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailType1Lines[0]
      const detail = extractLineFields(primeiroDetalhe, itauCnab400.detail!)
      const record = metadata.records[0]

      if (record.name) {
        expect(String(detail.nome.value).trim()).toBe(record.name)
      }
    })

    test('logradouro bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailType1Lines[0]
      const detail = extractLineFields(primeiroDetalhe, itauCnab400.detail!)
      const record = metadata.records[0]

      if (record.address) {
        expect(String(detail.logradouro.value).trim()).toBe(record.address)
      }
    })

    test('todos os campos principais de todos os títulos batem com metadata.json (regressão em loop)', () => {
      expect(metadata.records.length).toBe(319)
      expect(detailType1Lines.length).toBe(319)

      metadata.records.forEach((expected, index) => {
        const detail = extractLineFields(detailType1Lines[index], itauCnab400.detail!)

        // Verificar campos principais
        expect(detail.sacado_numero_inscricao.raw).toBe(expected.documentRaw)
        expect(String(detail.nome.value).trim()).toBe(expected.name)
        expect(Number(detail.valor_titulo.value)).toBeCloseTo(expected.amount, 2)
        expect(detail.vencimento.raw).toBe(expected.dueDateRaw)
      })
    })
  })
})

