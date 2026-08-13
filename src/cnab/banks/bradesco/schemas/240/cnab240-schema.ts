import { CnabSchema } from '../../../../types/cnab-schema'
import { CnabLineSchema } from '../../../../types/cnab-line-schema'
import { CnabFormat } from '../../../../types/cnab-format'
import { CnabBankCode } from '../../../../types/cnab-bank-code'
import { CnabFieldType } from '../../../../types/cnab-field-type'

export const BradescoCnab240Schema = new CnabSchema(
  new CnabLineSchema(CnabFormat.CNAB240, CnabBankCode.BRADESCO, CnabFieldType.HEADER, []),
  new CnabLineSchema(CnabFormat.CNAB240, CnabBankCode.BRADESCO, CnabFieldType.TRAILER, []),
  new CnabLineSchema(CnabFormat.CNAB240, CnabBankCode.BRADESCO, CnabFieldType.BOLETO, [])
)
