/**
 * Testes do Schema Banco do Brasil CNAB 400 - Detalhe (Dados Reais)
 *
 * Duas camadas de evidência:
 * 1. Verificação independente (checksum, consistências estruturais)
 * 2. Regressão via metadata.json
 *
 * O pipeline público de ponta a ponta (`openCnab`) é coberto em
 * `BANCOBRASIL_cnab_400.e2e.test.ts` — não duplicado aqui.
 *
 * Fixture: BANCOBRASIL_cnab_400.REM (228 linhas: 1 header + 113 tipo 7 + 113 tipo 5/99 + 1 trailer)
 *
 * PARTICULARIDADE DO BB: tipo_registro = '7' (não '1' como padrão FEBRABAN)
 */

import { bancoDoBrasilCnab400 } from '@banks/bancoDoBrasil/schemas/cnab400'
import { extractLineFields } from '@parser/field-extractor'
import { isValidCpfCnpj } from '@utils/string-utils'
import { TYPE5_FINE } from '@banks/bancoDoBrasil/schemas/cnab400/registros-opcionais/type5-optional-services/type5-fine'
import { UFS_VALIDAS } from '../../../../tests/helpers/ufs-brasileiras'
import * as fs from 'fs'
import * as path from 'path'

function readFixture(filename: string): string[] {
  const fixturePath = path.join(__dirname, '../__fixtures__', filename)
  const content = fs.readFileSync(fixturePath, 'latin1')
  return content.split(/\r?\n/).filter((line) => line.trim().length > 0)
}

