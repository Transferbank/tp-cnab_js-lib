import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { optional } from '@cnab/type/cnab-field'
import { CnabSchemaRegistrationException } from '@cnab/exception/cnab-exception'
import { Cnab400HeaderLineStartValidator, Cnab400TrailerLineStartValidator} from '@cnab/validators/cnab400/cnab400-line-start-validator'
import * as Cnab240 from '@cnab/field/cnab240/fields'
import * as Cnab400 from '@cnab/field/cnab400/fields'

import * as Cnab400Sicredi from '@cnab/bank/sicredi/cnab/cnab400/field/fields'
import * as Cnab400Bradesco from '@cnab/bank/bradesco/cnab/cnab400/field/fields'
import * as Cnab400Caixa from '@cnab/bank/caixa/cnab/cnab400/field/fields'
import * as Cnab400Sicoob from '@cnab/bank/sicoob/cnab/cnab400/field/fields'
import * as Cnab240BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'
import * as Cnab400BancoDoBrasil from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/fields'
import * as Cnab240Caixa from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import * as Cnab240Itau from '@cnab/bank/itau/cnab/cnab240/field/fields'
import * as Cnab240Santander from '@cnab/bank/santander/cnab/cnab240/field/fields'
import * as Cnab240Sicredi from '@cnab/bank/sicredi/cnab/cnab240/field/fields'

import { Cnab240BoletoGroupRule } from '@cnab/group-rule/cnab240/boleto-group-rule'
import { Cnab400BoletoGroupRule } from '@cnab/group-rule/cnab400/boleto-group-rule'


