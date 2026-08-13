import { CnabSchema } from '../../../../types/cnab-schema'
import { CnabFormat } from '../../../../types/cnab-format'
import { CnabBankCode } from '../../../../types/cnab-bank-code'
import { CnabFieldType } from '../../../../types/cnab-field-type'

export const BradescoCnab240Schema: CnabSchema = {
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
}
