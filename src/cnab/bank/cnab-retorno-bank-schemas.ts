import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { indexCnabSchemas } from '@cnab/bank/index-cnab-schemas'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400HeaderLineStartValidator, Cnab400TrailerLineStartValidator } from '@cnab/validators/cnab400/cnab400-line-start-validator'
import { Cnab240RetornoBoletoGroupRule } from '@cnab/group-rule/cnab240/retorno-boleto-group-rule'
import { Cnab400BoletoGroupRule } from '@cnab/group-rule/cnab400/boleto-group-rule'

import * as RetornoFields240 from '@cnab/field/cnab240/retorno/fields'

import * as BancoDoBrasilRetornoFields400 from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/retorno/fields'

function registerCnabSchemas(): CnabSchema[] {
  return [
    // BANCO DO BRASIL
    new CnabSchema({
      bank: CnabBank.BANCODOBRASIL,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240RetornoBoletoGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          RetornoFields240.CodigoDeOcorrenciaBoletoField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.BANCODOBRASIL,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BoletoGroupRule('7'),
      header: {
        fieldType: CnabFieldType.HEADER,
        fields: [],
        validators: [Cnab400HeaderLineStartValidator],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fields: [
          BancoDoBrasilRetornoFields400.CodigoDeOcorrenciaBoletoField
        ],
      },
    }),
  ]
}

export const CNAB_RETORNO_BANK_SCHEMAS: Record<CnabBank, Record<CnabFormat, CnabSchema>> = indexCnabSchemas(registerCnabSchemas())