function registerCnabSchemas(): CnabSchema[] {
  return [
    // BRADESCO
    new CnabSchema({
      bank: CnabBank.BRADESCO,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BoletoGroupRule(),
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
          Cnab240.NomeBoletoField(),
          Cnab240.VencimentoBoletoField,
          Cnab240.ValorTituloBoletoField,
          Cnab240.DocumentoSacadoBoletoField,
          Cnab240.EnderecoBoletoField,
          Cnab240.BairroBoletoField,
          Cnab240.CepBoletoField,
          Cnab240.CidadeBoletoField,
          Cnab240.UfBoletoField,
          optional(Cnab240.NossoNumeroBoletoField)
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
          Cnab400.NomeBoletoField(),
          Cnab400.VencimentoBoletoField(),
          Cnab400.ValorTituloBoletoField(),
          Cnab400.DocumentoSacadoBoletoField,
          Cnab400.EnderecoBoletoField(),
          Cnab400.CepBoletoField(),
          optional(Cnab400Bradesco.NossoNumeroBoletoField)
        ],
      },
    }),
    // ITAU
    new CnabSchema({
      bank: CnabBank.ITAU,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BoletoGroupRule(),
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
          Cnab240.NomeBoletoField(34, 63),
          Cnab240.VencimentoBoletoField,
          Cnab240.ValorTituloBoletoField,
          Cnab240.DocumentoSacadoBoletoField,
          Cnab240.EnderecoBoletoField,
          Cnab240.BairroBoletoField,
          Cnab240.CepBoletoField,
          Cnab240.CidadeBoletoField,
          Cnab240.UfBoletoField,
          optional(Cnab240Itau.NossoNumeroBoletoField)
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
          Cnab400.NomeBoletoField(235, 264),
          Cnab400.VencimentoBoletoField(),
          Cnab400.ValorTituloBoletoField(),
          Cnab400.DocumentoSacadoBoletoField,
          Cnab400.EnderecoBoletoField(),
          Cnab400.BairroBoletoField(),
          Cnab400.CepBoletoField(),
          Cnab400.CidadeBoletoField(),
          Cnab400.UfBoletoField(),
          optional(Cnab400.NossoNumeroBoletoField)
        ],
      },
    }),
    // SANTANDER
    new CnabSchema({
      bank: CnabBank.SANTANDER,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BoletoGroupRule(),
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
          Cnab240.NomeBoletoField(),
          Cnab240.VencimentoBoletoField,
          Cnab240.ValorTituloBoletoField,
          Cnab240.DocumentoSacadoBoletoField,
          Cnab240.EnderecoBoletoField,
          Cnab240.BairroBoletoField,
          Cnab240.CepBoletoField,
          Cnab240.CidadeBoletoField,
          Cnab240.UfBoletoField,
          optional(Cnab240Santander.NossoNumeroBoletoField)
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
          Cnab400.NomeBoletoField(),
          Cnab400.VencimentoBoletoField(),
          Cnab400.ValorTituloBoletoField(),
          Cnab400.DocumentoSacadoBoletoField,
          Cnab400.EnderecoBoletoField(),
          Cnab400.BairroBoletoField(),
          Cnab400.CepBoletoField(),
          Cnab400.CidadeBoletoField(),
          Cnab400.UfBoletoField(),
          optional(Cnab400.NossoNumeroBoletoField)
        ],
      },
    }),
    // BANCO DO BRASIL
    new CnabSchema({
      bank: CnabBank.BANCODOBRASIL,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BoletoGroupRule(),
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
          Cnab240.NomeBoletoField(),
          Cnab240.VencimentoBoletoField,
          Cnab240.ValorTituloBoletoField,
          Cnab240BancoDoBrasil.DocumentoSacadoBoletoField,
          Cnab240.EnderecoBoletoField,
          Cnab240BancoDoBrasil.BairroBoletoField,
          Cnab240.CepBoletoField,
          Cnab240.CidadeBoletoField,
          Cnab240.UfBoletoField,
          optional(Cnab240.NossoNumeroBoletoField),
          optional(Cnab240BancoDoBrasil.CodigoDeJurosBoletoField),
          optional(Cnab240BancoDoBrasil.DataDeJurosBoletoField),
          optional(Cnab240BancoDoBrasil.JurosBoletoField)
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
          Cnab400.NomeBoletoField(235, 271, '7'),
          Cnab400.VencimentoBoletoField('7'),
          Cnab400.ValorTituloBoletoField('7'),
          Cnab400BancoDoBrasil.DocumentoSacadoBoletoField,
          Cnab400.EnderecoBoletoField(275, 314, '7'),
          Cnab400.BairroBoletoField(315, 326, '7'),
          Cnab400.CepBoletoField('7'),
          Cnab400.CidadeBoletoField('7'),
          Cnab400.UfBoletoField('7'),
          optional(Cnab400BancoDoBrasil.NossoNumeroBoletoField),
          optional(Cnab400BancoDoBrasil.JurosBoletoField)
        ],
      },
    }),
    // CAIXA
    new CnabSchema({
      bank: CnabBank.CAIXA,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BoletoGroupRule(),
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
          Cnab240.NomeBoletoField(),
          Cnab240.VencimentoBoletoField,
          Cnab240.ValorTituloBoletoField,
          Cnab240.DocumentoSacadoBoletoField,
          optional(Cnab240.EnderecoBoletoField),// No manual da Caixa CNAB240, as notas G032 a G036
          optional(Cnab240.BairroBoletoField),  //  descrevem endereço, bairro, CEP, cidade e UF do pagador
          optional(Cnab240.CepBoletoField),    //  como opcionais quando a emissão e a entrega do boleto
          optional(Cnab240.CidadeBoletoField), //  são feitas pelo beneficiário.
          optional(Cnab240.UfBoletoField),
          optional(Cnab240Caixa.NossoNumeroBoletoField)
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
          Cnab400.NomeBoletoField(),
          Cnab400.VencimentoBoletoField(),
          Cnab400.ValorTituloBoletoField(),
          Cnab400.DocumentoSacadoBoletoField,
          Cnab400.EnderecoBoletoField(),
          Cnab400.BairroBoletoField(),
          Cnab400.CepBoletoField(),
          Cnab400.CidadeBoletoField(),
          Cnab400.UfBoletoField(),
          optional(Cnab400Caixa.NossoNumeroBoletoField)
        ],
      },
    }),
    // SICREDI
    new CnabSchema({
      bank: CnabBank.SICREDI,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BoletoGroupRule(),
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
          Cnab240.NomeBoletoField(),
          Cnab240.VencimentoBoletoField,
          Cnab240.ValorTituloBoletoField,
          Cnab240.DocumentoSacadoBoletoField,
          Cnab240.EnderecoBoletoField,
          Cnab240.CepBoletoField,
          Cnab240.CidadeBoletoField,
          Cnab240.UfBoletoField,
          optional(Cnab240Sicredi.NossoNumeroBoletoField)
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
          Cnab400.NomeBoletoField(),
          Cnab400.VencimentoBoletoField(),
          Cnab400.ValorTituloBoletoField(),
          Cnab400Sicredi.DocumentoSacadoBoletoField,
          Cnab400.EnderecoBoletoField(),
          Cnab400.CepBoletoField(),
          optional(Cnab400Sicredi.NossoNumeroBoletoField)
        ],
      },
    }),
    // SICOOB
    new CnabSchema({
      bank: CnabBank.SICOOB,
      fmt: CnabFormat.CNAB240,
      boletoGroupRule: new Cnab240BoletoGroupRule(),
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
          Cnab240.NomeBoletoField(),
          Cnab240.VencimentoBoletoField,
          Cnab240.ValorTituloBoletoField,
          Cnab240.DocumentoSacadoBoletoField,
          Cnab240.EnderecoBoletoField,
          Cnab240.BairroBoletoField,
          Cnab240.CepBoletoField,
          Cnab240.CidadeBoletoField,
          Cnab240.UfBoletoField,
          optional(Cnab240.NossoNumeroBoletoField)
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
          Cnab400.NomeBoletoField(),
          Cnab400.VencimentoBoletoField(),
          Cnab400.ValorTituloBoletoField(),
          Cnab400.DocumentoSacadoBoletoField,
          Cnab400.EnderecoBoletoField(275, 311),
          Cnab400.BairroBoletoField(312, 326),
          Cnab400.CepBoletoField(),
          Cnab400.CidadeBoletoField(),
          Cnab400.UfBoletoField(),
          optional(Cnab400Sicoob.NossoNumeroBoletoField)
        ],
      },
    }),
  ]
}

