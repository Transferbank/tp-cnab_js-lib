import { describe, it, expect } from '@jest/globals'
import { CnabOcorrencia, CnabOcorrenciaTable, findOcorrencia } from '@cnab/type/cnab-ocorrencia'
import { CnabDuplicatedOcorrenciaCodeException } from '@cnab/exception/cnab-exception'

const TABLE: CnabOcorrenciaTable = {
  [CnabOcorrencia.ENTRADA_CONFIRMADA]: { '01': 'Entrada confirmada' },
  [CnabOcorrencia.LIQUIDACAO]: { '21': 'Liquidação', '22': 'Liquidação em cartório' }
}

describe('findOcorrencia', (): void => {
  it('given a code in the table when searching then returns its category and description', (): void => {
    // When
    const match = findOcorrencia(TABLE, '22')

    // Then
    expect(match).toEqual({ ocorrencia: CnabOcorrencia.LIQUIDACAO, description: 'Liquidação em cartório' })
  })

  it('given a code outside the table when searching then returns null', (): void => {
    // When
    const match = findOcorrencia(TABLE, '99')

    // Then
    expect(match).toBeNull()
  })

  it('given a code in two categories when searching then refuses the table', (): void => {
    // Given
    const table: CnabOcorrenciaTable = {
      [CnabOcorrencia.BAIXA]: { '02': 'Baixa manual confirmada' },
      [CnabOcorrencia.ENTRADA_CONFIRMADA]: { '02': 'Entrada confirmada' }
    }

    // When
    const find = (): unknown => findOcorrencia(table, '02')

    // Then
    expect(find).toThrow(new CnabDuplicatedOcorrenciaCodeException('02', CnabOcorrencia.BAIXA, CnabOcorrencia.ENTRADA_CONFIRMADA))
  })
})
