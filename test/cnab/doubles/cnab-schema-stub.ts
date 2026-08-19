import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabSchema } from '@cnab/type/cnab-schema'

export function genCnabSchemaStub(config?: {
  bank?: CnabBank
  format?: CnabFormat
}): CnabSchema {
  const bank = config?.bank ?? CnabBank.BRADESCO
  const format = config?.format ?? CnabFormat.CNAB400

  return new CnabSchema({
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
      fields: []
    })
  })
}
