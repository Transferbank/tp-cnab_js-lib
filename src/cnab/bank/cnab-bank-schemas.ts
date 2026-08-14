import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { CnabFieldType } from '@cnab/type/cnab-field-type'

export const CNAB_BANK_SCHEMAS: Record<string, Record<string, CnabSchema>> = {
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: new CnabSchema({
      header: new CnabLineSchema({
        format: CnabFormat.CNAB240,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        format: CnabFormat.CNAB240,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        format: CnabFormat.CNAB240,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.BOLETO,
        fields: []
      })
    }),
    [CnabFormat.CNAB400]: new CnabSchema({
      header: new CnabLineSchema({
        format: CnabFormat.CNAB400,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        format: CnabFormat.CNAB400,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        format: CnabFormat.CNAB400,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.BOLETO,
        fields: []
      })
    })
  }
}
