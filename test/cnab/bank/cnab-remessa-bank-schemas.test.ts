import { CnabField } from '@cnab/type/cnab-field'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { describe, it, expect } from '@jest/globals'
import { CNAB_REMESSA_BANK_SCHEMAS } from '@cnab/bank/cnab-remessa-bank-schemas'

describe('cnab-remessa-bank-schemas', (): void => {
  it('given schema registry when reading declared fields then each field matches its line type', (): void => {
    // Given
    const declaredFields: Array<[string, typeof CnabField<unknown>]> = []
    for (const schemasByFormat of Object.values(CNAB_REMESSA_BANK_SCHEMAS)) {
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
