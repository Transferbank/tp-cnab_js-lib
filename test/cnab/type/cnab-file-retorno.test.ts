import { describe, it, expect } from '@jest/globals'
import * as path from 'path'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabOcorrencia } from '@cnab/type/cnab-ocorrencia'
import { getOcorrencia, getOcorrenciaDescription } from '@cnab/bank/cnab-ocorrencia-tables'
import { readExampleLines, resPath } from '@test/test-utils'

describe('cnab-file retorno', (): void => {
  it.each([
    ['banco-do-brasil/cnab240/retorno/banco_do_brasil_cnab_240.txt', 3, 'Liquidação'],
    ['banco-do-brasil/cnab400/retorno/banco_do_brasil_cnab_400.RET', 113, 'Liquidação Normal']
  ])(
    'given retorno file %s when reading then translates the ocorrência of each boleto',
    (examplePath: string, expectedEntradas: number, expectedLiquidationDescription: string): void => {
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
      expect(getOcorrenciaDescription(cnabFile.bank, cnabFile.format, '06')).toBe(expectedLiquidationDescription)
    }
  )
})
