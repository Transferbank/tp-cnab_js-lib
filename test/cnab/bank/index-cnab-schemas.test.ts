import { describe, it, expect } from '@jest/globals'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { genCnabSchemaStub } from '@test/cnab/doubles/cnab-schema-stub'
import { CnabSchemaRegistrationException } from '@cnab/exception/cnab-exception'
import { indexCnabSchemas } from '@cnab/bank/index-cnab-schemas'

describe('index-cnab-schemas', (): void => {
  it('given schemas when indexing then keys come from each schema', (): void => {
    // Given
    const schemas = [
      genCnabSchemaStub(CnabBank.BRADESCO, CnabFormat.CNAB240),
      genCnabSchemaStub(CnabBank.BRADESCO, CnabFormat.CNAB400)
    ]
    const expectedKeys = schemas.map((schema) => [schema.bank, schema.fmt])

    // When
    const indexed = indexCnabSchemas(schemas)

    // Then
    const actualKeys: Array<[CnabBank, CnabFormat]> = []
    for (const [bank, schemasByFormat] of Object.entries(indexed)) {
      for (const fmt of Object.keys(schemasByFormat as Record<string, unknown>)) {
        actualKeys.push([bank as CnabBank, fmt as CnabFormat])
      }
    }
    expect(actualKeys).toEqual(expectedKeys)

    expect(Object.values(indexed).flatMap((schemasByFormat) =>
      Object.values(schemasByFormat as Record<string, unknown>)
    )).toEqual(schemas)

  })

  it('given same bank and format twice when indexing then throws exception', (): void => {
    // Given
    const schemas = [
      genCnabSchemaStub(CnabBank.BRADESCO, CnabFormat.CNAB400),
      genCnabSchemaStub(CnabBank.BRADESCO, CnabFormat.CNAB400)
    ]

    // Then
    expect(() => indexCnabSchemas(schemas)).toThrow(
      CnabSchemaRegistrationException
    )
  })
})
