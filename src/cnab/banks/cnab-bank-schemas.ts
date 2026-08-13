import { CnabBank } from '../types/cnab-bank-code'
import { CnabFormat } from '../types/cnab-format'
import { CnabSchema } from '../types/cnab-schema'
import { CnabLineSchema } from '../types/cnab-line-schema'
import { CnabBankCode } from '../types/cnab-bank-code'
import { CnabFieldType } from '../types/cnab-field-type'
import {
  NomeSacadoField,
  ValorTituloField,
  VencimentoField
} from './bradesco/fields/cnab400'

export const CNAB_BANK_SCHEMAS: Record<string, Record<string, CnabSchema>> = {
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: new CnabSchema({
      header: new CnabLineSchema({
        format: CnabFormat.CNAB240,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        format: CnabFormat.CNAB240,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        format: CnabFormat.CNAB240,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.BOLETO,
        fields: []
      })
    }),
    [CnabFormat.CNAB400]: new CnabSchema({
      header: new CnabLineSchema({
        format: CnabFormat.CNAB400,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.HEADER,
        fields: []
      }),
      trailer: new CnabLineSchema({
        format: CnabFormat.CNAB400,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.TRAILER,
        fields: []
      }),
      boleto: new CnabLineSchema({
        format: CnabFormat.CNAB400,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.BOLETO,
        fields: [
          VencimentoField,
          ValorTituloField,
          NomeSacadoField
        ]
      })
    })
  }
}
