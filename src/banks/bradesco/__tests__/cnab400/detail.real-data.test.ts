/**
 * Testes do Detalhe - Bradesco CNAB 400 (Dados Reais)
 *
 * Valida o PARSING contra arquivo fixture real (remessa-multipla.txt).
 *
 * Separado de detail.test.ts (defini��o do schema) para:
 * - Manter detail.test.ts r�pido e focado (n�o toca fixture)
 * - Organizar testes por for�a de evid�ncia (independente vs. snapshot vs. pontual)
 *
 * Tr�s n�veis de evid�ncia:
 * 1. Verifica��o independente: regex em texto livre ou checksum recomput�vel
 * 2. Compara��o contra snapshot: metadata.json (regress�o, n�o prova corre��o)
 * 3. Casos pontuais: valores espec�ficos sem evid�ncia independente
 */

import * as fs from 'fs'
import * as path from 'path'
import { bradescoCnab400 } from '@banks/bradesco/schemas/cnab400'
import { extractLineFields } from '@parser/field-extractor'
import { readFixture, calcularDvNossoNumero, parseReais } from './shared'

interface FixtureRecord {
  index: number
  name: string
  document: string
  documentRaw?: string
  documentType: string
  documentTypeCode?: string
  amount: number
  amountRaw?: string
  dueDate: string
  dueDateRaw?: string
  address?: string
  zipCode?: string
}

interface FixtureMetadata {
  records: FixtureRecord[]
  totals: {
    recordCount: number
    totalAmount: number
  }
}

function loadLocalMetadata(): FixtureMetadata {
  const jsonPath = path.join(__dirname, '../../__fixtures__/cnab400/remessa-multipla.json')
  const jsonContent = fs.readFileSync(jsonPath, 'utf8')
  return JSON.parse(jsonContent)
}

