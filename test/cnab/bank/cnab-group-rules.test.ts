import { describe, it, expect } from '@jest/globals'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabBoletoGroupRule } from '@cnab/type/cnab-boleto-group-rule'
import { CNAB_GROUP_RULES } from '@cnab/bank/cnab-group-rules'

describe('cnab-group-rules', (): void => {
  it('dado registro de group rules quando ler entradas então toda rule é um CnabBoletoGroupRule', (): void => {
    // Given
    const registeredRules: Array<[CnabBank, CnabFormat, typeof CnabBoletoGroupRule]> = []
    for (const [bank, formats] of Object.entries(CNAB_GROUP_RULES)) {
      for (const [fmt, ruleType] of Object.entries(
        formats as Record<string, typeof CnabBoletoGroupRule>
      )) {
        registeredRules.push([
          bank as CnabBank,
          fmt as CnabFormat,
          ruleType
        ])
      }
    }

    // When
    const invalidRules = registeredRules.filter(
      ([, , ruleType]) =>
        !(
          typeof ruleType === 'function' &&
          ruleType.prototype instanceof CnabBoletoGroupRule
        )
    )

    // Then
    expect(registeredRules.length).toBeGreaterThan(0)
    expect(invalidRules).toEqual([])
  })
})
