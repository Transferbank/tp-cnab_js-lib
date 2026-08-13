import { CnabBank } from '../types/cnab-bank-code'
import { CnabFormat } from '../types/cnab-format'
import { CnabSchema } from '../types/cnab-schema'
import { CnabBankCode } from '../types/cnab-bank-code'
import { CnabFieldType } from '../types/cnab-field-type'

export const CNAB_BANK_SCHEMAS: Record<string, Record<string, CnabSchema>> = {
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: {
      header: {
        format: CnabFormat.CNAB240,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.HEADER,
        fields: []
      },
      trailer: {
        format: CnabFormat.CNAB240,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.TRAILER,
        fields: []
      },
      boleto: {
        format: CnabFormat.CNAB240,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.BOLETO,
        fields: []
      }
    },
    [CnabFormat.CNAB400]: {
      header: {
        format: CnabFormat.CNAB400,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.HEADER,
        fields: []
      },
      trailer: {
        format: CnabFormat.CNAB400,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.TRAILER,
        fields: []
      },
      boleto: {
        format: CnabFormat.CNAB400,
        bankCode: CnabBankCode.BRADESCO,
        fieldType: CnabFieldType.BOLETO,
        fields: []
      }
    }
  }
}
