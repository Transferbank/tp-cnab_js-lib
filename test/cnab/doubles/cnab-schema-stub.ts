import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { Cnab400BradescoGroupRule } from '@cnab/bank/bradesco/cnab/cnab400/cnab-400-bradesco-group-rule'

export function genCnabSchemaStub(
  bank: CnabBank = CnabBank.BRADESCO,
  fmt: CnabFormat = CnabFormat.CNAB400
): CnabSchema {
  return new CnabSchema({
    bank,
    fmt,
    boletoGroupRule: new Cnab400BradescoGroupRule(),
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
