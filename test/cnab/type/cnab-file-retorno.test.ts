import { describe, it, expect } from '@jest/globals'
import * as path from 'path'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabOcorrencia } from '@cnab/type/cnab-ocorrencia'
import { getOcorrencia, getOcorrenciaDescription } from '@cnab/bank/cnab-ocorrencia-tables'
import { readExampleLines, resPath } from '@test/test-utils'

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
})
