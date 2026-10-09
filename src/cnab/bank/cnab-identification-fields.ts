import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabBankIdentificationFields } from '@cnab/type/cnab-bank-identification-fields'
import { BANCO_DO_BRASIL_IDENTIFICATION_FIELDS } from '@cnab/bank/banco-do-brasil/banco-do-brasil-identification-fields'
import { BRADESCO_IDENTIFICATION_FIELDS } from '@cnab/bank/bradesco/bradesco-identification-fields'
import { CAIXA_IDENTIFICATION_FIELDS } from '@cnab/bank/caixa/caixa-identification-fields'
import { ITAU_IDENTIFICATION_FIELDS } from '@cnab/bank/itau/itau-identification-fields'
import { SANTANDER_IDENTIFICATION_FIELDS } from '@cnab/bank/santander/santander-identification-fields'
import { SICOOB_IDENTIFICATION_FIELDS } from '@cnab/bank/sicoob/sicoob-identification-fields'
import { SICREDI_IDENTIFICATION_FIELDS } from '@cnab/bank/sicredi/sicredi-identification-fields'

const banks: CnabBankIdentificationFields[] = [
  BANCO_DO_BRASIL_IDENTIFICATION_FIELDS,
  BRADESCO_IDENTIFICATION_FIELDS,
  CAIXA_IDENTIFICATION_FIELDS,
  ITAU_IDENTIFICATION_FIELDS,
  SANTANDER_IDENTIFICATION_FIELDS,
  SICOOB_IDENTIFICATION_FIELDS,
  SICREDI_IDENTIFICATION_FIELDS
]

export const CNAB_SEU_NUMERO_FIELDS: CnabFieldClass[] = banks.flatMap((bank: CnabBankIdentificationFields) => bank.seuNumero)
export const CNAB_USO_DA_EMPRESA_FIELDS: CnabFieldClass[] = banks.flatMap((bank: CnabBankIdentificationFields) => bank.usoDaEmpresa)
export const CNAB_NOSSO_NUMERO_FIELDS: CnabFieldClass[] = banks.flatMap((bank: CnabBankIdentificationFields) => bank.nossoNumero)

export const CNAB_IDENTIFICATION_FIELDS: CnabFieldClass[] = [
  ...CNAB_SEU_NUMERO_FIELDS,
  ...CNAB_USO_DA_EMPRESA_FIELDS,
  ...CNAB_NOSSO_NUMERO_FIELDS
]