export function indexCnabSchemas(
  schemas: CnabSchema[]
): Record<CnabBank, Record<CnabFormat, CnabSchema>> {
  const keys = schemas.map((schema: CnabSchema): [CnabBank, CnabFormat] => [
    schema.bank,
    schema.fmt,
  ])

  const counts: Record<string, number> = {}
  for (const [bank, fmt] of keys) {
    const key = `${bank}:${fmt}`
    counts[key] = (counts[key] ?? 0) + 1
  }

  const duplicatedKey = Object.entries(counts).find(([, count]: [string, number]) => count > 1)

  if (duplicatedKey != null) {
    const [key] = duplicatedKey
    const [bank, fmt] = key.split(':') as [CnabBank, CnabFormat]
    throw new CnabSchemaRegistrationException(bank, fmt)
  }

  const indexed: Record<string, Record<string, CnabSchema>> = {}
  for (const schema of schemas) {
    if (indexed[schema.bank] == null) {
      indexed[schema.bank] = {}
    }
    indexed[schema.bank][schema.fmt] = schema
  }

  return indexed as Record<CnabBank, Record<CnabFormat, CnabSchema>>
}

export const CNAB_BANK_SCHEMAS: Record<CnabBank, Record<CnabFormat, CnabSchema>> = indexCnabSchemas(registerCnabSchemas())
