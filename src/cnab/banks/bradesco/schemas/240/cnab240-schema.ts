import { CnabSchema } from '../../../../types/cnab-schema'
import { CnabLineSchema } from '../../../../types/cnab-line-schema'
import { CnabFormat } from '../../../../types/cnab-format'
import { CnabBankCode } from '../../../../types/cnab-bank-code'
import { CnabFieldType } from '../../../../types/cnab-field-type'

export const BradescoCnab240Schema = new CnabSchema({
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
})
