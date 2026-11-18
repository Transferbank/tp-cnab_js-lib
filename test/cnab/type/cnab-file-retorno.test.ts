import { describe, it, expect } from '@jest/globals'
import * as path from 'path'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabOcorrencia } from '@cnab/type/cnab-ocorrencia'
import { getOcorrencia, getOcorrenciaDescription } from '@cnab/bank/cnab-ocorrencia-tables'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'

describe('cnab-file retorno', (): void => {
  it.each([
    ['bradesco/cnab240/retorno/bradesco_cnab_240.txt', 3, '06', 'Liquidação'],
    ['bradesco/cnab400/retorno/bradesco_cnab_400.RET', 37, '06', 'Liquidação Normal'],
    ['caixa/cnab240/retorno/caixa_cnab_240.txt', 3, '06', 'Liquidação'],
    ['caixa/cnab400/retorno/caixa_cnab_400.RET', 10, '21', 'Liquidação'],
    ['itau/cnab240/retorno/itau_cnab_240.txt', 4, '06', 'Liquidação Normal'],
    ['itau/cnab400/retorno/ITAU_cnab_400.RET', 319, '06', 'Liquidação Normal'],
    ['santander/cnab240/retorno/santander_cnab_240.txt', 3, '06', 'Liquidação'],
    ['santander/cnab400/retorno/santander_cnab_400.RET', 128, '06', 'Liquidação do Boleto Efetivada'],
    ['sicredi/cnab240/retorno/sicredi_cnab_240.txt', 3, '06', 'Liquidação'],
    ['sicredi/cnab400/retorno/sicredi_cnab_400.RET', 3, '06', 'Liquidação normal'],
    ['sicoob/cnab240/retorno/sicoob_cnab_240.txt', 3, '06', 'Liquidação'],
    ['sicoob/cnab400/retorno/sicoob_cnab_400.RET', 10, '06', 'Liquidação Normal'],
    ['banco-do-brasil/cnab240/retorno/banco_do_brasil_cnab_240.txt', 3, '06', 'Liquidação'],
    ['banco-do-brasil/cnab400/retorno/banco_do_brasil_cnab_400.RET', 113, '06', 'Liquidação Normal']
  ])(
    'given retorno file %s when reading then translates the ocorrência of each boleto',
    (examplePath: string, expectedEntradas: number, liquidationCode: string, expectedLiquidationDescription: string): void => {
      // Given
      const cnabFile = CnabFile.fromLines(readExampleLines(path.join(resPath(), examplePath)))

      // When
      const boletos = cnabFile.read().boletos
      const countByOcorrencia: Partial<Record<CnabOcorrencia, number>> = {}
      for (const boleto of boletos) {
        const ocorrencia = getOcorrencia(cnabFile.bank, cnabFile.format, boleto.fields.codigo_de_ocorrencia as string)
        countByOcorrencia[ocorrencia] = (countByOcorrencia[ocorrencia] ?? 0) + 1
      }

      // Then
      expect(countByOcorrencia).toEqual({
        [CnabOcorrencia.ENTRADA_CONFIRMADA]: expectedEntradas,
        [CnabOcorrencia.LIQUIDACAO]: 2,
        [CnabOcorrencia.BAIXA]: 1
      })
      expect(getOcorrenciaDescription(cnabFile.bank, cnabFile.format, liquidationCode)).toBe(expectedLiquidationDescription)
    }
  )

  it.each([
    ['bradesco/cnab240/retorno/bradesco_cnab_240.txt', [100, 255, null]],
    ['bradesco/cnab400/retorno/bradesco_cnab_400.RET', [21421.98, 2346.27, null]],
    ['caixa/cnab240/retorno/caixa_cnab_240.txt', [1234.5, 2525, null]],
    ['caixa/cnab400/retorno/caixa_cnab_400.RET', [150, 232.81, null]],
    ['itau/cnab400/retorno/ITAU_cnab_400.RET', [6762.31, 6764.56, null]],
    ['santander/cnab240/retorno/santander_cnab_240.txt', [1234.5, 2525, null]],
    ['santander/cnab400/retorno/santander_cnab_400.RET', [368.11, 371.8, null]],
    ['sicredi/cnab240/retorno/sicredi_cnab_240.txt', [1234.5, 2525, null]],
    ['sicredi/cnab400/retorno/sicredi_cnab_400.RET', [375.48, 1275, null]],
    ['sicoob/cnab240/retorno/sicoob_cnab_240.txt', [10000, 2525, null]],
    ['sicoob/cnab400/retorno/sicoob_cnab_400.RET', [150, 232.81, null]],
    ['banco-do-brasil/cnab240/retorno/banco_do_brasil_cnab_240.txt', [1234.5, 252.5, null]],
    ['banco-do-brasil/cnab400/retorno/banco_do_brasil_cnab_400.RET', [2309.66, 8825.14, null]]
  ])(
    'given retorno file %s when reading then returns the valor pago of the liquidações and none for the baixa',
    (examplePath: string, expectedValoresPagos: Array<number | null>): void => {
      // Given
      const cnabFile = CnabFile.fromLines(readExampleLines(path.join(resPath(), examplePath)))

      // When
      const boletos = cnabFile.read().boletos
      const valoresPagos: unknown[] = []
      for (const boleto of boletos) {
        const ocorrencia = getOcorrencia(cnabFile.bank, cnabFile.format, boleto.fields.codigo_de_ocorrencia as string)
        if (ocorrencia != CnabOcorrencia.ENTRADA_CONFIRMADA) {
          valoresPagos.push(boleto.fields.valor_pago ?? null)
        }
      }

      // Then
      expect(valoresPagos).toEqual(expectedValoresPagos)
    }
  )

  it.each([
    ['bradesco/cnab240/retorno/bradesco_cnab_240.txt', [null, 5, null]],
    ['bradesco/cnab400/retorno/bradesco_cnab_400.RET', [null, 23.23, null]],
    ['caixa/cnab240/retorno/caixa_cnab_240.txt', [null, 25, null]],
    ['itau/cnab400/retorno/ITAU_cnab_400.RET', [null, 2.25, null]],
    ['santander/cnab240/retorno/santander_cnab_240.txt', [null, 25, null]],
    ['santander/cnab400/retorno/santander_cnab_400.RET', [null, 3.68, null]],
    ['sicredi/cnab240/retorno/sicredi_cnab_240.txt', [null, 25, null]],
    ['sicoob/cnab240/retorno/sicoob_cnab_240.txt', [null, 25, null]],
    ['sicoob/cnab400/retorno/sicoob_cnab_400.RET', [null, 2.31, null]],
    ['banco-do-brasil/cnab240/retorno/banco_do_brasil_cnab_240.txt', [null, 2.5, null]],
    ['banco-do-brasil/cnab400/retorno/banco_do_brasil_cnab_400.RET', [null, 87.38, null]]
  ])(
    'given retorno file %s when reading then returns the juros e multa of the liquidações and none for the baixa',
    (examplePath: string, expectedJurosMulta: Array<number | null>): void => {
      // Given
      const cnabFile = CnabFile.fromLines(readExampleLines(path.join(resPath(), examplePath)))

      // When
      const boletos = cnabFile.read().boletos
      const jurosMulta: unknown[] = []
      for (const boleto of boletos) {
        const ocorrencia = getOcorrencia(cnabFile.bank, cnabFile.format, boleto.fields.codigo_de_ocorrencia as string)
        if (ocorrencia != CnabOcorrencia.ENTRADA_CONFIRMADA) {
          jurosMulta.push(boleto.fields.juros_multa ?? null)
        }
      }

      // Then
      expect(jurosMulta).toEqual(expectedJurosMulta)
    }
  )

  it('given the Itaú CNAB 400 retorno file when reading then the entradas confirmadas have no juros e multa even with the mora por dia in its position', (): void => {
    // Given
    const lines = readExampleLines(path.join(resPath(), 'itau/cnab400/retorno/ITAU_cnab_400.RET'))
    const cnabFile = CnabFile.fromLines(lines)

    // When
    const boletos = cnabFile.read().boletos
    const entradasWithJurosMulta: unknown[] = []
    for (const boleto of boletos) {
      const ocorrencia = getOcorrencia(cnabFile.bank, cnabFile.format, boleto.fields.codigo_de_ocorrencia as string)
      if (ocorrencia == CnabOcorrencia.ENTRADA_CONFIRMADA && boleto.fields.juros_multa != null) {
        entradasWithJurosMulta.push(boleto.fields.juros_multa)
      }
    }
    const entradaLines: string[] = []
    for (const line of lines) {
      if (line.startsWith('1') && line.substring(108, 110) == '02' && line.substring(266, 279) != '0000000000000') {
        entradaLines.push(line)
      }
    }

    // Then
    expect(entradaLines.length).toBeGreaterThan(0)
    expect(entradasWithJurosMulta).toEqual([])
  })

  it.each([
    ['caixa/cnab400/retorno/caixa_cnab_400.RET', [null, 2.31, null], [150, 233.81, null]],
    ['sicredi/cnab400/retorno/sicredi_cnab_400.RET', [7.36, 25, null], [375.48, 1275, null]]
  ])(
    'given retorno file %s with a multa in the last liquidação when reading then returns juros pago and multa paga separately',
    (examplePath: string, expectedJurosPagos: Array<number | null>, expectedValoresPagos: Array<number | null>): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const cnabFile = CnabFile.fromLines(lines)
      let lastLiquidacaoIndex = -1
      for (const [index, line] of lines.entries()) {
        const isDetalhe = line.startsWith('1')
        const ocorrencia = getOcorrencia(cnabFile.bank, cnabFile.format, line.substring(108, 110))
        if (isDetalhe && ocorrencia == CnabOcorrencia.LIQUIDACAO) {
          lastLiquidacaoIndex = index
        }
      }
      lines[lastLiquidacaoIndex] = replaceLineRange(lines[lastLiquidacaoIndex], [280, 292], '0000000000100')

      // When
      const boletos = CnabFile.fromLines(lines).read().boletos
      const jurosPagos: unknown[] = []
      const multasPagas: unknown[] = []
      const valoresPagos: unknown[] = []
      for (const boleto of boletos) {
        const ocorrencia = getOcorrencia(cnabFile.bank, cnabFile.format, boleto.fields.codigo_de_ocorrencia as string)
        if (ocorrencia != CnabOcorrencia.ENTRADA_CONFIRMADA) {
          jurosPagos.push(boleto.fields.juros_pago ?? null)
          multasPagas.push(boleto.fields.multa_paga ?? null)
          valoresPagos.push(boleto.fields.valor_pago ?? null)
        }
      }

      // Then
      expect(jurosPagos).toEqual(expectedJurosPagos)
      expect(multasPagas).toEqual([null, 1, null])
      expect(valoresPagos).toEqual(expectedValoresPagos)
    }
  )

  it.each([
    ['bradesco/cnab240/retorno/bradesco_cnab_240.txt', [new Date(2026, 11, 15), new Date(2026, 11, 22), new Date(2026, 11, 23)]],
    ['bradesco/cnab400/retorno/bradesco_cnab_400.RET', [new Date(2026, 5, 3), new Date(2026, 5, 7), new Date(2026, 5, 8)]],
    ['caixa/cnab240/retorno/caixa_cnab_240.txt', [new Date(2026, 11, 15), new Date(2027, 0, 22), new Date(2027, 0, 25)]],
    ['caixa/cnab400/retorno/caixa_cnab_400.RET', [new Date(2026, 7, 15), new Date(2026, 7, 22), new Date(2026, 7, 23)]],
    ['itau/cnab240/retorno/itau_cnab_240.txt', [new Date(2026, 11, 18), new Date(2026, 11, 20), new Date(2026, 11, 21)]],
    ['itau/cnab400/retorno/ITAU_cnab_400.RET', [new Date(2026, 6, 6), new Date(2026, 6, 7), new Date(2026, 6, 8)]],
    ['santander/cnab240/retorno/santander_cnab_240.txt', [new Date(2026, 11, 15), new Date(2027, 0, 22), new Date(2027, 0, 23)]],
    ['santander/cnab400/retorno/santander_cnab_400.RET', [new Date(2026, 5, 6), new Date(2026, 5, 23), new Date(2026, 5, 24)]],
    ['sicredi/cnab240/retorno/sicredi_cnab_240.txt', [new Date(2026, 11, 15), new Date(2026, 11, 22), new Date(2026, 11, 23)]],
    ['sicredi/cnab400/retorno/sicredi_cnab_400.RET', [new Date(2026, 8, 5), new Date(2026, 8, 9), new Date(2026, 8, 10)]],
    ['sicoob/cnab240/retorno/sicoob_cnab_240.txt', [new Date(2026, 11, 15), new Date(2026, 11, 22), new Date(2026, 11, 23)]],
    ['sicoob/cnab400/retorno/sicoob_cnab_400.RET', [new Date(2026, 7, 15), new Date(2026, 7, 22), new Date(2026, 7, 23)]],
    ['banco-do-brasil/cnab240/retorno/banco_do_brasil_cnab_240.txt', [new Date(2026, 11, 15), new Date(2027, 0, 22), new Date(2027, 0, 25)]],
    ['banco-do-brasil/cnab400/retorno/banco_do_brasil_cnab_400.RET', [new Date(2026, 5, 11), new Date(2026, 5, 13), new Date(2026, 5, 14)]]
  ])(
    'given retorno file %s when reading then returns the data de ocorrência of the liquidações and of the baixa',
    (examplePath: string, expectedDatas: Date[]): void => {
      // Given
      const cnabFile = CnabFile.fromLines(readExampleLines(path.join(resPath(), examplePath)))

      // When
      const boletos = cnabFile.read().boletos
      const datas: unknown[] = []
      for (const boleto of boletos) {
        const ocorrencia = getOcorrencia(cnabFile.bank, cnabFile.format, boleto.fields.codigo_de_ocorrencia as string)
        if (ocorrencia != CnabOcorrencia.ENTRADA_CONFIRMADA) {
          datas.push(boleto.fields.data_de_ocorrencia ?? null)
        }
      }

      // Then
      expect(datas).toEqual(expectedDatas)
    }
  )

  it.each([
    ['bradesco/cnab240/retorno/bradesco_cnab_240.txt', ['NF0000123', 'NF0000124', 'NF0000125']],
    ['bradesco/cnab400/retorno/bradesco_cnab_400.RET', ['NF80673-01', 'NF80386-01', 'NF82759-04']],
    ['caixa/cnab400/retorno/caixa_cnab_400.RET', ['NF00020000', 'NF00020001', 'NF00020009']],
    ['itau/cnab400/retorno/ITAU_cnab_400.RET', ['NF76872-04', 'NF76870-04', 'NF85895-03']],
    ['santander/cnab400/retorno/santander_cnab_400.RET', ['9558.02', '9558.03', '10505.04']],
    ['sicredi/cnab240/retorno/sicredi_cnab_240.txt', ['NF00000001', 'NF00000002', 'NF00000003']],
    ['sicredi/cnab400/retorno/sicredi_cnab_400.RET', ['NF00000001', 'NF00000002', 'NF00000003']],
    ['sicoob/cnab240/retorno/sicoob_cnab_240.txt', ['NF00000001', 'NF00000002', 'NF00000003']],
    ['sicoob/cnab400/retorno/sicoob_cnab_400.RET', ['NF00000001', 'NF00000002', 'NF00000010']],
    ['banco-do-brasil/cnab240/retorno/banco_do_brasil_cnab_240.txt', ['NF00012345', 'NF00012346', 'NF00012347']],
    ['banco-do-brasil/cnab400/retorno/banco_do_brasil_cnab_400.RET', ['NF81972-01', 'NF76666-01', 'NF82670-06']]
  ])(
    'given retorno file %s when reading then returns the seu número of the liquidações and of the baixa',
    (examplePath: string, expectedSeusNumeros: string[]): void => {
      // Given
      const cnabFile = CnabFile.fromLines(readExampleLines(path.join(resPath(), examplePath)))

      // When
      const boletos = cnabFile.read().boletos
      const seusNumeros: unknown[] = []
      for (const boleto of boletos) {
        const ocorrencia = getOcorrencia(cnabFile.bank, cnabFile.format, boleto.fields.codigo_de_ocorrencia as string)
        if (ocorrencia != CnabOcorrencia.ENTRADA_CONFIRMADA) {
          seusNumeros.push(boleto.fields.seu_numero ?? null)
        }
      }

      // Then
      expect(seusNumeros).toEqual(expectedSeusNumeros)
    }
  )
})
