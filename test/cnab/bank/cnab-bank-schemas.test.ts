import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { describe, it, expect } from '@jest/globals'
import { genCnabSchemaStub } from '@test/cnab/doubles/cnab-schema-stub'
import { CnabSchemaRegistrationException } from '@cnab/exception/cnab-exception'
import {CNAB_BANK_SCHEMAS, indexCnabSchemas} from '@cnab/bank/cnab-bank-schemas'

describe('cnab-bank-schemas', (): void => {
  it('dado schemas quando indexar então chaves e valores vêm de cada schema', (): void => {
    // Given
    const schemas = [
      genCnabSchemaStub({ bank: CnabBank.BRADESCO, format: CnabFormat.CNAB240 }),
      genCnabSchemaStub({ bank: CnabBank.BRADESCO, format: CnabFormat.CNAB400 })
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

    expect( Object.values(indexed).flatMap((schemasByFormat) =>
      Object.values(schemasByFormat as Record<string, unknown>)
    )).toEqual(schemas)

  })

  it('dado mesmo banco e formato duas vezes quando indexar então lança exception', (): void => {
    // Given
    const schemas = [
      genCnabSchemaStub({ format: CnabFormat.CNAB400 }),
      genCnabSchemaStub({ format: CnabFormat.CNAB400 })
    ]

    // Then
    expect(() => indexCnabSchemas(schemas)).toThrow(
      CnabSchemaRegistrationException
    )
  })

  it('dado registro de schemas quando ler campos declarados então cada campo corresponde ao seu tipo de linha', (): void => {
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
