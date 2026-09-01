import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabSchemaRegistrationException } from '@cnab/exception/cnab-exception'
import * as BradescoFields240 from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import * as BradescoFields400 from '@cnab/bank/bradesco/cnab/cnab400/field/fields'
import * as ItauFields240 from '@cnab/bank/itau/cnab/cnab240/field/fields'
import * as ItauFields400 from '@cnab/bank/itau/cnab/cnab400/field/fields'
import { Cnab240BradescoGroupRule } from '@cnab/bank/bradesco/cnab/cnab240/cnab-240-bradesco-group-rule'
import { Cnab400BradescoGroupRule } from '@cnab/bank/bradesco/cnab/cnab400/cnab-400-bradesco-group-rule'
import { Cnab240ItauGroupRule } from '@cnab/bank/itau/cnab/cnab240/cnab-240-itau-group-rule'
import { Cnab400ItauGroupRule } from '@cnab/bank/itau/cnab/cnab400/cnab-400-itau-group-rule'
import {
  Cnab400HeaderLineStartValidator,
  Cnab400TrailerLineStartValidator
} from '@cnab/validators/cnab400/cnab400-line-start-validator'

function registerCnabSchemas(): CnabSchema[] {
  return [
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BradescoGroupRule(),
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
        fields: [
          BradescoFields240.Cnab240BradescoBoletoNameField,
          BradescoFields240.Cnab240BradescoBoletoVencimentoField,
          BradescoFields240.Cnab240BradescoBoletoValorTituloField,
          BradescoFields240.Cnab240BradescoBoletoSacadoDocumentoField
        ]
      })
    }),
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BradescoGroupRule(),
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
        fields: [
          BradescoFields400.Cnab400BradescoBoletoNameField,
          BradescoFields400.Cnab400BradescoBoletoVencimentoField,
          BradescoFields400.Cnab400BradescoBoletoValorTituloField,
          BradescoFields400.Cnab400BradescoBoletoSacadoDocumentoField
        ]
      })
    }),
    new CnabSchema({
      bank: CnabBank.ITAU,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240ItauGroupRule(),
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
        fields: [
          ItauFields240.Cnab240ItauBoletoNameField,
          ItauFields240.Cnab240ItauBoletoVencimentoField,
          ItauFields240.Cnab240ItauBoletoValorTituloField,
          ItauFields240.Cnab240ItauBoletoSacadoDocumentoField
        ]
      })
    }),
    new CnabSchema({
      bank: CnabBank.ITAU,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400ItauGroupRule(),
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
        fields: [
          ItauFields400.Cnab400ItauBoletoNameField,
          ItauFields400.Cnab400ItauBoletoVencimentoField,
          ItauFields400.Cnab400ItauBoletoValorTituloField,
          ItauFields400.Cnab400ItauBoletoSacadoDocumentoField
        ]
      })
    })
  ]
}

export function indexCnabSchemas(
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

  const duplicatedKey = Object.entries(counts).find(
    ([, count]: [string, number]) => count > 1
  )

  if (duplicatedKey != null) {
    const [key] = duplicatedKey
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

export const CNAB_BANK_SCHEMAS: Record<CnabBank, Record<CnabFormat, CnabSchema>> = indexCnabSchemas(registerCnabSchemas())