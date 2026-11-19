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

import { cnab400RetornoDetalheFixedContent, cnab400RetornoHeaderFixedContent, cnab400RetornoTrailerFixedContent } from '@cnab/field/cnab400/retorno/fixed-content'
import { sicrediCnab400RetornoTrailerFixedContent } from '@cnab/bank/sicredi/cnab/cnab400/retorno-fixed-content'
import { sicoobCnab400RetornoTrailerFixedContent } from '@cnab/bank/sicoob/cnab/cnab400/retorno-fixed-content'

import * as BancoDoBrasilRetornoFields400 from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/retorno/fields'
import * as BradescoRetornoFields400 from '@cnab/bank/bradesco/cnab/cnab400/field/retorno/fields'
import * as CaixaRetornoFields240 from '@cnab/bank/caixa/cnab/cnab240/field/retorno/fields'
import * as CaixaRetornoFields400 from '@cnab/bank/caixa/cnab/cnab400/field/retorno/fields'
import * as ItauRetornoFields240 from '@cnab/bank/itau/cnab/cnab240/field/retorno/fields'
import * as ItauRetornoFields400 from '@cnab/bank/itau/cnab/cnab400/field/retorno/fields'
import * as SantanderRetornoFields240 from '@cnab/bank/santander/cnab/cnab240/field/retorno/fields'
import * as SicoobRetornoFields240 from '@cnab/bank/sicoob/cnab/cnab240/field/retorno/fields'
import * as SicoobRetornoFields400 from '@cnab/bank/sicoob/cnab/cnab400/field/retorno/fields'
import * as SicrediRetornoFields400 from '@cnab/bank/sicredi/cnab/cnab400/field/retorno/fields'

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
          RetornoFields240.JurosMultaBoletoField,
          RetornoFields240.DataDeOcorrenciaBoletoField,
          RetornoFields240.SeuNumeroBoletoField,
          RetornoFields240.UsoDaEmpresaBoletoField,
          RetornoFields240.NossoNumeroBoletoField
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
        fixedContent: cnab400RetornoHeaderFixedContent,
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
        fixedContent: cnab400RetornoTrailerFixedContent,
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fixedContent: cnab400RetornoDetalheFixedContent('1'),
        fields: [
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          RetornoFields400.ValorPagoBoletoField,
          RetornoFields400.JurosMultaBoletoField,
          RetornoFields400.DataDeOcorrenciaBoletoField,
          RetornoFields400.SeuNumeroBoletoField,
          RetornoFields400.UsoDaEmpresaBoletoField,
          BradescoRetornoFields400.NossoNumeroBoletoField
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
          RetornoFields240.JurosMultaBoletoField,
          RetornoFields240.DataDeOcorrenciaBoletoField,
          CaixaRetornoFields240.SeuNumeroBoletoField,
          RetornoFields240.UsoDaEmpresaBoletoField,
          CaixaRetornoFields240.NossoNumeroBoletoField
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
        fixedContent: cnab400RetornoHeaderFixedContent,
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
        fixedContent: cnab400RetornoTrailerFixedContent,
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fixedContent: cnab400RetornoDetalheFixedContent('1'),
        fields: [
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          CaixaRetornoFields400.ValorPagoBoletoField,
          RetornoFields400.JurosPagoBoletoField,
          RetornoFields400.MultaPagaBoletoField,
          RetornoFields400.DataDeOcorrenciaBoletoField,
          RetornoFields400.SeuNumeroBoletoField,
          CaixaRetornoFields400.UsoDaEmpresaBoletoField,
          CaixaRetornoFields400.NossoNumeroBoletoField
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
          RetornoFields240.CodigoDeOcorrenciaBoletoField,
          RetornoFields240.DataDeOcorrenciaBoletoField,
          ItauRetornoFields240.SeuNumeroBoletoField,
          RetornoFields240.UsoDaEmpresaBoletoField,
          ItauRetornoFields240.NossoNumeroBoletoField
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
        fixedContent: cnab400RetornoHeaderFixedContent,
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
        fixedContent: cnab400RetornoTrailerFixedContent,
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fixedContent: cnab400RetornoDetalheFixedContent('1'),
        fields: [
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          ItauRetornoFields400.ValorPagoBoletoField,
          ItauRetornoFields400.JurosMultaBoletoField,
          RetornoFields400.DataDeOcorrenciaBoletoField,
          RetornoFields400.SeuNumeroBoletoField,
          RetornoFields400.UsoDaEmpresaBoletoField,
          RetornoFields400.NossoNumeroBoletoField
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
          RetornoFields240.JurosMultaBoletoField,
          RetornoFields240.DataDeOcorrenciaBoletoField,
          SantanderRetornoFields240.SeuNumeroBoletoField,
          SantanderRetornoFields240.UsoDaEmpresaBoletoField,
          SantanderRetornoFields240.NossoNumeroBoletoField
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
        fixedContent: cnab400RetornoHeaderFixedContent,
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
        fixedContent: cnab400RetornoTrailerFixedContent,
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fixedContent: cnab400RetornoDetalheFixedContent('1'),
        fields: [
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          RetornoFields400.ValorPagoBoletoField,
          RetornoFields400.JurosMultaBoletoField,
          RetornoFields400.DataDeOcorrenciaBoletoField,
          RetornoFields400.SeuNumeroBoletoField,
          RetornoFields400.UsoDaEmpresaBoletoField,
          RetornoFields400.NossoNumeroBoletoField
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
          RetornoFields240.JurosMultaBoletoField,
          RetornoFields240.DataDeOcorrenciaBoletoField,
          RetornoFields240.SeuNumeroBoletoField,
          RetornoFields240.UsoDaEmpresaBoletoField,
          RetornoFields240.NossoNumeroBoletoField
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
        fixedContent: cnab400RetornoHeaderFixedContent,
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
        fixedContent: sicrediCnab400RetornoTrailerFixedContent,
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fixedContent: cnab400RetornoDetalheFixedContent('1'),
        fields: [
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          RetornoFields400.ValorPagoBoletoField,
          RetornoFields400.JurosPagoBoletoField,
          RetornoFields400.MultaPagaBoletoField,
          RetornoFields400.DataDeOcorrenciaBoletoField,
          RetornoFields400.SeuNumeroBoletoField,
          SicrediRetornoFields400.NossoNumeroBoletoField
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
          RetornoFields240.JurosMultaBoletoField,
          RetornoFields240.DataDeOcorrenciaBoletoField,
          RetornoFields240.SeuNumeroBoletoField,
          RetornoFields240.UsoDaEmpresaBoletoField,
          RetornoFields240.NossoNumeroBoletoField
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
        fixedContent: cnab400RetornoHeaderFixedContent,
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
        fixedContent: sicoobCnab400RetornoTrailerFixedContent,
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fixedContent: cnab400RetornoDetalheFixedContent('1'),
        fields: [
          RetornoFields400.CodigoDeOcorrenciaBoletoField,
          RetornoFields400.ValorPagoBoletoField,
          RetornoFields400.JurosMultaBoletoField,
          RetornoFields400.DataDeOcorrenciaBoletoField,
          RetornoFields400.SeuNumeroBoletoField,
          RetornoFields400.UsoDaEmpresaBoletoField,
          SicoobRetornoFields400.NossoNumeroBoletoField
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
          RetornoFields240.JurosMultaBoletoField,
          RetornoFields240.DataDeOcorrenciaBoletoField,
          RetornoFields240.SeuNumeroBoletoField,
          RetornoFields240.UsoDaEmpresaBoletoField,
          RetornoFields240.NossoNumeroBoletoField
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
        fixedContent: cnab400RetornoHeaderFixedContent,
      },
      trailer: {
        fieldType: CnabFieldType.TRAILER,
        fields: [],
        validators: [Cnab400TrailerLineStartValidator],
        fixedContent: cnab400RetornoTrailerFixedContent,
      },
      boleto: {
        fieldType: CnabFieldType.BOLETO,
        fixedContent: cnab400RetornoDetalheFixedContent('7'),
        fields: [
          BancoDoBrasilRetornoFields400.CodigoDeOcorrenciaBoletoField,
          BancoDoBrasilRetornoFields400.ValorPagoBoletoField,
          BancoDoBrasilRetornoFields400.JurosMultaBoletoField,
          BancoDoBrasilRetornoFields400.DataDeOcorrenciaBoletoField,
          BancoDoBrasilRetornoFields400.SeuNumeroBoletoField,
          BancoDoBrasilRetornoFields400.UsoDaEmpresaBoletoField,
          BancoDoBrasilRetornoFields400.NossoNumeroBoletoField
        ],
      },
    }),
  ]
}

export const CNAB_RETORNO_BANK_SCHEMAS: Record<CnabBank, Record<CnabFormat, CnabSchema>> = indexCnabSchemas(registerCnabSchemas())
