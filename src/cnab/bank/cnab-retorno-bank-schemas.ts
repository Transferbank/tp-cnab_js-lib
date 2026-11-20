import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { indexCnabSchemas } from '@cnab/bank/index-cnab-schemas'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400HeaderLineStartValidator, Cnab400TrailerLineStartValidator } from '@cnab/validators/cnab400/cnab400-line-start-validator'
import { Cnab240HeaderRecordTypeValidator, Cnab240LoteRecordTypeValidator, Cnab240TrailerRecordTypeValidator } from '@cnab/validators/cnab240/cnab240-record-type-validator'
import { Cnab240RetornoBoletoGroupRule } from '@cnab/group-rule/cnab240/retorno-boleto-group-rule'
import { Cnab400BoletoGroupRule } from '@cnab/group-rule/cnab400/boleto-group-rule'

import * as RetornoFields240 from '@cnab/field/cnab240/retorno/fields'
import * as RetornoFields400 from '@cnab/field/cnab400/retorno/fields'

import * as BancoDoBrasilRetornoFields400 from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/retorno/fields'
import * as CaixaRetornoFields400 from '@cnab/bank/caixa/cnab/cnab400/field/retorno/fields'
import * as ItauRetornoFields400 from '@cnab/bank/itau/cnab/cnab400/field/retorno/fields'
import * as SicoobRetornoFields240 from '@cnab/bank/sicoob/cnab/cnab240/field/retorno/fields'

function registerCnabSchemas(): CnabSchema[] {
  return [
    // BRADESCO
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240RetornoBoletoGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        validators: [Cnab240HeaderRecordTypeValidator],
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        validators: [Cnab240TrailerRecordTypeValidator],
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        validators: [Cnab240LoteRecordTypeValidator],
        fields: [
          RetornoFields240.CodigoDeOcorrenciaBoletoField,
          RetornoFields240.ValorPagoBoletoField,
          RetornoFields240.JurosMultaBoletoField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BoletoGroupRule(),
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
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          RetornoFields400.ValorPagoBoletoField,
          RetornoFields400.JurosMultaBoletoField
        ],
      },
    }),
    // CAIXA
    new CnabSchema({
      bank: CnabBank.CAIXA,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240RetornoBoletoGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        validators: [Cnab240HeaderRecordTypeValidator],
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        validators: [Cnab240TrailerRecordTypeValidator],
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        validators: [Cnab240LoteRecordTypeValidator],
        fields: [
          RetornoFields240.CodigoDeOcorrenciaBoletoField,
          RetornoFields240.ValorPagoBoletoField,
          RetornoFields240.JurosMultaBoletoField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.CAIXA,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BoletoGroupRule(),
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
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          CaixaRetornoFields400.ValorPagoBoletoField
        ],
      },
    }),
    // ITAU
    new CnabSchema({
      bank: CnabBank.ITAU,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240RetornoBoletoGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        validators: [Cnab240HeaderRecordTypeValidator],
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        validators: [Cnab240TrailerRecordTypeValidator],
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        validators: [Cnab240LoteRecordTypeValidator],
        fields: [
          RetornoFields240.CodigoDeOcorrenciaBoletoField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.ITAU,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BoletoGroupRule(),
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
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          ItauRetornoFields400.ValorPagoBoletoField,
          ItauRetornoFields400.JurosMultaBoletoField
        ],
      },
    }),
    // SANTANDER
    new CnabSchema({
      bank: CnabBank.SANTANDER,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240RetornoBoletoGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        validators: [Cnab240HeaderRecordTypeValidator],
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        validators: [Cnab240TrailerRecordTypeValidator],
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        validators: [Cnab240LoteRecordTypeValidator],
        fields: [
          RetornoFields240.CodigoDeOcorrenciaBoletoField,
          RetornoFields240.ValorPagoBoletoField,
          RetornoFields240.JurosMultaBoletoField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.SANTANDER,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BoletoGroupRule(),
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
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          RetornoFields400.ValorPagoBoletoField,
          RetornoFields400.JurosMultaBoletoField
        ],
      },
    }),
    // SICREDI
    new CnabSchema({
      bank: CnabBank.SICREDI,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240RetornoBoletoGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        validators: [Cnab240HeaderRecordTypeValidator],
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        validators: [Cnab240TrailerRecordTypeValidator],
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        validators: [Cnab240LoteRecordTypeValidator],
        fields: [
          RetornoFields240.CodigoDeOcorrenciaBoletoField,
          RetornoFields240.ValorPagoBoletoField,
          RetornoFields240.JurosMultaBoletoField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.SICREDI,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BoletoGroupRule(),
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
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          RetornoFields400.ValorPagoBoletoField
        ],
      },
    }),
    // SICOOB
    new CnabSchema({
      bank: CnabBank.SICOOB,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240RetornoBoletoGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        validators: [Cnab240HeaderRecordTypeValidator],
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        validators: [Cnab240TrailerRecordTypeValidator],
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        validators: [Cnab240LoteRecordTypeValidator],
        fields: [
          RetornoFields240.CodigoDeOcorrenciaBoletoField,
          SicoobRetornoFields240.ValorPagoBoletoField,
          RetornoFields240.JurosMultaBoletoField
        ],
      },
    }),
    new CnabSchema({
      bank: CnabBank.SICOOB,
      fmt: CnabFormat.CNAB400,
      boletoGroupRule: new Cnab400BoletoGroupRule(),
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
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          RetornoFields400.ValorPagoBoletoField,
          RetornoFields400.JurosMultaBoletoField
        ],
      },
    }),
    // BANCO DO BRASIL
    new CnabSchema({
      bank: CnabBank.BANCODOBRASIL,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240RetornoBoletoGroupRule(),
      header: {
        fieldType: CnabFieldType.HEADER,
        validators: [Cnab240HeaderRecordTypeValidator],
        fields: [],
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        validators: [Cnab240TrailerRecordTypeValidator],
        fields: [],
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        validators: [Cnab240LoteRecordTypeValidator],
        fields: [
          RetornoFields240.CodigoDeOcorrenciaBoletoField,
          RetornoFields240.ValorPagoBoletoField,
          RetornoFields240.JurosMultaBoletoField
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
          BancoDoBrasilRetornoFields400.CodigoDeOcorrenciaBoletoField,
          BancoDoBrasilRetornoFields400.ValorPagoBoletoField,
          BancoDoBrasilRetornoFields400.JurosMultaBoletoField
        ],
      },
    }),
  ]
}

export const CNAB_RETORNO_BANK_SCHEMAS: Record<CnabBank, Record<CnabFormat, CnabSchema>> = indexCnabSchemas(registerCnabSchemas())
