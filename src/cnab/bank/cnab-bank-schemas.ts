import { CnabBank } from '@/cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/types/cnab-format'
import { CnabSchema } from '@cnab/types/cnab-schema'
import { CnabFieldType } from '@cnab/types/cnab-field-type'

export const CNAB_BANK_SCHEMAS: Record<string, Record<string, CnabSchema>> = {
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: {
      header: {
        format: CnabFormat.CNAB240,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.HEADER,
        fields: []
      },
      trailer: {
        format: CnabFormat.CNAB240,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.TRAILER,
        fields: []
      },
      boleto: {
        format: CnabFormat.CNAB240,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.BOLETO,
        fields: []
      }
    },
    [CnabFormat.CNAB400]: {
      header: {
        format: CnabFormat.CNAB400,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.HEADER,
        fields: []
      },
      trailer: {
        format: CnabFormat.CNAB400,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.TRAILER,
        fields: []
      },
      boleto: {
        format: CnabFormat.CNAB400,
        bank: CnabBank.BRADESCO,
        fieldType: CnabFieldType.BOLETO,
        fields: []
      }
    }
  }
}