describe('Schema Banco do Brasil CNAB 400 - Detalhe (Dados Reais)', () => {
  const lines = readFixture('BANCOBRASIL_cnab_400.REM')
  const headerLine = lines[0]
  const detailLines = lines.filter((line) => line[0] === '7') // BB usa tipo '7', não '1'
  const tipo5Lines = lines.filter((line) => line[0] === '5') // Registros de multa
  const trailerLine = lines[lines.length - 1]

  describe('Verificação independente (evidência dentro do próprio arquivo real)', () => {
    test('deve ter exatamente 113 registros tipo 7 (detalhe)', () => {
      expect(detailLines.length).toBe(113)
    })

    test('deve ter exatamente 113 registros tipo 5/99 (multa)', () => {
      expect(tipo5Lines.length).toBe(113)
    })

    test('CPF/CNPJ do sacado deve ser válido em todas as 113 linhas tipo 7 (checksum)', () => {
      expect(detailLines.length).toBe(113)

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)
        const documento = detail.sacado_numero_inscricao.raw

        // Checksum externo - prova independente da posição
        expect(isValidCpfCnpj(documento)).toBe(true)
      })
    })

    test('agência do detalhe deve bater com a do header (consistência estrutural)', () => {
      const header = extractLineFields(headerLine, bancoDoBrasilCnab400.header!)
      const agenciaHeader = header.agencia.raw

      expect(detailLines.length).toBeGreaterThan(0)

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)

        // Agência deve ser a mesma em todos os detalhes e no header
        expect(detail.agencia.raw).toBe(agenciaHeader)
      })
    })

    test('conta do detalhe deve bater com a do header (consistência estrutural)', () => {
      const header = extractLineFields(headerLine, bancoDoBrasilCnab400.header!)
      const contaHeader = header.conta.raw

      expect(detailLines.length).toBeGreaterThan(0)

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)

        // Conta deve ser a mesma em todos os detalhes e no header
        expect(detail.conta.raw).toBe(contaHeader)
      })
    })

    test('convênio do detalhe bate com o convenio_lider do header nesta fixture (não é regra geral do layout)', () => {
      // Atenção: convenio_lider (header) e convenio (detalhe) são campos
      // semanticamente diferentes — convenio_lider serve para agrupar o
      // retorno de vários convênios "líderados" (NOTA 04 do manual,
      // ver comparativo-cnab400-bancodobrasil.md). Eles só coincidem aqui
      // porque este cedente usa um único convênio; não é uma invariante
      // estrutural do BB, é um fato desta fixture específica. Se um dia
      // entrar uma fixture com agrupamento real de convênios, é esperado
      // que este teste passe a falhar e precise ser revisado.
      const header = extractLineFields(headerLine, bancoDoBrasilCnab400.header!)
      const convenioHeader = header.convenio_lider.raw

      expect(detailLines.length).toBeGreaterThan(0)

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)
        expect(detail.convenio.raw).toBe(convenioHeader)
      })
    })

    test('codigo_banco_cobrador deve ser 001 (Banco do Brasil) em todas as linhas tipo 7', () => {
      expect(detailLines.length).toBe(113)

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)

        expect(detail.codigo_banco_cobrador.raw).toBe('001')
      })
    })

    test('estado (UF) deve ser válido quando preenchido', () => {
      expect(detailLines.length).toBeGreaterThan(0)

      let linhasComUF = 0

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)
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

    test('numero_sequencial deve ser a posição 1-based da linha no arquivo (todas as 228 linhas)', () => {
      expect(lines.length).toBe(228)

      lines.forEach((line, index) => {
        const tipoRegistro = line[0]
        let schema: any

        if (tipoRegistro === '0') {
          schema = bancoDoBrasilCnab400.header
        } else if (tipoRegistro === '7') {
          schema = bancoDoBrasilCnab400.detail
        } else if (tipoRegistro === '9') {
          schema = bancoDoBrasilCnab400.trailer
        } else if (tipoRegistro === '5') {
          // Tipo 5 (multa) não faz parte do BankSchema principal (é registro
          // opcional), então usamos o schema TYPE5_FINE diretamente.
          schema = TYPE5_FINE
        }

        if (schema && 'numero_sequencial' in schema) {
          const parsed = extractLineFields(line, schema)
          const sequencialEsperado = index + 1 // Posição 1-based

          expect(parsed.numero_sequencial.value).toBe(sequencialEsperado)
        }
      })
    })

    test('numero_sequencial do trailer deve ser exatamente 228 (última linha)', () => {
      const trailer = extractLineFields(trailerLine, bancoDoBrasilCnab400.trailer!)

      // numero_sequencial do trailer deve ser 228 (última linha)
      expect(trailer.numero_sequencial.value).toBe(228)
      expect(trailer.numero_sequencial.value).toBe(lines.length)
    })

    test('deve haver alternância tipo 7 → tipo 5 → tipo 7 → tipo 5...', () => {
      // Após o header (linha 0), deve haver alternância detalhe/multa até o trailer
      for (let i = 1; i < lines.length - 1; i += 2) {
        const linhaDetalhe = lines[i]
        const linhaMulta = lines[i + 1]

        // Verifica se não é a última linha (trailer)
        if (i + 1 < lines.length - 1) {
          expect(linhaDetalhe[0]).toBe('7') // Detalhe
          expect(linhaMulta[0]).toBe('5') // Multa
          expect(linhaMulta.substring(1, 3)).toBe('99') // Serviço 99 (multa)
        }
      }
    })

    test('todos os registros tipo 5 devem ter tipo_servico = "99" (multa)', () => {
      tipo5Lines.forEach((line) => {
        // Posições 1-1: tipo_registro = '5'
        expect(line[0]).toBe('5')
        // Posições 2-3: tipo_servico = '99'
        expect(line.substring(1, 3)).toBe('99')
      })
    })

    test('todos os valores devem ser maiores que zero', () => {
      detailLines.forEach((line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)
        expect(detail.valor_titulo.value).toBeGreaterThan(0)
      })
    })

    test('soma dos valores deve ser consistente', () => {
      const somaValores = detailLines.reduce((sum, line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)
        return sum + (Number(detail.valor_titulo.value) || 0)
      }, 0)

      // Deve ter um valor significativo (mais de R$ 100.000)
      expect(somaValores).toBeGreaterThan(100000)
    })
  })

  describe('Comparação contra snapshot gerado (metadata.json) - testes de regressão', () => {
    // Nota: metadata.json é gerado pelo mesmo parser sendo testado
    // Estes testes provam regressão, não correção absoluta

    let metadata: any

    beforeAll(() => {
      const metadataPath = path.join(__dirname, '../__fixtures__/BANCOBRASIL_cnab_400.json')

      if (!fs.existsSync(metadataPath)) {
        throw new Error(
          `Arquivo de metadata não encontrado: ${metadataPath}\n` +
          'Execute: npm run generate-metadata -- --bank=001 --format=CNAB400 --fixture=BANCOBRASIL_cnab_400'
        )
      }

      const metadataContent = fs.readFileSync(metadataPath, 'utf8')
      metadata = JSON.parse(metadataContent)
    })

    test('metadata deve ter 113 registros', () => {
      expect(metadata.records.length).toBe(113)
    })

    test('vencimento bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, bancoDoBrasilCnab400.detail!)
      const record = metadata.records[0]

      expect(detail.vencimento.raw).toBe(record.dueDateRaw)
    })

    test('sacado_codigo_inscricao bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, bancoDoBrasilCnab400.detail!)
      const record = metadata.records[0]

      expect(detail.sacado_codigo_inscricao.raw).toBe(record.documentTypeCode)
    })

    test('sacado_numero_inscricao bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, bancoDoBrasilCnab400.detail!)
      const record = metadata.records[0]

      expect(detail.sacado_numero_inscricao.raw).toBe(record.documentRaw)
    })

    test('nome bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, bancoDoBrasilCnab400.detail!)
      const record = metadata.records[0]

      if (record.name) {
        expect(String(detail.nome.value).trim()).toBe(record.name)
      }
    })

    test('logradouro bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, bancoDoBrasilCnab400.detail!)
      const record = metadata.records[0]

      if (record.address) {
        expect(String(detail.logradouro.value).trim()).toBe(record.address)
      }
    })

    test('bairro deve estar populado em todas as 113 linhas (verificação independente)', () => {
      expect(detailLines.length).toBe(113)

      detailLines.forEach((line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)
        const bairro = String(detail.bairro.value || '').trim()

        // Todas as 113 linhas têm bairro preenchido nesta fixture
        expect(bairro.length).toBeGreaterThan(0)
      })
    })

    test('cidade bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, bancoDoBrasilCnab400.detail!)
      const record = metadata.records[0]

      if (record.city) {
        expect(String(detail.cidade.value).trim()).toBe(record.city)
      }
    })

    test('estado bate com metadata.json (regressão)', () => {
      const primeiroDetalhe = detailLines[0]
      const detail = extractLineFields(primeiroDetalhe, bancoDoBrasilCnab400.detail!)
      const record = metadata.records[0]

      if (record.state) {
        expect(String(detail.estado.value).trim()).toBe(record.state)
      }
    })

    test('todos os campos principais de todos os títulos batem com metadata.json (regressão em loop)', () => {
      metadata.records.forEach((expected: any, index: number) => {
        const detail = extractLineFields(detailLines[index], bancoDoBrasilCnab400.detail!)

        // Verificar campos principais
        expect(detail.sacado_numero_inscricao.raw).toBe(expected.documentRaw)
        expect(String(detail.nome.value).trim()).toBe(expected.name)
        expect(Number(detail.valor_titulo.value)).toBeCloseTo(expected.amount, 2)
        expect(detail.vencimento.raw).toBe(expected.dueDateRaw)

        // Campos específicos do BB
        if (expected.city) {
          expect(String(detail.cidade.value).trim()).toBe(expected.city)
        }
        if (expected.state) {
          expect(String(detail.estado.value).trim()).toBe(expected.state)
        }
      })
    })
  })

  describe('Particularidades do Banco do Brasil', () => {
    test('tipo_registro deve ser "7" em todos os detalhes (não "1")', () => {
      detailLines.forEach((line) => {
        expect(line[0]).toBe('7')
      })
    })

    test('nome do sacado deve ter exatamente 37 caracteres no arquivo (não 40)', () => {
      // Posições 235-271 = 37 caracteres
      detailLines.forEach((line) => {
        const nomeCampo = line.substring(234, 271) // JavaScript é 0-indexed
        expect(nomeCampo.length).toBe(37)
      })
    })

    test('nosso número deve ter 17 posições (mais longo que outros bancos)', () => {
      detailLines.forEach((line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)
        expect(detail.nosso_numero.raw.length).toBe(17)
      })
    })

    test('todos os detalhes devem ter comando válido', () => {
      detailLines.forEach((line) => {
        const detail = extractLineFields(line, bancoDoBrasilCnab400.detail!)
        const comando = detail.comando.raw

        // Só temos evidência real (nesta fixture) de 01 (entrada), 02 (baixa),
        // 04 (abatimento) e 06 (alteração de vencimento) — não validamos contra
        // uma lista fechada de códigos porque não temos essa lista confirmada
        // pelo manual oficial, só o formato de 2 dígitos.
        expect(comando).toBeTruthy()
        expect(comando.length).toBe(2)
        expect(comando).toMatch(/^\d{2}$/)
      })
    })

    test('estrutura do arquivo deve ser: header + (detalhe + multa) * 113 + trailer', () => {
      expect(lines.length).toBe(228) // 1 + (1+1)*113 + 1
      expect(lines[0][0]).toBe('0') // header
      expect(lines[lines.length - 1][0]).toBe('9') // trailer

      // Contar registros de cada tipo
      const header = lines.filter((l) => l[0] === '0').length
      const detalhes = lines.filter((l) => l[0] === '7').length
      const multas = lines.filter((l) => l[0] === '5').length
      const trailer = lines.filter((l) => l[0] === '9').length

      expect(header).toBe(1)
      expect(detalhes).toBe(113)
      expect(multas).toBe(113)
      expect(trailer).toBe(1)
    })
  })
})