describe('Schema Bradesco CNAB 400 - Detalhe (Dados Reais)', () => {
  describe('Verifica��o independente (evid�ncia dentro do pr�prio arquivo real)', () => {
    /*
     * Estes testes extraem evid�ncia diretamente do arquivo fixture em tempo de execu��o,
     * seja via regex no texto livre (campo sacador_avalista ou o pr�prio campo testado),
     * seja via algoritmo recomput�vel (d�gito verificador m�dulo-11).
     *
     * Diferem dos testes que comparam contra metadata.json porque:
     * 1. metadata.json � gerado pelo mesmo parser sendo testado (n�o prova corre��o, s� regress�o)
     * 2. Estas evid�ncias s�o INDEPENDENTES: texto impresso para humanos ou checksum matem�tico
     * 3. Qualquer mudan�a no fixture � automaticamente refletida (n�o hardcoded)
     *
     * Contexto: https://github.com/usuario/tp-cnab-lib/discussions/ISSUE
     */
    let lines: string[]
    let detailLines: string[]

    beforeAll(() => {
      lines = readFixture('remessa-multipla.txt')
      detailLines = lines.filter(line => line[0] === '1')
    })

    test('multa_percentual deve bater com o percentual impresso no sacador_avalista', () => {
      // Padr�o: "MULTA (2,00%)" ou "MULTA (2,50%)" etc.
      const regex = /MULTA \((\d+,\d{2})%\)/
      const linhasComMulta = detailLines.filter(line => regex.test(line))

      expect(linhasComMulta.length).toBeGreaterThan(0) // Garante que o teste n�o fica vazio

      linhasComMulta.forEach(line => {
        const detail = extractLineFields(line, bradescoCnab400.detail!)
        const match = line.match(regex)

        if (match) {
          const percentualImpresso = parseReais(match[1]) // "2,00" ? 2.0
          const percentualCampo = detail.multa_percentual.value as number

          // Campo armazena o percentual j� com 2 casas decimais (ex: 2.0 para 2,00%)
          expect(percentualCampo).toBeCloseTo(percentualImpresso, 2)
          expect(detail.multa_percentual.error).toBeFalsy()
        }
      })
    })

    test('valor_titulo * multa_percentual deve ficar perto do valor impresso ap�s "MULTA (...%) DE R$"', () => {
      // Padr�o: "MULTA (2,00%) DE R$ R$ 173,13"
      const regex = /MULTA \((\d+,\d{2})%\) DE R\$ R\$ ([\d.,]+)/
      const linhasComValorMulta = detailLines.filter(line => regex.test(line))

      expect(linhasComValorMulta.length).toBeGreaterThan(0)

      linhasComValorMulta.forEach(line => {
        const detail = extractLineFields(line, bradescoCnab400.detail!)
        const match = line.match(regex)

        if (match) {
          const percentualImpresso = parseReais(match[1]) // "2,00" ? 2.0
          const valorMultaImpresso = parseReais(match[2]) // "173,13" ? 173.13
          const valorTitulo = detail.valor_titulo.value as number

          const valorMultaCalculado = (valorTitulo * percentualImpresso) / 100

          // Toler�ncia de 2 casas decimais (arredondamento)
          expect(valorMultaCalculado).toBeCloseTo(valorMultaImpresso, 2)
        }
      })
    })

    test('numero_documento deve conter o n�mero da NF impresso no sacador_avalista', () => {
      // Padr�o: "REF NF(S): 082760" ou "REF NF(S): 066183"
      const regex = /REF NF\(S\): (\d+)/
      const linhasComNF = detailLines.filter(line => regex.test(line))

      expect(linhasComNF.length).toBeGreaterThan(0)

      linhasComNF.forEach(line => {
        const detail = extractLineFields(line, bradescoCnab400.detail!)
        const match = line.match(regex)

        if (match) {
          const nfImpresso = match[1] // "082760"
          const numeroDocumento = (detail.numero_documento.value as string).trim()

          // Campo numero_documento cont�m o n�mero (ex: "NF82760-03" cont�m "82760")
          // Pode ter zero � esquerda removido no campo, mas deve aparecer
          expect(numeroDocumento).toContain(nfImpresso.replace(/^0+/, ''))
          expect(detail.numero_documento.error).toBeFalsy()
        }
      })
    })

    test('juros_mora deve bater com o valor impresso "COBRAR JUROS DE R$ ... POR DIA"', () => {
      // Padr�o: "COBRAR JUROS DE R$ 2,84 POR DIA DE ATRASO"
      const regex = /COBRAR JUROS DE R\$ ([\d,]+) POR DIA/
      const linhasComJuros = detailLines.filter(line => regex.test(line))

      expect(linhasComJuros.length).toBeGreaterThan(0)

      linhasComJuros.forEach(line => {
        const detail = extractLineFields(line, bradescoCnab400.detail!)
        const match = line.match(regex)

        if (match) {
          const jurosImpresso = parseReais(match[1]) // "2,84" ? 2.84
          const jurosCampo = detail.juros_mora.value as number

          expect(jurosCampo).toBeCloseTo(jurosImpresso, 2)
          expect(detail.juros_mora.error).toBeFalsy()
        }
      })
    })

    test('abatimento_valor e desconto_data_limite devem bater com "CONCEDER ABATIMENTO DE R$ ... PARA PAGAMENTO ATE DD/MM"', () => {
      // Padr�o: "CONCEDER ABATIMENTO DE R$ 72,88 PARA PAGAMENTO ATE 09/06/2026"
      const regex = /CONCEDER ABATIMENTO DE R\$ ([\d.,]+) PARA PAGAMENTO ATE (\d{2})\/(\d{2})/
      const linhasComAbatimento = detailLines.filter(line => regex.test(line))

      expect(linhasComAbatimento.length).toBeGreaterThan(0)

      linhasComAbatimento.forEach(line => {
        const detail = extractLineFields(line, bradescoCnab400.detail!)
        const match = line.match(regex)

        if (match) {
          const abatimentoImpresso = parseReais(match[1]) // "72,88" ? 72.88
          const diaImpresso = match[2] // "09"
          const mesImpresso = match[3] // "06"

          const abatimentoCampo = detail.abatimento_valor.value as number
          const dataLimiteRaw = detail.desconto_data_limite.raw // "DDMMAA"

          expect(abatimentoCampo).toBeCloseTo(abatimentoImpresso, 2)

          if (dataLimiteRaw) {
            // Compara apenas DD/MM (ano pode estar truncado no texto)
            expect(dataLimiteRaw.substring(0, 2)).toBe(diaImpresso)
            expect(dataLimiteRaw.substring(2, 4)).toBe(mesImpresso)
          }

          expect(detail.abatimento_valor.error).toBeFalsy()
          expect(detail.desconto_data_limite.error).toBeFalsy()
        }
      })
    })

    test('nosso_numero_dv deve bater com o c�lculo m�dulo-11 (carteira + nosso_numero) em todas as 37 linhas', () => {
      expect(detailLines.length).toBe(37) // Fixture tem 37 detalhes

      detailLines.forEach(line => {
        const detail = extractLineFields(line, bradescoCnab400.detail!)

        const carteiraRaw = detail.carteira_codigo.raw // 3 d�gitos, ex: "009"
        const nossoNumeroRaw = detail.nosso_numero.raw // 11 d�gitos, ex: "00069062637"
        const dvRaw = detail.nosso_numero_dv.raw // 1 caractere, ex: "0" ou "P"

        const dvCalculado = calcularDvNossoNumero(carteiraRaw + nossoNumeroRaw)

        expect(dvRaw).toBe(dvCalculado)
        expect(detail.nosso_numero_dv.error).toBeFalsy()

        // De quebra, confirma que carteira_codigo e nosso_numero tamb�m est�o corretos
        // (se qualquer uma dessas posi��es estivesse errada, o DV n�o bateria)
        expect(detail.carteira_codigo.error).toBeFalsy()
        expect(detail.nosso_numero.error).toBeFalsy()
      })
    })

    test('numero_sequencial deve ser a posi��o 1-based da linha no arquivo (para todas as linhas)', () => {
      lines.forEach((line, index) => {
        const tipoRegistro = line[0]
        let schema

        if (tipoRegistro === '0') {
          schema = bradescoCnab400.header
        } else if (tipoRegistro === '1') {
          schema = bradescoCnab400.detail
        } else if (tipoRegistro === '9') {
          schema = bradescoCnab400.trailer
        }

        if (schema && 'numero_sequencial' in schema) {
          const parsed = extractLineFields(line, schema)
          const sequencialEsperado = index + 1 // Posi��o 1-based

          expect(parsed.numero_sequencial.value).toBe(sequencialEsperado)

          expect(parsed.numero_sequencial.error).toBeFalsy()
        }
      })
    })
  })

  describe('Compara��o contra snapshot gerado (metadata.json) - testes de regress�o', () => {
    /*
     * IMPORTANTE: Estes testes comparam valores extra�dos contra metadata.json,
     * que � gerado pelo MESMO parser (extractLineFields + schema) sendo testado.
     *
     * Isso N�O prova que as posi��es est�o corretas � apenas que o comportamento
     * n�o mudou desde a gera��o do metadata (snapshot/regress�o).
     *
     * Prova de corre��o est� no describe "Verifica��o independente" acima,
     * que usa evid�ncia do arquivo (regex em texto livre ou checksum recomput�vel).
     *
     * Estes testes ainda s�o �teis para:
     * 1. Cobrir 100% das linhas do arquivo (37 detalhes)
     * 2. Detectar mudan�as acidentais de comportamento (regress�o)
     * 3. Validar campos sem evid�ncia independente dispon�vel
     */
    let lines: string[]
    let metadata: FixtureMetadata

    beforeAll(() => {
      lines = readFixture('remessa-multipla.txt')
      metadata = loadLocalMetadata()
    })

    test('vencimento bate com o snapshot gerado (metadata.json) � regress�o, n�o confirma a posi��o em si', () => {
      const record = metadata.records[0]
      const detailLine = lines.find(line => line[0] === '1')

      if (detailLine) {
        const detail = extractLineFields(detailLine, bradescoCnab400.detail!)

        expect(detail.vencimento.raw).toBe(record.dueDateRaw)
        expect(detail.vencimento.error).toBeFalsy()
      }
    })

    test('sacado_codigo_inscricao bate com metadata.json (regress�o)', () => {
      const record = metadata.records[0]
      const detailLine = lines.find(line => line[0] === '1')

      if (detailLine) {
        const detail = extractLineFields(detailLine, bradescoCnab400.detail!)

        expect(detail.sacado_codigo_inscricao.raw).toBe(record.documentTypeCode)
        expect(detail.sacado_codigo_inscricao.error).toBeFalsy()
      }
    })

    test('sacado_numero_inscricao bate com metadata.json (regress�o)', () => {
      const record = metadata.records[0]
      const detailLine = lines.find(line => line[0] === '1')

      if (detailLine) {
        const detail = extractLineFields(detailLine, bradescoCnab400.detail!)

        expect(detail.sacado_numero_inscricao.raw).toBe(record.documentRaw)
        expect(detail.sacado_numero_inscricao.error).toBeFalsy()
      }
    })

    test('nome bate com metadata.json (regress�o)', () => {
      const record = metadata.records[0]
      const detailLine = lines.find(line => line[0] === '1')

      if (detailLine) {
        const detail = extractLineFields(detailLine, bradescoCnab400.detail!)

        if (record.name) {
          expect(detail.nome.value).toMatch(new RegExp(record.name))
        }
        expect(detail.nome.error).toBeFalsy()
      }
    })

    test('logradouro bate com metadata.json (regress�o)', () => {
      const record = metadata.records[0]
      const detailLine = lines.find(line => line[0] === '1')

      if (detailLine) {
        const detail = extractLineFields(detailLine, bradescoCnab400.detail!)

        if (record.address) {
          expect(detail.logradouro.value).toMatch(new RegExp(record.address))
        }
        expect(detail.logradouro.error).toBeFalsy()
      }
    })

    test('todos os campos principais de todos os t�tulos batem com metadata.json (regress�o em loop)', () => {
      const detailLines = lines.filter(line => line[0] === '1')

      expect(detailLines.length).toBe(metadata.records.length)

      metadata.records.forEach((expected: FixtureRecord, index: number) => {
        const detail = extractLineFields(detailLines[index], bradescoCnab400.detail!)

        // Verificar que campos principais foram extra�dos sem erro
        expect(detail.nome.error).toBeFalsy()
        expect(detail.valor_titulo.error).toBeFalsy()
        expect(detail.sacado_numero_inscricao.error).toBeFalsy()
        expect(detail.vencimento.error).toBeFalsy()

        // Verificar valores extra�dos batem com o snapshot
        expect(detail.nome.value).toBeTruthy()
        expect(detail.valor_titulo.value).toBe(expected.amount)
        expect(detail.sacado_numero_inscricao.raw).toBe(expected.documentRaw)
        expect(detail.vencimento.raw).toBe(expected.dueDateRaw)
      })
    })
  })

  describe('Parsing de arquivo real - casos pontuais (n�o cobertos por verifica��o independente)', () => {
    let lines: string[]

    beforeAll(() => {
      lines = readFixture('remessa-multipla.txt')
    })

    test('deve extrair tipo de registro "1"', () => {
      const detailLine = lines.find(line => line[0] === '1')

      if (detailLine) {
        const detail = extractLineFields(detailLine, bradescoCnab400.detail!)

        expect(detail.tipo_registro.raw).toBe('1')
        expect(detail.tipo_registro.value).toBe(1)
        expect(detail.tipo_registro.error).toBeFalsy()
      }
    })

    test('deve extrair c�digo do banco (d�bito autom�tico) "000"', () => {
      const detailLine = lines.find(line => line[0] === '1')

      if (detailLine) {
        const detail = extractLineFields(detailLine, bradescoCnab400.detail!)

        expect(detail.codigo_banco.raw).toBe('000')
        expect(detail.codigo_banco.value).toBe(0)
        expect(detail.codigo_banco.error).toBeFalsy()
      }
    })

    test('deve extrair c�digo de ocorr�ncia "01" (n�o deve conter letras)', () => {
      const detailLine = lines.find(line => line[0] === '1')

      if (detailLine) {
        const detail = extractLineFields(detailLine, bradescoCnab400.detail!)

        expect(detail.codigo_ocorrencia.raw).toBe('01')
        expect(detail.codigo_ocorrencia.error).toBeFalsy()
      }
    })
  })
})
