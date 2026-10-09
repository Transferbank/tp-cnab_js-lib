import { CnabFieldClass } from '@cnab/type/cnab-field'

export const CNAB_SEU_NUMERO_FIELDS: CnabFieldClass[] = []

export const CNAB_USO_DA_EMPRESA_FIELDS: CnabFieldClass[] = []

export const CNAB_NOSSO_NUMERO_FIELDS: CnabFieldClass[] = []

export const CNAB_IDENTIFICATION_FIELDS: CnabFieldClass[] = [
  ...CNAB_SEU_NUMERO_FIELDS,
  ...CNAB_USO_DA_EMPRESA_FIELDS,
  ...CNAB_NOSSO_NUMERO_FIELDS
]
