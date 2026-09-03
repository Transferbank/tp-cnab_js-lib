import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { describe, it, expect } from '@jest/globals'
import { genCnabSchemaStub } from '@test/cnab/doubles/cnab-schema-stub'
import { CnabSchemaRegistrationException } from '@cnab/exception/cnab-exception'
import {CNAB_BANK_SCHEMAS, indexCnabSchemas} from '@cnab/bank/cnab-bank-schemas'

describe('cnab-bank-schemas', (): void => {
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

  it('given schema registry when reading declared fields then each field matches its line type', (): void => {
    // Given
    const declaredFields: Array<[string, typeof CnabField]> = []
    for (const schemasByFormat of Object.values(CNAB_BANK_SCHEMAS)) {
      for (const schema of Object.values(
        schemasByFormat as Record<string, unknown>
      )) {
        const cnabSchema = schema as CnabSchema
        for (const lineSchema of cnabSchema.lineSchemas) {
          for (const field of lineSchema.fields) {
            declaredFields.push([lineSchema.fieldType, field])
          }
        }
      }
    }

    // When
    const mismatchedFields = declaredFields.filter(
      ([fieldType, field]) => field.fieldType !== fieldType
    )

    // Then
    expect(declaredFields.length).toBeGreaterThan(0)
    expect(mismatchedFields).toEqual([])
  })
})
