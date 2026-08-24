import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { Cnab400BradescoGroupRule } from '@cnab/bank/bradesco/cnab/cnab400/cnab-400-bradesco-group-rule'

export function genCnabSchemaStub(config?: {
  bank?: CnabBank
  format?: CnabFormat
}): CnabSchema {
  const { bank = CnabBank.BRADESCO, format = CnabFormat.CNAB400 } = config ?? {}

  return new CnabSchema({
    bank,
    fmt: format,
    boletoGroupRule: new Cnab400BradescoGroupRule(),
    header: {
      fieldType: CnabFieldType.HEADER,
      fields: [],
    },
    trailer: {
      fieldType: CnabFieldType.TRAILER,
      fields: [],
    },
    boleto: {
      fieldType: CnabFieldType.BOLETO,
      fields: [],
    },
  })
}
