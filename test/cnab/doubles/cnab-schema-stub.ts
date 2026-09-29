import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { Cnab400BoletoGroupRule } from '@cnab/group-rule/cnab400/boleto-group-rule'

export function genCnabSchemaStub(
  bank: CnabBank = CnabBank.BRADESCO,
  fmt: CnabFormat = CnabFormat.CNAB400
): CnabSchema {
  return new CnabSchema({
    bank,
    fmt,
    boletoGroupRule: new Cnab400BoletoGroupRule(),
    header: {
      fieldType: CnabFieldType.HEADER,
      fields: []
    },
    trailer: {
      fieldType: CnabFieldType.TRAILER,
      fields: []
    },
    boleto: {
      fieldType: CnabFieldType.BOLETO,
      fields: []
    }
  })
}
