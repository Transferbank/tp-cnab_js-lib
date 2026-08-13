import { CnabSchema } from '@cnab/types/cnab-schema'
import { CnabLineSchema } from '@cnab/types/cnab-line-schema'
import { CnabFormat } from '@cnab/types/cnab-format'
import { CnabBankCode } from '@cnab/types/cnab-bank-code'
import { CnabFieldType } from '@cnab/types/cnab-field-type'
import {
  NomeSacadoField,
  ValorTituloField,
  VencimentoField
} from '../../fields/cnab400'

export const BradescoCnab400Schema = new CnabSchema({
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
