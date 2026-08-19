import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabSchemaRegistrationException } from '@cnab/exception/cnab-exception'
import { Cnab240BradescoBoletoNameField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-name-field'
import { Cnab400BradescoBoletoNameField } from '@cnab/bank/bradesco/cnab/cnab400/field/fields'
import {
  Cnab400HeaderLineStartValidator,
  Cnab400TrailerLineStartValidator
} from '@cnab/validators/cnab400/cnab400-line-start-validator'

function registerCnabSchemas(): CnabSchema[] {
  return [
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB240,
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [Cnab240BradescoBoletoNameField]
      })
    }),
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB400,
      header: new CnabLineSchema({
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator]
      }),
      trailer: new CnabLineSchema({
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator]
      }),
      boleto: new CnabLineSchema({
        fieldType: CnabFieldType.BOLETO,
        fields: [Cnab400BradescoBoletoNameField]
      })
    })
  ]
}

function indexCnabSchemas(
  schemas: CnabSchema[]
): Record<CnabBank, Record<CnabFormat, CnabSchema>> {
  const keys = schemas.map(
    (schema: CnabSchema): [CnabBank, CnabFormat] => [schema.bank, schema.fmt]
  )

  const counts: Record<string, number> = {}
  for (const [bank, fmt] of keys) {
    const key = `${bank}:${fmt}`
    counts[key] = (counts[key] ?? 0) + 1
  }

  const duplicated_key = Object.entries(counts).find(
    ([, count]: [string, number]) => count > 1
  )

  if (duplicated_key != null) {
    const [key] = duplicated_key
    const [bank, fmt] = key.split(':') as [CnabBank, CnabFormat]
    throw new CnabSchemaRegistrationException(bank, fmt)
  }

  const indexed: Record<string, Record<string, CnabSchema>> = {}
  for (const schema of schemas) {
    if (indexed[schema.bank] == null) {
      indexed[schema.bank] = {}
    }
    indexed[schema.bank][schema.fmt] = schema
  }

  return indexed as Record<CnabBank, Record<CnabFormat, CnabSchema>>
}

export const CNAB_BANK_SCHEMAS: Record<
  CnabBank,
  Record<CnabFormat, CnabSchema>
> = indexCnabSchemas(registerCnabSchemas())